function columnNames(db, tableName) {
  return db
    .prepare(`PRAGMA table_info(${tableName})`)
    .all()
    .map((column) => column.name);
}

function ensureColumn(db, tableName, columnName, definition) {
  const columns = columnNames(db, tableName);
  if (!columns.includes(columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

export const version = '019_receipt_printer_profile';

export function up(db) {
  // Default xp80 keeps existing XP-80 / XP-80U customers working after upgrade.
  ensureColumn(db, 'settings', 'receipt_printer_profile', "TEXT NOT NULL DEFAULT 'xp80'");
  ensureColumn(db, 'settings', 'receipt_feed_lines', 'INTEGER NOT NULL DEFAULT 5');
}
