# MySQL (Workbench) -> Supabase Migration

Use this once to move your local MySQL data to Supabase and then run only Supabase in production.

## 1) Prerequisite

Run schema setup first in Supabase SQL Editor:

- `docs/sql/supabase-tradeoff-schema.sql`

## 2) Install migration dependencies

```bash
cd /Users/monicanajarro/IT342_G5_Najarro_Lab1
python3 -m pip install --user -r scripts/migration/requirements.txt
```

## 3) Set environment variables

```bash
export MYSQL_HOST=127.0.0.1
export MYSQL_PORT=3306
export MYSQL_USER=root
export MYSQL_PASSWORD='YOUR_MYSQL_PASSWORD'
export MYSQL_DB='Najarro_Lab1'

export PG_HOST='db.sxzdsgtjkfnzeedgbqhb.supabase.co'
export PG_PORT=5432
export PG_DB='postgres'
export PG_USER='postgres'
export PG_PASSWORD='YOUR_SUPABASE_DB_PASSWORD'
export PG_SSLMODE='require'
```

## 4) Run migration

```bash
python3 scripts/migration/mysql_to_supabase.py
```

Expected output:
- `Copied: users (...)`
- `Copied: items (...)`
- `Copied: messages (...)`
- `Copied: transactions (...)`
- `Migration complete.`

## 5) Verify row counts

In Supabase SQL Editor:

```sql
select 'users' as table_name, count(*) from users
union all
select 'items', count(*) from items
union all
select 'messages', count(*) from messages
union all
select 'transactions', count(*) from transactions
union all
select 'refresh_tokens', count(*) from refresh_tokens;
```

## 6) Make Supabase your only DB

1. In Render backend service, keep only Supabase DB env vars:
   - `SPRING_DATASOURCE_URL=jdbc:postgresql://db.sxzdsgtjkfnzeedgbqhb.supabase.co:5432/postgres?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME=postgres`
   - `SPRING_DATASOURCE_PASSWORD=<supabase-db-password>`
2. Redeploy backend.
3. Confirm the app can create a new listing and transaction in Supabase.
4. Stop using local MySQL for the app (Workbench can still be used as a client tool only).
