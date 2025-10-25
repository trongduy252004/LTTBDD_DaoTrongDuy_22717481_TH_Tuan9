import { openDatabase } from "./db";
import type { Product } from "../models/types";

export async function getAllProducts(): Promise<Product[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync("SELECT * FROM products ORDER BY id;");
  // depending on SDK, getAllAsync may return array directly or { rows: { _array } }
  // Most SDK54: returns array of rows
  return (rows as any) as Product[];
}

export async function getProductById(id: number): Promise<Product | null> {
  const db = await openDatabase();
  const rows = await db.getAllAsync("SELECT * FROM products WHERE id = ?;", [id]);
  const arr = (rows as any) as Product[];
  return arr.length > 0 ? arr[0] : null;
}

export async function decreaseStock(productId: number, qty: number) {
  const db = await openDatabase();
  await db.runAsync(
    "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?;",
    [qty, productId, qty]
  );
}
