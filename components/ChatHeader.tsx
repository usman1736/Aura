import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

type ChatHeaderProps = {
  onMenuPress?: () => void;
};

export default function ChatHeader({ onMenuPress }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Pressable onPress={onMenuPress} style={styles.iconButton}>
        <Image
          source={require("../assets/icons/menu.png")}
          style={styles.menuIcon}
          resizeMode="contain"
        />
      </Pressable>

      <Text style={styles.title}>Aura</Text>

      <Pressable
        onPress={() => router.push("/profile" as any)}
        style={styles.iconButton}
      >
        <Image
          source={require("../assets/icons/profile.png")}
          style={styles.profileIcon}
          resizeMode="contain"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 72,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#D8D4D4",
    backgroundColor: colors.background,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  profileIcon: {
    width: 28,
    height: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
});
