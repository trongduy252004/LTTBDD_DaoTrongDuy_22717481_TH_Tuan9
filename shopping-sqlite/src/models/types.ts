export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

export type CartItem = {
  id: number;
  product_id: number;
  quantity: number;
  name?: string;
  price?: number;
};

export type Order = {
  id: number;
  date: string;
  total: number;
};
