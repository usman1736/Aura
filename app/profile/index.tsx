import { useRouter } from "expo-router";
import React from "react";
import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import AuthButton from "../../components/AuthButton";
import { colors } from "../../constants/colors";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/aura-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome to AURA</Text>
        <Text style={styles.subtitle}>Your AI Style Companion</Text>

        <View style={styles.buttonGroup}>
          <AuthButton
            title="Log in"
            onPress={() => router.push("/login" as any)}
          />
          <AuthButton
            title="Sign up"
            variant="secondary"
            onPress={() => router.push("/signup" as any)}
          />
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logo: {
    width: 86,
    height: 86,
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#8B7F7F",
    marginBottom: 44,
  },
  buttonGroup: {
    width: "100%",
  },
});
