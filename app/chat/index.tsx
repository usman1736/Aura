import React, { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import ChatHeader from "../../components/ChatHeader";
import ChatInputBar from "../../components/ChatInputBar";
import Sidebar from "../../components/Sidebar";
import WelcomeCard from "../../components/WelcomeCard";
import { colors } from "../../constants/colors";
import { useChat } from "../../context/ChatContext";

const SUGGESTIONS = ["Build me an outfit", "What matches these shoes?", "Plan my look for dinner", "Organize my wardrobe"];

export default function ChatScreen() {
  const { activeChatId, activeChat, createNewChat, addMessage } = useChat();
  const [message, setMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const getOrCreateChatId = (): string => activeChatId ?? createNewChat();

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    const chatId = getOrCreateChatId();
    addMessage(chatId, "user", text);
    setMessage("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    setTimeout(() => {
      addMessage(chatId, "assistant", "Great choice! I am finding the best options for you. (AI response coming soon)");
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }, 800);
  };

  const handleSuggestion = (suggestion: string) => {
    const chatId = getOrCreateChatId();
    addMessage(chatId, "user", suggestion);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    setTimeout(() => {
      addMessage(chatId, "assistant", "Great choice! I am finding the best options for you. (AI response coming soon)");
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }, 800);
  };

  const hasMessages = (activeChat?.messages?.length ?? 0) > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ChatHeader onMenuPress={() => setShowSidebar((p) => !p)} />
        <View style={styles.mainArea}>
          {showSidebar && (
            <>
              <Sidebar searchValue={searchValue} onChangeSearch={setSearchValue} onClose={() => setShowSidebar(false)} />
              <Pressable style={styles.overlay} onPress={() => setShowSidebar(false)} />
            </>
          )}
          <View style={styles.chatArea}>
            <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {!hasMessages ? (
                <>
                  <WelcomeCard />
                  <View style={styles.chipsContainer}>
                    {SUGGESTIONS.map((s) => (
                      <Pressable key={s} onPress={() => handleSuggestion(s)} style={styles.chip}>
                        <Text style={styles.chipText}>{s}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : (
                activeChat?.messages.map((msg) => (
                  <View key={msg.id} style={[styles.bubble, msg.role === "user" ? styles.userBubble : styles.aiBubble]}>
                    {msg.role === "assistant" && <Text style={styles.aiLabel}>Aura</Text>}
                    <Text style={[styles.bubbleText, msg.role === "user" ? styles.userBubbleText : styles.aiBubbleText]}>{msg.content}</Text>
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
  overlay: { position: "absolute", left: 176, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.28)", zIndex: 5 },
  chatArea: { flex: 1 },
  content: { paddingHorizontal: 14, paddingTop: 18, paddingBottom: 10, flexGrow: 1 },
  chipsContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 4, marginBottom: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, backgroundColor: "#F3EDED", marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: "#E7DDDD" },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.textPrimary },
  bubble: { maxWidth: "80%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10 },
  userBubble: { backgroundColor: colors.primary, alignSelf: "flex-end", borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: "#F3EDED", alignSelf: "flex-start", borderBottomLeftRadius: 4, borderWidth: 1, borderColor: "#E7DDDD" },
  aiLabel: { fontSize: 10, fontWeight: "700", color: colors.accent, marginBottom: 4, letterSpacing: 0.5 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  userBubbleText: { color: "#FFFFFF" },
  aiBubbleText: { color: colors.textPrimary },
  spacer: { minHeight: 20 },
  bottomArea: { backgroundColor: colors.background },
});
