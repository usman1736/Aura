import { useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChatHeader from "../../components/ChatHeader";
import ChatInputBar from "../../components/ChatInputBar";
import Sidebar from "../../components/Sidebar";
import WelcomeCard from "../../components/WelcomeCard";

import { useChat } from "../../context/ChatContext";
import { sendMessageToAI } from "../../services/openaiService";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();

  const { activeChatId, activeChat, createNewChat, addMessage } = useChat();

  const [message, setMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const getChatId = () => activeChatId ?? createNewChat();

  // ---------------- IMAGE PICK ----------------
  const handleImagePick = async () => {
    try {
      const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
      const galleryPerm =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!cameraPerm.granted || !galleryPerm.granted) {
        Alert.alert("Permission required");
        return;
      }

      Alert.alert("Upload Image", "Choose option", [
        { text: "Camera", onPress: openCamera },
        { text: "Gallery", onPress: openGallery },
        { text: "Cancel", style: "cancel" },
      ]);
    } catch (e) {
      console.log("IMAGE ERROR:", e);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.5,
      base64: true, // 🔥 IMPORTANT
    });

    if (!result.canceled) {
      handleImageUpload(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.5,
      base64: true, // 🔥 IMPORTANT
    });

    if (!result.canceled) {
      handleImageUpload(result.assets[0].uri);
    }
  };

  // ---------------- SEND IMAGE TO AI ----------------
  const handleImageUpload = async (uri) => {
    try {
      const chatId = getChatId();
      const userPrompt = message.trim() || "Describe this image";

      // show image immediately
      addMessage(chatId, "user", {
        type: "image",
        content: uri,
      });

      // also show prompt
      addMessage(chatId, "user", {
        type: "text",
        content: userPrompt,
      });

      setMessage("");

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const imageBase64 = `data:image/jpeg;base64,${base64}`;

      const reply = await sendImageToGroq(imageBase64, userPrompt);

      addMessage(chatId, "assistant", {
        type: "text",
        content: reply,
      });
    } catch (e) {
      console.log("UPLOAD ERROR:", e);
    }
  };

  // ---------------- AI IMAGE ----------------
  const sendImageToAI = async (imageBase64: string, prompt: string) => {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt, // ✅ dynamic prompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageBase64,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("API ERROR:", data);
        return "Error analyzing image";
      }

      return data?.choices?.[0]?.message?.content || "No response";
    } catch (e) {
      console.log("AI IMAGE ERROR:", e);
      return "Error analyzing image";
    }
  };

  // ---------------- MIC ----------------
  const startRecording = async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    const recording = new Audio.Recording();

    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );

    await recording.startAsync();

    recordingRef.current = recording;
  };

  const transcribeAudio = async (uri) => {
    const formData = new FormData();

    formData.append("file", {
      uri,
      name: "audio.m4a",
      type: "audio/m4a",
    });

    formData.append("model", "gpt-4o-transcribe");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const data = await res.json();

    return data.text;
  };

  const stopRecording = async () => {
    const recording = recordingRef.current;
    if (!recording) return;

    recordingRef.current = null;

    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();

    if (!uri) return;

    setMessage("Casual outfit for today's weather");
  };

  const handleMicPress = async () => {
    if (recordingRef.current) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  // ---------------- SEND TEXT ----------------
  const handleSend = async () => {
    const text = message.trim();
    if (!text) return;

    const chatId = getChatId();

    addMessage(chatId, "user", text);
    setMessage("");

    const reply = await sendMessageToAI(text, []);
    addMessage(chatId, "assistant", reply);
  };

  // ---------------- UI ----------------
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ChatHeader onMenuPress={() => setShowSidebar((p) => !p)} />

        <View style={styles.container}>
          {showSidebar && <Sidebar onClose={() => setShowSidebar(false)} />}

          <ScrollView contentContainerStyle={styles.chatContent}>
            {!activeChat?.messages?.length ? (
              <WelcomeCard />
            ) : (
              activeChat.messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.bubble,
                    msg.role === "user" ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  {msg.content?.startsWith("file") ? (
                    <Image
                      source={{ uri: msg.content }}
                      style={{ width: 150, height: 150, borderRadius: 10 }}
                    />
                  ) : (
                    <Text
                      style={{
                        color: msg.role === "user" ? "#fff" : "#000",
                      }}
                    >
                      {msg.content}
                    </Text>
                  )}
                </View>
              ))
            )}
          </ScrollView>

          <View style={{ paddingBottom: insets.bottom }}>
            <ChatInputBar
              value={message}
              onChangeText={setMessage}
              onSendPress={handleSend}
              onImagePress={handleImagePick}
              onMicPress={handleMicPress}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  chatContent: { padding: 12, flexGrow: 1 },

  bubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 6,
    maxWidth: "80%",
  },

  userBubble: {
    backgroundColor: "#7A2E2E",
    alignSelf: "flex-end",
  },

  aiBubble: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",
  },
});
