import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { getCartItems, updateCartItem, removeCartItem, clearCart, getCartTotal } from "../src/db/cart.repo";
import { createOrder } from "../src/db/order.repo";
import type { CartItem } from "../src/models/types";

export default function CartScreen() {
  const [items, setItems] = useState<CartItem[]>([]);
  const router = useRouter();

  const load = async () => {
    const data = await getCartItems();
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleInc = async (product_id: number, qty: number) => {
    try {
      await updateCartItem(product_id, qty + 1);
      load();
    } catch (e: any) {
      Alert.alert("Lỗi", e.message || String(e));
    }
  };

  const handleDec = async (product_id: number, qty: number) => {
    try {
      await updateCartItem(product_id, qty - 1);
      load();
    } catch (e: any) {
      Alert.alert("Lỗi", e.message || String(e));
    }
  };

  const handleRemove = async (product_id: number) => {
    await removeCartItem(product_id);
    load();
  };

  const handleClear = async () => {
    await clearCart();
    load();
  };

  const handleCheckout = async () => {
    const orderId = await createOrder();
    if (orderId) {
      Alert.alert("Thanh toán thành công", `Mã đơn hàng #${orderId}`);
      router.push("/invoice");
    } else {
      Alert.alert("Giỏ trống", "Không có sản phẩm để thanh toán.");
    }
    load();
  };

  const total = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giỏ hàng</Text>

      <FlatList
        data={items}
        keyExtractor={(it) => it.id.toString()}
        ListEmptyComponent={<Text>Giỏ hàng trống</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text>{(item.price ?? 0).toLocaleString()}₫</Text>
              <Text>Số lượng: {item.quantity}</Text>
            </View>

            <View style={styles.controls}>
              <Button title="+" onPress={() => handleInc(item.product_id, item.quantity)} />
              <Button title="-" onPress={() => handleDec(item.product_id, item.quantity)} />
              <Button title="Xóa" color="#d62828" onPress={() => handleRemove(item.product_id)} />
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Tổng: {total.toLocaleString()}₫</Text>
        <Button title="Thanh toán" onPress={handleCheckout} disabled={items.length === 0} />
        <Button title="Clear giỏ" onPress={handleClear} color="#d62828" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee", flexDirection: "row", justifyContent: "space-between" },
  name: { fontSize: 16, fontWeight: "600" },
  controls: { justifyContent: "space-around", gap: 6 },
  footer: { marginTop: 12 },
  total: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
});
