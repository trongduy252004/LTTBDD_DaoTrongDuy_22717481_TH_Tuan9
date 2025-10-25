import * as SQLite from "expo-sqlite";

let _db: SQLite.SQLiteDatabase | null = null;

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;

  // open async database (SDK54 supports openDatabaseAsync)
  // Note: ensure expo-sqlite installed via `npx expo install expo-sqlite`
  // Types from expo-sqlite include .openDatabaseAsync, .execAsync, .getAllAsync, .runAsync
  // Some environments may require restarting TS server after install.
  // @ts-ignore
  _db = await SQLite.openDatabaseAsync("shopping.db");

  // create tables + seed if needed
  const stmts = [
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL CHECK(price >= 0),
      stock INTEGER NOT NULL CHECK(stock >= 0)
    );`,
    `CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      FOREIGN KEY (product_id) REFERENCES products (id)
    );`,
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      total REAL NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );`,
  ];

  // execute statements individually (some runtimes don't accept multiple statements in one call)
  for (const s of stmts) {
    await _db.execAsync(s);
  }

  // Simple development-time migration: if the products table doesn't have 'id', recreate tables.
  // Note: DROP + recreate will erase data; suitable for local/dev only. For production, implement a proper migration.
  const prodInfo = (await _db.getAllAsync("PRAGMA table_info(products);")) as any[];
  const hasId = Array.isArray(prodInfo) && prodInfo.some((c) => c && c.name === "id");
  if (!hasId) {
    console.warn("Detected products table without 'id' column. Recreating DB schema (dev only).");
    const drops = ["DROP TABLE IF EXISTS order_items;", "DROP TABLE IF EXISTS orders;", "DROP TABLE IF EXISTS cart;", "DROP TABLE IF EXISTS products;"];
    for (const d of drops) {
      try {
        await _db.execAsync(d);
      } catch (err) {
        // continue even if drop fails
        console.warn("Drop table failed (ignorable):", err);
      }
    }
    for (const s of stmts) await _db.execAsync(s);
  }

  const rows = await _db.getAllAsync("SELECT COUNT(*) as c FROM products;");
  // some implementations return array directly
  const count = (rows && (rows as any)[0]?.c) ?? 0;
  if (count === 0) {
    await _db.execAsync(
      `INSERT INTO products (name, price, stock) VALUES
      ('Áo thun nam', 120000, 100),
      ('Quần jean nữ', 250000, 50),
      ('Giày sneaker', 450000, 70),
      ('Túi xách thời trang', 300000, 30);`
    );
  }

  return _db!;
}

// helper to run raw SQL and return database-specific result
export async function exec(sql: string, params: any[] = []) {
  const db = await openDatabase();
  return await db.runAsync(sql, params);
}
