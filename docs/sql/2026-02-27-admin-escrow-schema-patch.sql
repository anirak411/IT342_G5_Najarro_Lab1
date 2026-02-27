-- TradeOff MySQL patch for admin role + escrow transactions
-- Applied against database: Najarro_Lab1
-- Date: 2026-02-27

-- 1) Ensure users.role has a safe default
ALTER TABLE users
    MODIFY COLUMN role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';

-- 2) Backfill any legacy rows without role value
UPDATE users
SET role = 'USER'
WHERE role IS NULL OR role = '';

-- 3) Add indexes used by escrow transaction queries (safe to rerun)
SET @db_name = DATABASE();

SET @idx_count = (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = @db_name
      AND table_name = 'transactions'
      AND index_name = 'idx_transactions_item_status'
);
SET @sql = IF(
    @idx_count = 0,
    'CREATE INDEX idx_transactions_item_status ON transactions(item_id, status)',
    'SELECT ''idx_transactions_item_status already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_count = (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = @db_name
      AND table_name = 'transactions'
      AND index_name = 'idx_transactions_buyer_email'
);
SET @sql = IF(
    @idx_count = 0,
    'CREATE INDEX idx_transactions_buyer_email ON transactions(buyer_email)',
    'SELECT ''idx_transactions_buyer_email already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_count = (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = @db_name
      AND table_name = 'transactions'
      AND index_name = 'idx_transactions_seller_email'
);
SET @sql = IF(
    @idx_count = 0,
    'CREATE INDEX idx_transactions_seller_email ON transactions(seller_email)',
    'SELECT ''idx_transactions_seller_email already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_count = (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = @db_name
      AND table_name = 'transactions'
      AND index_name = 'idx_transactions_created_at'
);
SET @sql = IF(
    @idx_count = 0,
    'CREATE INDEX idx_transactions_created_at ON transactions(created_at)',
    'SELECT ''idx_transactions_created_at already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Optional: promote one existing user as admin (edit email first)
-- UPDATE users
-- SET role = 'ADMIN'
-- WHERE email = 'your-email@example.com';
