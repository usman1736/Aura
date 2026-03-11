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
import AuthButton from "../../components/AuthButton";
import { colors } from "../../constants/colors";

export default function SignupScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleCreateAccount = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Missing information", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }

    if (!agreeToTerms) {
      Alert.alert("Terms required", "Please agree to the terms to continue.");
      return;
    }

    Alert.alert("Create account", "Later this will create the user account.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Image
          source={require("../../assets/images/aura-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Join Aura and start building smarter outfit ideas
        </Text>

        <View style={styles.socialRow}>
          <Pressable
            style={styles.socialButton}
            onPress={() =>
              Alert.alert(
                "Google sign up",
                "Later this will continue with Google.",
              )
            }
          >
            <Ionicons name="logo-google" size={18} color={colors.primary} />
            <Text style={styles.socialText}>Google</Text>
          </Pressable>

          <Pressable
            style={styles.socialButton}
            onPress={() =>
              Alert.alert(
                "Apple sign up",
                "Later this will continue with Apple.",
              )
            }
          >
            <Ionicons name="logo-apple" size={18} color={colors.primary} />
            <Text style={styles.socialText}>Apple</Text>
          </Pressable>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or sign up with email</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#B2A8A8"
              style={styles.input}
            />
          </View>

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
            <View style={styles.passwordWrap}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                placeholderTextColor="#B2A8A8"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
              />
              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.primary}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Confirm password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                placeholderTextColor="#B2A8A8"
                secureTextEntry={!showConfirmPassword}
                style={styles.passwordInput}
              />
              <Pressable
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.primary}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={styles.termsRow}
            onPress={() => setAgreeToTerms((prev) => !prev)}
          >
            <View
              style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}
            >
              {agreeToTerms && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>

            <Text style={styles.termsText}>
              I agree to the{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </Pressable>

          <AuthButton title="Create account" onPress={handleCreateAccount} />

          <Pressable onPress={() => router.push("/login" as any)}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.footerLink}>Log in</Text>
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
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 2,
  },
  logo: {
    width: 72,
    height: 72,
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 18,
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
    marginBottom: 26,
    paddingHorizontal: 12,
  },
  socialRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  socialButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F8F4F4",
    borderWidth: 1,
    borderColor: "#E7DDDD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  socialText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E7DDDD",
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: "#8B7F7F",
    fontWeight: "500",
  },
  form: {
    marginTop: 2,
  },
  inputWrap: {
    marginBottom: 16,
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
  passwordWrap: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F3EDED",
    borderWidth: 1,
    borderColor: "#E7DDDD",
    paddingLeft: 14,
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: "#2E2A2A",
  },
  eyeButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D8CACA",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#8B7F7F",
  },
  termsLink: {
    color: colors.primary,
    fontWeight: "700",
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
