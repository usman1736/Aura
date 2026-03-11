import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../constants/colors";

type PromptChipProps = {
  title: string;
  onPress?: () => void;
};

export default function PromptChip({ title, onPress }: PromptChipProps) {
  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "#F3EDED",
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E7DDDD",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
