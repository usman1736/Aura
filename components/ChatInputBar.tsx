import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, TextInput, View } from "react-native";
import { colors } from "../constants/colors";

type ChatInputBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onPlusPress?: () => void;
  onImagePress?: () => void;
  onMicPress?: () => void;
};

export default function ChatInputBar({
  value,
  onChangeText,
  onPlusPress,
  onImagePress,
  onMicPress,
}: ChatInputBarProps) {
  return (
    <View style={styles.wrapper}>
      <Pressable onPress={onPlusPress} style={styles.plusButton}>
        <Image
          source={require("../assets/icons/plus.png")}
          style={styles.plusIcon}
          resizeMode="contain"
        />
      </Pressable>

      <View style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Ask Aura about your style"
          placeholderTextColor="#B5AFAF"
          style={styles.input}
        />

        <View style={styles.rightIcons}>
          <Pressable onPress={onImagePress} style={styles.actionButton}>
            <Ionicons name="image-outline" size={19} color={colors.primary} />
          </Pressable>

          <Pressable onPress={onMicPress} style={styles.actionButton}>
            <Ionicons name="mic-outline" size={19} color={colors.primary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: "#EEE7E7",
  },
  plusButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#EFEAEA",
  },
  plusIcon: {
    width: 15,
    height: 15,
  },
  inputContainer: {
    flex: 1,
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: "#EFEAEA",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: "#3E3A3A",
    paddingVertical: 10,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
});
