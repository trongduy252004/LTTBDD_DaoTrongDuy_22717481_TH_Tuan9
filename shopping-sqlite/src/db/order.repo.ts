import { openDatabase } from "./db";
import type { Order } from "../models/types";

export async function createOrder(): Promise<number | null> {
  const db = await openDatabase();
  // fetch cart items with price
  const cartItems = (await db.getAllAsync(`
    SELECT c.product_id, c.quantity, p.price
    FROM cart c JOIN products p ON p.id = c.product_id;
  `)) as any[];

  if (!cartItems || cartItems.length === 0) return null;

  const total = cartItems.reduce((s, it) => s + it.price * it.quantity, 0);
  const date = new Date().toISOString();

  // insert order
  await db.runAsync("INSERT INTO orders (date, total) VALUES (?, ?);", [date, total]);

  // get last insert id (SQLite last_insert_rowid())
  const last = (await db.getAllAsync("SELECT last_insert_rowid() as id;")) as any[];
  const orderId = last && last[0] ? last[0].id : null;
  if (!orderId) return null;

  // insert order_items & reduce stock
  for (const it of cartItems) {
    await db.runAsync(
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?);",
      [orderId, it.product_id, it.quantity, it.price]
    );
    await db.runAsync(
      "UPDATE products SET stock = stock - ? WHERE id = ?;",
      [it.quantity, it.product_id]
    );
  }

  // clear cart
  await db.execAsync("DELETE FROM cart;");

  return orderId;
}

export async function getAllOrders(): Promise<Order[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync("SELECT * FROM orders ORDER BY id DESC;");
  return (rows as any) as Order[];
}

export async function getOrderItems(orderId: number) {
  const db = await openDatabase();
  const rows = await db.getAllAsync(
    "SELECT oi.*, p.name FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?;",
    [orderId]
  );
  return (rows as any) as any[];
}
