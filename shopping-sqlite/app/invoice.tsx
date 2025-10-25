import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, Alert } from "react-native";
import { CartRepo } from "../src/db/cart.repo";
import { OrderRepo } from "../src/db/order.repo";

export default function InvoiceScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const load = async () => {
    const data = await CartRepo.getCartWithProducts();
    setItems(data);
    setTotal(data.reduce((sum, i) => sum + i.price * i.qty, 0));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCheckout = async () => {
    if (items.length === 0) {
      Alert.alert("Giỏ hàng trống", "Vui lòng thêm sản phẩm trước khi thanh toán.");
      return;
    }
    const id = await OrderRepo.createOrder();
    await OrderRepo.addOrderItems(id);
    await OrderRepo.clearCartAndReduceStock();
    Alert.alert("Thanh toán thành công 🎉", `Mã đơn hàng #${id}`);
    load();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f9fa", padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 12 }}>
        🧾 Hóa đơn
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
            <Text>Số lượng: {item.qty}</Text>
            <Text>Đơn giá: {item.price.toLocaleString()}₫</Text>
            <Text>Tạm tính: {(item.qty * item.price).toLocaleString()}₫</Text>
          </View>
        )}
      />

      <View style={{ borderTopWidth: 1, borderColor: "#ccc", marginTop: 10, paddingTop: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Tổng cộng: {total.toLocaleString()}₫</Text>
        <Button title="💳 Thanh toán" color="#2b9348" onPress={handleCheckout} />
      </View>
    </View>
  );
}
