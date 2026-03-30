import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ChatHeader from "../../components/ChatHeader";
import ChatInputBar from "../../components/ChatInputBar";
import PromptChip from "../../components/PromptChip";
import Sidebar from "../../components/Sidebar";
import WelcomeCard from "../../components/WelcomeCard";
import { colors } from "../../constants/colors";
import { AuthContext } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import {
  DEFAULT_SUGGESTION_CHIPS,
  getPersonalizedSuggestions,
} from "../../services/chatHistoryService";

export default function ChatScreen() {
  const authCtx = useContext(AuthContext);
  const user = authCtx?.user ?? null;

  const {
    activeChatId,
    activeChat,
    createNewChat,
    addMessage,
    chatSyncStatus,
    chatSyncError,
    firestoreWriteVersion,
  } = useChat();

  const [message, setMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestionChips, setSuggestionChips] = useState<string[]>(DEFAULT_SUGGESTION_CHIPS);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const refreshSuggestions = useCallback(async () => {
    if (!user?.uid) {
      const defaults = [...DEFAULT_SUGGESTION_CHIPS];
      setSuggestionChips(defaults);
      console.log("[Aura] chips loaded", defaults);
      return;
    }
    setSuggestionsLoading(true);
    try {
      const chips = await getPersonalizedSuggestions(user.uid);
      setSuggestionChips(chips.length ? chips : [...DEFAULT_SUGGESTION_CHIPS]);
    } catch {
      const fallback = [...DEFAULT_SUGGESTION_CHIPS];
      setSuggestionChips(fallback);
      console.log("[Aura] chips loaded", fallback);
    } finally {
      setSuggestionsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    void refreshSuggestions();
  }, [refreshSuggestions]);

  // After Firestore confirms a save, reload chips so searchHistory is reflected (avoids racing the async persist).
  useEffect(() => {
    if (!user?.uid || firestoreWriteVersion === 0) return;
    void refreshSuggestions();
  }, [firestoreWriteVersion, user?.uid, refreshSuggestions]);

  const getOrCreateChatId = (): string => activeChatId ?? createNewChat();

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    const chatId = getOrCreateChatId();
    addMessage(chatId, "user", text);
    setMessage("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    setTimeout(() => {
      addMessage(
        chatId,
        "assistant",
        "Great choice! I am finding the best options for you. (AI response coming soon)"
      );
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }, 800);
  };

  const handleSuggestion = (suggestion: string) => {
    const chatId = getOrCreateChatId();
    addMessage(chatId, "user", suggestion);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    setTimeout(() => {
      addMessage(
        chatId,
        "assistant",
        "Great choice! I am finding the best options for you. (AI response coming soon)"
      );
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }, 800);
  };

  const hasMessages = (activeChat?.messages?.length ?? 0) > 0;
  const showChatLoading = Boolean(user) && chatSyncStatus === "loading";

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ChatHeader onMenuPress={() => setShowSidebar((p) => !p)} />
        <View style={styles.mainArea}>
          {showSidebar && (
            <>
              <Sidebar
                searchValue={searchValue}
                onChangeSearch={setSearchValue}
                onClose={() => setShowSidebar(false)}
              />
              <Pressable style={styles.overlay} onPress={() => setShowSidebar(false)} />
            </>
          )}
          <View style={styles.chatArea}>
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {!hasMessages ? (
                <>
                  <WelcomeCard />
                  {showChatLoading && (
                    <View style={styles.syncRow}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={styles.syncText}>Loading your saved chats…</Text>
                    </View>
                  )}
                  {chatSyncError ? (
                    <Text style={styles.errorBanner}>{chatSyncError}</Text>
                  ) : null}
                  <View style={styles.chipsContainer}>
                    {suggestionsLoading && user ? (
                      <View style={styles.chipsLoadingRow}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.syncText}>Updating suggestions…</Text>
                      </View>
                    ) : (
                      suggestionChips.map((s, i) => (
                        <PromptChip
                          key={`${i}-${s}`}
                          title={s}
                          onPress={() => handleSuggestion(s)}
                        />
                      ))
                    )}
                  </View>
                </>
              ) : (
                activeChat?.messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.bubble,
                      msg.role === "user" ? styles.userBubble : styles.aiBubble,
                    ]}
                  >
                    {msg.role === "assistant" && (
                      <Text style={styles.aiLabel}>Aura</Text>
                    )}
                    <Text
                      style={[
                        styles.bubbleText,
                        msg.role === "user" ? styles.userBubbleText : styles.aiBubbleText,
                      ]}
                    >
                      {msg.content}
                    </Text>
                  </View>
                ))
              )}
              <View style={styles.spacer} />
            </ScrollView>
            <View style={styles.bottomArea}>
              <ChatInputBar
                value={message}
                onChangeText={setMessage}
                onPlusPress={() => Alert.alert("Attachments", "Image upload coming soon.")}
                onImagePress={() => Alert.alert("Image", "Image picker coming soon.")}
                onMicPress={() => Alert.alert("Voice", "Voice input coming soon.")}
                onSendPress={handleSend}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  mainArea: { flex: 1, flexDirection: "row" },
  overlay: {
    position: "absolute",
    left: 176,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.28)",
    zIndex: 5,
  },
  chatArea: { flex: 1 },
  content: {
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 10,
    flexGrow: 1,
  },
  syncRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  chipsLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  syncText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.textMuted,
  },
  errorBanner: {
    fontSize: 12,
    color: "#B3261E",
    marginTop: 8,
    marginBottom: 4,
  },
  chipsContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 4, marginBottom: 10 },
  bubble: {
    maxWidth: "80%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "#F3EDED",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E7DDDD",
  },
  aiLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.accent,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  userBubbleText: { color: "#FFFFFF" },
  aiBubbleText: { color: colors.textPrimary },
  spacer: { minHeight: 20 },
  bottomArea: { backgroundColor: colors.background },
});
