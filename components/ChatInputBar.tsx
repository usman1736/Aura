import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

type ChatInputBarProps = {
  value?: string;
  onChangeText: (text: string) => void;
  onImagePress?: () => void;
  onMicPress?: () => void;
  onSendPress: () => void;
  hasSelectedImage?: boolean;
};

export default function ChatInputBar({
  value = "",
  onChangeText,
  onImagePress,
  onMicPress,
  onSendPress,
  hasSelectedImage = false,
}: ChatInputBarProps) {
  const hasText = value.trim().length > 0;
  const canSend = hasText || hasSelectedImage;

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Ask Aura..."
          placeholderTextColor="#999"
          style={styles.input}
        />

        <View style={styles.rightIcons}>
          {canSend ? (
            <Pressable onPress={onSendPress} style={styles.sendButton}>
              <Ionicons name="send" size={18} color="#fff" />
            </Pressable>
          ) : (
            <>
              <Pressable onPress={onImagePress} style={styles.iconBtn}>
                <Ionicons name="image-outline" size={20} color="#444" />
              </Pressable>

              <Pressable onPress={onMicPress} style={styles.iconBtn}>
                <Ionicons name="mic-outline" size={20} color="#444" />
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 25,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    marginLeft: 8,
    padding: 4,
  },
  sendButton: {
    backgroundColor: "#4F46E5",
    padding: 8,
    borderRadius: 20,
    marginLeft: 6,
  },
});
