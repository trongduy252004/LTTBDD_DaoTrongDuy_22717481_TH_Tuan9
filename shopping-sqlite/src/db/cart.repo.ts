import { openDatabase } from "./db";
import type { CartItem } from "../models/types";

export async function getCartItems(): Promise<CartItem[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync(`
    SELECT c.id, c.product_id, c.quantity, p.name, p.price
    FROM cart c
    JOIN products p ON p.id = c.product_id
    ORDER BY c.id;
  `);
  return (rows as any) as CartItem[];
}

export async function addToCart(productId: number, qty: number = 1): Promise<boolean> {
  const db = await openDatabase();

  // check product stock
  const prod = await db.getAllAsync("SELECT stock FROM products WHERE id = ?;", [productId]);
  const stock = (prod as any)[0]?.stock ?? 0;
  if (stock < qty) return false;

  const existing = await db.getAllAsync("SELECT id, quantity FROM cart WHERE product_id = ?;", [productId]);
  const arr = (existing as any) as { id: number; quantity: number }[];
  if (arr.length > 0) {
    // ensure not exceed stock
    const newQty = arr[0].quantity + qty;
    if (newQty > stock) return false;
    await db.runAsync("UPDATE cart SET quantity = ? WHERE product_id = ?;", [newQty, productId]);
  } else {
    await db.runAsync("INSERT INTO cart (product_id, quantity) VALUES (?, ?);", [productId, qty]);
  }
  return true;
}

export async function updateCartItem(productId: number, qty: number) {
  const db = await openDatabase();
  if (qty <= 0) {
    await db.runAsync("DELETE FROM cart WHERE product_id = ?;", [productId]);
    return;
  }
  const prod = await db.getAllAsync("SELECT stock FROM products WHERE id = ?;", [productId]);
  const stock = (prod as any)[0]?.stock ?? 0;
  if (qty > stock) throw new Error("Quantity exceeds stock");
  await db.runAsync("UPDATE cart SET quantity = ? WHERE product_id = ?;", [qty, productId]);
}

export async function removeCartItem(productId: number) {
  const db = await openDatabase();
  await db.runAsync("DELETE FROM cart WHERE product_id = ?;", [productId]);
}

export async function clearCart() {
  const db = await openDatabase();
  await db.execAsync("DELETE FROM cart;");
}

export async function getCartTotal(): Promise<number> {
  const db = await openDatabase();
  const rows = await db.getAllAsync(`
    SELECT SUM(c.quantity * p.price) as total
    FROM cart c JOIN products p ON c.product_id = p.id;
  `);
  const total = (rows as any)[0]?.total ?? 0;
  return total;
}
