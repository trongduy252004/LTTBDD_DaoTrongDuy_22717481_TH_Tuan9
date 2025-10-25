import { db } from "./db";

export const CartRepo = {
  async getCartWithProducts() {
    return db.getAllSync(`
      SELECT c.product_id, p.name, p.price, c.qty
      FROM cart_items c
      JOIN products p ON p.product_id = c.product_id
    `);
  },

  async addToCart(productId: string) {
    const product = db.getFirstSync<any>(
      "SELECT stock FROM products WHERE product_id = ?",
      [productId]
    );
    if (!product) return false;
    const item = db.getFirstSync<any>(
      "SELECT qty FROM cart_items WHERE product_id = ?",
      [productId]
    );

    if (!item) {
      db.runSync("INSERT INTO cart_items (product_id, qty) VALUES (?, 1)", [productId]);
      return true;
    }
    if (item.qty < product.stock) {
      db.runSync("UPDATE cart_items SET qty = qty + 1 WHERE product_id = ?", [productId]);
      return true;
    }
    return false;
  },

  async updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      db.runSync("DELETE FROM cart_items WHERE product_id = ?", [productId]);
      return;
    }
    const stock = db.getFirstSync<any>(
      "SELECT stock FROM products WHERE product_id = ?",
      [productId]
    )?.stock;
    if (qty > stock) return;
    db.runSync("UPDATE cart_items SET qty = ? WHERE product_id = ?", [qty, productId]);
  },

  async remove(productId: string) {
    db.runSync("DELETE FROM cart_items WHERE product_id = ?", [productId]);
  },
};
