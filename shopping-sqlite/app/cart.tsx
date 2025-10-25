import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button } from "react-native";
import { useRouter } from "expo-router";
import { CartRepo } from "../src/db/cart.repo";

export default function CartScreen() {
  const [items, setItems] = useState<any[]>([]);
  const router = useRouter();

  const load = async () => {
    const data = await CartRepo.getCartWithProducts();
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f9fa", padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
        🛒 Giỏ hàng
      </Text>

      <FlatList
        data={items}
        keyExtractor={(i) => i.product_id}
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
            <Text>Số lượng: {item.qty}</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Button title="+" onPress={() => CartRepo.updateQty(item.product_id, item.qty + 1).then(load)} />
              <Button title="-" onPress={() => CartRepo.updateQty(item.product_id, item.qty - 1).then(load)} />
              <Button title="🗑️" color="#d62828" onPress={() => CartRepo.remove(item.product_id).then(load)} />
            </View>
          </View>
        )}
      />

      <Button title="🧾 Xem hóa đơn" color="#2b9348" onPress={() => router.push("/invoice")} />
    </View>
  );
}
