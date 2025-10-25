import { db } from "./db";

export const ProductRepo = {
  async getAll() {
    const res = db.getAllSync("SELECT * FROM products");
    return res;
  },
};
