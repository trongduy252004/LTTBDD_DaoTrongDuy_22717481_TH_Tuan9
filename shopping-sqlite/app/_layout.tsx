import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { openDatabase } from "../src/db/db";

export default function Layout() {
  useEffect(() => {
    // ensure DB initialized when app starts
    (async () => {
      try {
        await openDatabase();
      } catch (e) {
        console.warn("DB init error:", e);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerStyle: { backgroundColor: "#2b9348" }, headerTintColor: "#fff" }} />
    </SafeAreaView>
  );
}
