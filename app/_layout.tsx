import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* wrap everything */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </AuthProvider>
  );
}
