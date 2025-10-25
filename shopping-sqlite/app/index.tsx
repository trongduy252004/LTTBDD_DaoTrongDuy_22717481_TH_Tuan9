import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ProductRepo } from "../src/db/product.repo";
import { CartRepo } from "../src/db/cart.repo";
import { initDatabase } from "../src/db/db";

export default function ProductScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

  const load = async () => {
    await initDatabase();
    const data = await ProductRepo.getAll();
    setProducts(data);
  };

  const addToCart = async (productId: string) => {
    const ok = await CartRepo.addToCart(productId);
    if (ok) Alert.alert("🛒", "Đã thêm vào giỏ!");
    else Alert.alert("⚠️", "Không đủ tồn kho!");
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f8f9fa" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
        🛍️ Danh sách sản phẩm
      </Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.product_id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#fff",
              padding: 12,
              borderRadius: 12,
              marginBottom: 10,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
            <Text>Giá: {item.price.toLocaleString()}₫</Text>
            <Text>Tồn kho: {item.stock}</Text>
            <Button title="Thêm vào giỏ" onPress={() => addToCart(item.product_id)} />
          </View>
        )}
      />
      <Button title="🛒 Xem giỏ hàng" color="#2b9348" onPress={() => router.push("/cart")} />
    </View>
  );
}
