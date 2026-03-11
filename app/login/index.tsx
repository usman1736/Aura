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
import AuthButton from "../../components/AuthButton";
import { colors } from "../../constants/colors";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Image
          source={require("../../assets/images/aura-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Log in</Text>
        <Text style={styles.subtitle}>Welcome back to Aura</Text>

        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#B2A8A8"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#B2A8A8"
              secureTextEntry
              style={styles.input}
            />
          </View>

          <AuthButton
            title="Log in"
            onPress={() =>
              Alert.alert("Log in", "Later this will log the user in.")
            }
          />

          <Pressable onPress={() => router.push("/signup" as any)}>
            <Text style={styles.footerText}>
              Don’t have an account?{" "}
              <Text style={styles.footerLink}>Sign up</Text>
            </Text>
          </Pressable>
        </View>
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
    paddingTop: 18,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  logo: {
    width: 72,
    height: 72,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 22,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#8B7F7F",
    textAlign: "center",
    marginBottom: 34,
  },
  form: {
    marginTop: 10,
  },
  inputWrap: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
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
  },
  footerText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 13,
    color: "#8B7F7F",
  },
  footerLink: {
    color: colors.primary,
    fontWeight: "700",
  },
});
