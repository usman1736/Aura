import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

export default function WelcomeCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Your AI style assistant</Text>

      <Text style={styles.description}>
        Ask for outfit ideas, upload clothing photos, or use your voice to get
        fashion help instantly.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F3EDED",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E7DDDD",
    marginBottom: 18,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: "#7E6E6E",
    fontWeight: "500",
  },
});
