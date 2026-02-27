#!/usr/bin/env python3
"""One-time migration: local MySQL -> Supabase PostgreSQL."""

import os
import ssl
import sys
from datetime import datetime, timezone

import pg8000.dbapi
import pymysql


TABLES = [
    "users",
    "items",
    "messages",
    "transactions",
    "refresh_tokens",
]


def normalize_row(table: str, cols: list[str], row: tuple) -> tuple:
    values = list(row)

    if table == "items":
        try:
            created_at_index = cols.index("created_at")
            if values[created_at_index] is None:
                # Backfill legacy null timestamps to satisfy stricter Postgres schemas.
                values[created_at_index] = datetime.now(timezone.utc).replace(tzinfo=None)
        except ValueError:
            pass

    return tuple(values)


def env(name: str, default: str | None = None, required: bool = False) -> str:
    value = os.getenv(name, default)
    if required and value is None:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value  # type: ignore[return-value]


def main() -> int:
    try:
        mysql_conn = pymysql.connect(
            host=env("MYSQL_HOST", "127.0.0.1"),
            port=int(env("MYSQL_PORT", "3306")),
            user=env("MYSQL_USER", required=True),
            password=env("MYSQL_PASSWORD", required=True),
            database=env("MYSQL_DB", required=True),
            charset="utf8mb4",
        )

        ssl_mode = env("PG_SSLMODE", "require").lower()
        if ssl_mode in ("disable", "allow", "prefer"):
            ssl_context = None
        elif ssl_mode == "require":
            # Match libpq "require": use TLS but do not verify CA/hostname.
            ssl_context = ssl._create_unverified_context()
        else:
            # verify-ca / verify-full behavior
            ssl_context = ssl.create_default_context()

        pg_conn = pg8000.dbapi.connect(
            host=env("PG_HOST", required=True),
            port=int(env("PG_PORT", "5432")),
            database=env("PG_DB", "postgres"),
            user=env("PG_USER", required=True),
            password=env("PG_PASSWORD", required=True),
            ssl_context=ssl_context,
        )
    except Exception as exc:
        print(f"Connection failed: {exc}")
        return 1

    try:
        my = mysql_conn.cursor()
        pg = pg_conn.cursor()

        my.execute("SHOW TABLES")
        mysql_tables = {row[0] for row in my.fetchall()}

        pg.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        )
        pg_tables = {row[0] for row in pg.fetchall()}

        tables = [t for t in TABLES if t in mysql_tables and t in pg_tables]
        if not tables:
            raise RuntimeError(
                "No matching tables found. Run docs/sql/supabase-tradeoff-schema.sql first."
            )

        quoted_tables = ", ".join([f'"{table}"' for table in tables])
        pg.execute(f"TRUNCATE TABLE {quoted_tables} RESTART IDENTITY CASCADE")

        for table in tables:
            my.execute(f"SELECT * FROM `{table}`")
            rows = my.fetchall()
            cols = [desc[0] for desc in my.description]

            if not rows:
                print(f"Skipped (empty): {table}")
                continue

            column_sql = ", ".join([f'"{c}"' for c in cols])
            placeholders = ", ".join(["%s"] * len(cols))
            insert_sql = f'INSERT INTO "{table}" ({column_sql}) VALUES ({placeholders})'
            normalized_rows = [normalize_row(table, cols, row) for row in rows]
            pg.executemany(insert_sql, normalized_rows)
            print(f"Copied: {table} ({len(rows)} rows)")

        # Keep identity sequences in sync after explicit id inserts.
        for table in tables:
            pg.execute(f"SELECT pg_get_serial_sequence('public.{table}', 'id')")
            result = pg.fetchone()
            sequence_name = result[0] if result else None
            if not sequence_name:
                continue
            pg.execute(
                f"""
                SELECT setval(
                    '{sequence_name}',
                    COALESCE((SELECT MAX(id) FROM "{table}"), 1),
                    COALESCE((SELECT MAX(id) FROM "{table}"), 0) > 0
                )
                """
            )

        pg_conn.commit()
        print("Migration complete.")
        return 0
    except Exception as exc:
        pg_conn.rollback()
        print(f"Migration failed: {exc}")
        return 1
    finally:
        try:
            my.close()
            pg.close()
            mysql_conn.close()
            pg_conn.close()
        except Exception:
            pass


if __name__ == "__main__":
    sys.exit(main())
