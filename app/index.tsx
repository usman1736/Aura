import { router } from "expo-router";
import React from "react";
import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";

export default function HomeScreen() {
  const handleGetStarted = () => {
    router.push("/chat");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require("../assets/images/aura-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>AURA – AI Style Companion</Text>

        <Text style={styles.subtitle}>Your AI Fashion Assistant</Text>

        <Image
          source={require("../assets/images/hero-fashion.png")}
          style={styles.heroImage}
          resizeMode="contain"
        />

        <Text style={styles.description}>
          Discover outfits, organize your wardrobe, and get personalized style
          recommendations powered by AI.
        </Text>

        <PrimaryButton title="Get Started" onPress={handleGetStarted} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingTop: 70,
    paddingHorizontal: 20,
  },

  logo: {
    width: 96,
    height: 96,
    marginBottom: 18,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6A2E2C",
    textAlign: "center",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999393",
    textAlign: "center",
    marginBottom: 24,
  },

  heroImage: {
    width: 340,
    height: 170,
    marginBottom: 24,
  },

  description: {
    width: 300,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
    color: "#999393",
    textAlign: "center",
    marginBottom: 28,
  },
});
