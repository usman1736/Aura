import { router } from "expo-router"; // ADD THIS
import React, { useState } from "react";
import {
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
import Sidebar from "../../components/Sidebar";
import WelcomeCard from "../../components/WelcomeCard";
import { colors } from "../../constants/colors";

const SUGGESTIONS = [
  "Build me an outfit",
  "What matches these shoes?",
  "Plan my look for dinner",
  "Organize my wardrobe",
];

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
    null,
  );

  const closeMenus = () => {
    if (showActions) setShowActions(false);
  };

  const handlePlusPress = () => {
    setShowActions((prev) => !prev);
  };

  const handleImagePress = () => {
    Alert.alert("Image upload", "Later this will open the image picker.");
  };

  const handleMicPress = () => {
    Alert.alert("Voice input", "Later this will start voice recording.");
  };

  const handleMenuPress = () => {
    setShowSidebar((prev) => !prev);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setMessage(suggestion);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ChatHeader onMenuPress={handleMenuPress} />

        <View style={styles.mainArea}>
          {showSidebar && (
            <>
              <Sidebar
                searchValue={searchValue}
                onChangeSearch={setSearchValue}
                onNewChatPress={() => Alert.alert("New chat pressed")}
                onItemPress={(label) => Alert.alert(label)}
              />
              <Pressable
                style={styles.overlay}
                onPress={() => setShowSidebar(false)}
              />
            </>
          )}

          <Pressable style={styles.chatArea} onPress={closeMenus}>
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <WelcomeCard />

              {/* SUGGESTIONS */}
              <View style={styles.chipsContainer}>
                {SUGGESTIONS.map((suggestion) => {
                  const isSelected = selectedSuggestion === suggestion;

                  return (
                    <Pressable
                      key={suggestion}
                      onPress={() => handleSuggestionPress(suggestion)}
                      style={[
                        styles.suggestionChip,
                        isSelected && styles.suggestionChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.suggestionText,
                          isSelected && styles.suggestionTextSelected,
                        ]}
                      >
                        {suggestion}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* 🔥 MARKETPLACE BUTTON */}
              {selectedSuggestion && (
                <Pressable
                  style={styles.marketplaceButton}
                  onPress={() => router.push("/marketplace")}
                >
                  <Text style={styles.marketplaceText}>
                    View Suggested Item →
                  </Text>
                </Pressable>
              )}

              <View style={styles.emptyState} />
            </ScrollView>

            <View style={styles.bottomArea}>
              {showActions && (
                <>
                  <Pressable
                    style={styles.actionsDismissLayer}
                    onPress={closeMenus}
                  />
                  <View style={styles.actionsMenu}>
                    <Pressable
                      style={styles.actionItem}
                      onPress={handleImagePress}
                    >
                      <Text style={styles.actionText}>Upload image</Text>
                    </Pressable>

                    <Pressable
                      style={styles.actionItem}
                      onPress={handleMicPress}
                    >
                      <Text style={styles.actionText}>Use voice</Text>
                    </Pressable>
                  </View>
                </>
              )}

              <ChatInputBar
                value={message}
                onChangeText={setMessage}
                onPlusPress={handlePlusPress}
                onImagePress={handleImagePress}
                onMicPress={handleMicPress}
              />
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainArea: {
    flex: 1,
    flexDirection: "row",
  },
  overlay: {
    position: "absolute",
    left: 176,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  chatArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 20,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "#F3EDED",
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E7DDDD",
  },
  suggestionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  suggestionTextSelected: {
    color: "#FFFFFF",
  },

  marketplaceButton: {
    marginTop: 10,
    backgroundColor: "#2C2C2C",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },

  marketplaceText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  emptyState: {
    flex: 1,
    minHeight: 400,
  },
  bottomArea: {
    backgroundColor: colors.background,
    position: "relative",
  },
  actionsDismissLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 72,
    top: -500,
  },
  actionsMenu: {
    marginHorizontal: 14,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8E0E0",
    paddingVertical: 6,
  },
  actionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});

