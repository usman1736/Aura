import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../constants/colors";

type Props = {
  title: string;
  variant?: "primary" | "secondary";
  onPress?: () => void;
};

export default function AuthButton({
  title,
  variant = "primary",
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        variant === "primary" ? styles.primaryButton : styles.secondaryButton,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === "primary" ? styles.primaryText : styles.secondaryText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: "#F3EDED",
    borderWidth: 1,
    borderColor: "#E7DDDD",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: colors.primary,
  },
});
