import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";
import SearchBar from "./SearchBar";

type SidebarProps = {
  searchValue: string;
  onChangeSearch: (text: string) => void;
  onNewChatPress?: () => void;
  onItemPress?: (label: string) => void;
};

const chatHistory = [
  "Sed mollis viverra ligula",
  "eu bibendum",
  "est aliquam eget",
  "Phasellus",
];

export default function Sidebar({
  searchValue,
  onChangeSearch,
  onNewChatPress,
  onItemPress,
}: SidebarProps) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.topArea}>
        <SearchBar value={searchValue} onChangeText={onChangeSearch} />

        <Pressable style={styles.newChatRow} onPress={onNewChatPress}>
          <Image
            source={require("../assets/icons/aura-avatar.png")}
            style={styles.avatar}
            resizeMode="contain"
          />
          <Text style={styles.newChatText}>New Chat</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.list}>
        {chatHistory.map((item, index) => {
          const isSelected = index === 0;

          return (
            <Pressable
              key={item}
              style={[styles.historyItem, isSelected && styles.selectedItem]}
              onPress={() => onItemPress?.(item)}
            >
              <Text style={styles.historyText}>{item}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 176,
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: "#DAD4D4",
    height: "100%",
  },
  topArea: {
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 10,
  },
  newChatRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 2,
  },
  avatar: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  newChatText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111111",
  },
  divider: {
    height: 1,
    backgroundColor: "#DDD7D7",
  },
  list: {
    paddingTop: 12,
    paddingHorizontal: 6,
  },
  historyItem: {
    minHeight: 32,
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedItem: {
    backgroundColor: "#F1EEEE",
  },
  historyText: {
    fontSize: 12,
    color: "#1F1F1F",
    lineHeight: 16,
  },
});
