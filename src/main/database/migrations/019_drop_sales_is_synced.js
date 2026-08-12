export const version = '019_drop_sales_is_synced';

/**
 * Remove unused cloud-sync ghost column. No sync pipeline existed in V1.
 * SQLite 3.35+ DROP COLUMN (bundled with better-sqlite3).
 */
export function up(db) {
  db.exec('DROP INDEX IF EXISTS idx_sales_is_synced');

  const columns = db
    .prepare('PRAGMA table_info(sales)')
    .all()
    .map((column) => column.name);

  if (columns.includes('is_synced')) {
    db.exec('ALTER TABLE sales DROP COLUMN is_synced');
  }
}
