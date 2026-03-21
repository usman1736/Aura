import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { logIn } from "../../auth";
import AuthButton from "../../components/AuthButton";
import { colors } from "../../constants/colors";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Enter email and password");
      return;
    }

    try {
      setLoading(true);

      await logIn(email.trim(), password);

      // ✅ ALWAYS go to chat (correct flow)
      router.replace("/chat");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 🔙 BACK ARROW */}
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C2C2C" />
        </Pressable>

        {/* LOGO */}
        <Image
          source={require("../../assets/images/aura-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* TITLE */}
        <Text style={styles.title}>Log in</Text>
        <Text style={styles.subtitle}>Welcome back to Aura</Text>

        {/* EMAIL */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#B2A8A8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        {/* PASSWORD */}
        <TextInput
          placeholder="Password"
          placeholderTextColor="#B2A8A8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {/* LOGIN BUTTON */}
        <AuthButton
          title={loading ? "Logging in..." : "Log in"}
          onPress={handleLogin}
        />

        {/* SIGNUP BUTTON */}
        <Pressable
          style={styles.signupButton}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.signupText}>Don’t have an account? Sign up</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  backButton: {
    marginBottom: 10,
  },

  logo: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2C2C2C",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 13,
    color: "#8B7F7F",
    textAlign: "center",
    marginBottom: 30,
  },

  input: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F3EDED",
    borderWidth: 1,
    borderColor: "#E7DDDD",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#2E2A2A",
    marginBottom: 14,
  },

  signupButton: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#7A2E2E",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },

  signupText: {
    color: "#7A2E2E",
    fontSize: 14,
    fontWeight: "600",
  },
});

