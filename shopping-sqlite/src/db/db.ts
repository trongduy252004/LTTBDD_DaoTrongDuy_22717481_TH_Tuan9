import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("shopping.db");

export async function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS products (
      product_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL CHECK(price >= 0),
      stock INTEGER NOT NULL CHECK(stock >= 0)
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      qty INTEGER NOT NULL CHECK(qty > 0),
      UNIQUE(product_id),
      FOREIGN KEY(product_id) REFERENCES products(product_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_date TEXT NOT NULL,
      total REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      qty INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(order_id),
      FOREIGN KEY(product_id) REFERENCES products(product_id)
    );
  `);

  // Seed sample products
  const count = db.getFirstSync<{ count: number }>("SELECT COUNT(*) as count FROM products")!.count;
  if (count === 0) {
    db.execSync(`
      INSERT INTO products (product_id, name, price, stock) VALUES
      ('p1', 'Áo thun nam', 120000, 10),
      ('p2', 'Quần jean nữ', 250000, 5),
      ('p3', 'Giày sneaker', 450000, 7),
      ('p4', 'Túi xách thời trang', 300000, 3);
    `);
  }
}
