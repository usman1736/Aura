import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { ChatProvider } from "../context/ChatContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </ChatProvider>
    </AuthProvider>
  );
}
