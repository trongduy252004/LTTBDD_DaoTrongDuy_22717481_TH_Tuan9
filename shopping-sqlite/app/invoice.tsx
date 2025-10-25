import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { getAllOrders, getOrderItems } from "../src/db/order.repo";
import type { Order } from "../src/models/types";
import { useRouter } from "expo-router";

export default function InvoiceScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  const load = async () => {
    const o = await getAllOrders();
    setOrders(o);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch sử đơn hàng</Text>

      <FlatList
        data={orders}
        keyExtractor={(it) => it.id.toString()}
        ListEmptyComponent={<Text>Chưa có đơn hàng</Text>}
        renderItem={({ item }) => <OrderCard order={item} />}
      />
    </View>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const rows = await getOrderItems(order.id);
      setItems(rows);
    })();
  }, [order.id]);

  return (
    <View style={styles.card}>
      <Text style={styles.date}>{new Date(order.date).toLocaleString()}</Text>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id.toString()}
        renderItem={({ item }) => (
          <Text>
            {item.name} x{item.quantity} — {(item.price * item.quantity).toLocaleString()}₫
          </Text>
        )}
      />
      <Text style={styles.total}>Tổng: {order.total.toLocaleString()}₫</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#f9f9f9" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 10 },
  date: { color: "#666", marginBottom: 6 },
  total: { fontWeight: "700", marginTop: 8 },
});
