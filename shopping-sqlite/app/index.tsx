import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { getAllProducts } from "../src/db/product.repo";
import { addToCart } from "../src/db/cart.repo";
import type { Product } from "../src/models/types";

export default function IndexScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    const list = await getAllProducts();
    setProducts(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (p: Product) => {
    const ok = await addToCart(p.id, 1);
    if (ok) {
      alert("Đã thêm vào giỏ!");
      load();
    } else {
      alert("Không đủ tồn kho!");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách sản phẩm</Text>
      <FlatList
        data={products}
        keyExtractor={(it) => it.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{item.price.toLocaleString()}₫</Text>
            <Text style={styles.stock}>Còn: {item.stock}</Text>
            <Button title="Thêm vào giỏ" onPress={() => handleAdd(item)} disabled={item.stock <= 0} />
          </View>
        )}
      />
      <View style={{ marginTop: 10 }}>
        <Button title="Xem Giỏ hàng" onPress={() => router.push("/cart")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#f9f9f9" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: "600" },
  price: { color: "#007aff", marginTop: 6 },
  stock: { color: "#666", marginTop: 4, marginBottom: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
