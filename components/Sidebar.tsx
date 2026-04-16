import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";
import { useChat } from "../context/ChatContext";
import SearchBar from "./SearchBar";

type SidebarProps = {
  searchValue: string;
  onChangeSearch: (text: string) => void;
  onClose?: () => void;
};

export default function Sidebar({
  searchValue,
  onChangeSearch,
  onClose,
}: SidebarProps) {
  const { chats, activeChatId, createNewChat, switchChat, deleteChat } =
    useChat();

  const safeSearchValue = typeof searchValue === "string" ? searchValue : "";

  const handleNewChat = () => {
    createNewChat();
    onClose?.();
  };

  const handleSwitch = (chatId: string) => {
    switchChat(chatId);
    onClose?.();
  };

  const filtered = chats.filter((c) => {
    const title = typeof c?.title === "string" ? c.title : "New Chat";
    return title.toLowerCase().includes(safeSearchValue.toLowerCase());
  });

  return (
    <View style={styles.sidebar}>
      <View style={styles.topArea}>
        <SearchBar value={safeSearchValue} onChangeText={onChangeSearch} />

        <Pressable style={styles.newChatRow} onPress={handleNewChat}>
          <View style={styles.newChatIcon}>
            <Text style={styles.newChatPlus}>+</Text>
          </View>
          <Text style={styles.newChatLabel}>New Chat</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <Text style={styles.emptyLabel}>
            {chats.length === 0 ? "No chats yet" : "No results"}
          </Text>
        ) : (
          filtered.map((chat) => {
            const isActive = chat.chatId === activeChatId;
            const safeTitle =
              typeof chat?.title === "string" && chat.title.trim()
                ? chat.title
                : "New Chat";

            return (
              <View
                key={chat.chatId}
                style={[styles.historyItem, isActive && styles.selectedItem]}
              >
                <Pressable
                  style={styles.historyPressArea}
                  onPress={() => handleSwitch(chat.chatId)}
                >
                  <Text style={styles.historyText} numberOfLines={1}>
                    {safeTitle}
                  </Text>
                  {chat.isGuest && (
                    <Text style={styles.guestBadge}>Guest · not saved</Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => deleteChat(chat.chatId)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            );
          })
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
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
    zIndex: 10,
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
  newChatIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  newChatPlus: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "300",
  },
  newChatLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111111",
  },
  divider: {
    height: 1,
    backgroundColor: "#DDD7D7",
  },
  list: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 6,
  },
  historyItem: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 4,
    justifyContent: "space-between",
  },
  historyPressArea: {
    flex: 1,
    marginRight: 8,
  },
  selectedItem: {
    backgroundColor: "#F1EEEE",
  },
  historyText: {
    fontSize: 12,
    color: "#1F1F1F",
    lineHeight: 16,
  },
  guestBadge: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 3,
  },
  deleteButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  deleteText: {
    fontSize: 11,
    color: "#C62828",
    fontWeight: "500",
  },
  emptyLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 24,
  },
});
