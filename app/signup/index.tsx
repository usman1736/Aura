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

import { signUp } from "../../auth";
import AuthButton from "../../components/AuthButton";
import { colors } from "../../constants/colors";

export default function SignupScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      await signUp(email, password);
      router.replace("/chat");
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Aura today</Text>

        {/* INPUTS */}
        <TextInput
          placeholder="First Name"
          placeholderTextColor="#B2A8A8"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />

        <TextInput
          placeholder="Last Name"
          placeholderTextColor="#B2A8A8"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#B2A8A8"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#B2A8A8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#B2A8A8"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
        />

        {/* SIGN UP BUTTON */}
        <AuthButton title="Sign up" onPress={handleSignup} />

        {/* LOGIN BUTTON */}
        <Pressable
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginText}>Already have an account? Log in</Text>
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
  loginButton: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#7A2E2E",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  loginText: {
    color: "#7A2E2E",
    fontSize: 14,
    fontWeight: "600",
  },
});
