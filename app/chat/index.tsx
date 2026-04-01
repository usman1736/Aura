import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
import {
  isFashionRelated,
  sendMessageToAI,
} from "../../services/openaiService";

export default function ChatScreen() {
  const authCtx = useContext(AuthContext);
  const user = authCtx?.user ?? null;
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

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
  const [suggestionChips, setSuggestionChips] = useState<string[]>(
    DEFAULT_SUGGESTION_CHIPS,
  );
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
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
  const handleImagePick = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow access to your photos.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (result.canceled) return;

      const imageUri = result.assets[0].uri;

      const chatId = getOrCreateChatId();

      // Show message in chat
      addMessage(chatId, "user", "📷 Image selected");

      // Send to AI (temporary text-based approach)
      await sendToAI(chatId, `Describe the outfit in this image: ${imageUri}`);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not pick image.");
    }
  };
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission required", "Microphone access is needed.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await rec.startAsync();

      setRecording(rec);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not start recording.");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (!uri) {
        Alert.alert("Error", "No recording found.");
        return;
      }

      // ✅ For now: simulate speech-to-text
      const transcript = "Suggest an outfit based on my voice input";

      const chatId = getOrCreateChatId();

      addMessage(chatId, "user", transcript);

      await sendToAI(chatId, transcript);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not process recording.");
    }
  };

  // After Firestore confirms a save, reload chips so searchHistory is reflected (avoids racing the async persist).
  useEffect(() => {
    if (!user?.uid || firestoreWriteVersion === 0) return;
    void refreshSuggestions();
  }, [firestoreWriteVersion, user?.uid, refreshSuggestions]);

  const getOrCreateChatId = (): string => activeChatId ?? createNewChat();

  const sendToAI = async (chatId: string, text: string) => {
    setIsAiLoading(true);
    setAiError(null);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    try {
      const history = (activeChat?.messages ?? []).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const reply = await sendMessageToAI(text, history);
      addMessage(chatId, "assistant", reply);
    } catch (e) {
      console.error("[Aura] OpenAI error:", e);
      const errMsg = "Sorry, something went wrong. Please try again.";
      setAiError(errMsg);
      addMessage(chatId, "assistant", errMsg);
    } finally {
      setIsAiLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }
  };

  const handleSend = () => {
    const text = message.trim();
    if (!text || isAiLoading) return;
    setMessage("");

    if (!isFashionRelated(text)) {
      const chatId = getOrCreateChatId();
      addMessage(chatId, "user", text);
      addMessage(
        chatId,
        "assistant",
        "Sorry, I only help with fashion-related questions. Ask me about outfits, styling, wardrobe tips, and more!",
      );
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
      return;
    }

    const chatId = getOrCreateChatId();
    addMessage(chatId, "user", text);
    void sendToAI(chatId, text);
  };

  const handleSuggestion = (suggestion: string) => {
    if (isAiLoading) return;
    const chatId = getOrCreateChatId();
    addMessage(chatId, "user", suggestion);
    void sendToAI(chatId, suggestion);
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
              <Pressable
                style={styles.overlay}
                onPress={() => setShowSidebar(false)}
              />
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
                      <Text style={styles.syncText}>
                        Loading your saved chats…
                      </Text>
                    </View>
                  )}
                  {chatSyncError ? (
                    <Text style={styles.errorBanner}>{chatSyncError}</Text>
                  ) : null}
                  <View style={styles.chipsContainer}>
                    {suggestionsLoading && user ? (
                      <View style={styles.chipsLoadingRow}>
                        <ActivityIndicator
                          size="small"
                          color={colors.primary}
                        />
                        <Text style={styles.syncText}>
                          Updating suggestions…
                        </Text>
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
                <>
                  {activeChat?.messages.map((msg) => (
                    <View
                      key={msg.id}
                      style={[
                        styles.bubble,
                        msg.role === "user"
                          ? styles.userBubble
                          : styles.aiBubble,
                      ]}
                    >
                      {msg.role === "assistant" && (
                        <Text style={styles.aiLabel}>Aura</Text>
                      )}
                      <Text
                        style={[
                          styles.bubbleText,
                          msg.role === "user"
                            ? styles.userBubbleText
                            : styles.aiBubbleText,
                        ]}
                      >
                        {msg.content}
                      </Text>
                    </View>
                  ))}
                  {isAiLoading && (
                    <View style={[styles.bubble, styles.aiBubble]}>
                      <Text style={styles.aiLabel}>Aura</Text>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  )}
                </>
              )}
              <View style={styles.spacer} />
            </ScrollView>
            <View style={styles.bottomArea}>
              <ChatInputBar
                value={message}
                onChangeText={setMessage}
                onPlusPress={() =>
                  Alert.alert("Attachments", "Image upload coming soon.")
                }
                onImagePress={handleImagePick}
                onMicPress={() =>
                  Alert.alert("Voice", "Voice input coming soon.")
                }
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
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    marginBottom: 10,
  },
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
