import { db } from "./db";

export const OrderRepo = {
  async createOrder() {
    const total = db.getFirstSync<{ total: number }>(
      `SELECT SUM(c.qty * p.price) as total
       FROM cart_items c JOIN products p ON c.product_id = p.product_id`
    )?.total ?? 0;
    const date = new Date().toLocaleString();
    const res = db.runSync("INSERT INTO orders (order_date, total) VALUES (?, ?)", [date, total]);
    return res.lastInsertRowId!;
  },

  async addOrderItems(orderId: number) {
    db.runSync(`
      INSERT INTO order_items (order_id, product_id, qty, price)
      SELECT ?, c.product_id, c.qty, p.price
      FROM cart_items c JOIN products p ON c.product_id = p.product_id
    `, [orderId]);
  },

  async clearCartAndReduceStock() {
    db.runSync(`
      UPDATE products
      SET stock = stock - (
        SELECT qty FROM cart_items WHERE cart_items.product_id = products.product_id
      )
      WHERE product_id IN (SELECT product_id FROM cart_items)
    `);
    db.runSync("DELETE FROM cart_items");
  },
};
