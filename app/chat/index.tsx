import { useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import ChatHeader from "../../components/ChatHeader";
import ChatInputBar from "../../components/ChatInputBar";
import Sidebar from "../../components/Sidebar";
import WelcomeCard from "../../components/WelcomeCard";

import { Message, useChat } from "../../context/ChatContext";
import { sendMessageToAI } from "../../services/openaiService";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { activeChatId, activeChat, createNewChat, addMessage } = useChat();

  const [message, setMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);

  const getChatId = () => activeChatId ?? createNewChat();

  const handleImagePick = async () => {
    try {
      const cam = await ImagePicker.requestCameraPermissionsAsync();
      const gal = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!cam.granted || !gal.granted) {
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
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setSelectedImageUri(res.assets[0].uri);
      }
    } catch (e) {
      console.log("GALLERY ERROR:", e);
    }
  };

  const openCamera = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({ quality: 0.5 });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setSelectedImageUri(res.assets[0].uri);
      }
    } catch (e) {
      console.log("CAMERA ERROR:", e);
    }
  };

  const sendImageToGroq = async (imageBase64: string, prompt: string) => {
    try {
      const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;

      if (!key) {
        return "Missing EXPO_PUBLIC_GROQ_API_KEY";
      }

      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  {
                    type: "image_url",
                    image_url: { url: imageBase64 },
                  },
                ],
              },
            ],
            max_tokens: 300,
          }),
        },
      );

      const data = await res.json();
      console.log("GROQ IMAGE STATUS:", res.status);
      console.log("GROQ IMAGE RESPONSE:", JSON.stringify(data, null, 2));

      if (!res.ok) {
        return data?.error?.message || "Error analyzing image";
      }

      return data?.choices?.[0]?.message?.content || "No response";
    } catch (e: any) {
      console.log("GROQ IMAGE ERROR:", e);
      return e?.message || "Error analyzing image";
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
        shouldDuckAndroid: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await recording.startAsync();
      recordingRef.current = recording;
    } catch (e) {
      console.log("START RECORDING ERROR:", e);
    }
  };

  const stopRecording = async () => {
    try {
      const recording = recordingRef.current;
      if (!recording) return;

      recordingRef.current = null;
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      if (!uri) return;

      setMessage("Voice message recorded");
    } catch (e) {
      console.log("STOP RECORDING ERROR:", e);
    }
  };

  const handleMicPress = async () => {
    if (recordingRef.current) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleSend = async () => {
    const text = message.trim();
    const hasImage = !!selectedImageUri;

    if (!text && !hasImage) return;

    const chatId = getChatId();

    if (hasImage && selectedImageUri) {
      const prompt = text || "What colour is this?";

      addMessage(chatId, "user", {
        type: "image",
        content: selectedImageUri,
      });

      addMessage(chatId, "user", {
        type: "text",
        content: prompt,
      });

      const imageUriToSend = selectedImageUri;
      setSelectedImageUri(null);
      setMessage("");

      try {
        const base64 = await FileSystem.readAsStringAsync(imageUriToSend, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const imageBase64 = `data:image/jpeg;base64,${base64}`;
        const reply = await sendImageToGroq(imageBase64, prompt);

        addMessage(chatId, "assistant", {
          type: "text",
          content: reply,
        });
      } catch (e) {
        console.log("UPLOAD ERROR:", e);
        addMessage(chatId, "assistant", "Error analyzing image");
      }

      return;
    }

    addMessage(chatId, "user", text);
    setMessage("");

    const reply = await sendMessageToAI(text, []);
    addMessage(chatId, "assistant", reply);
  };

  const renderMsg = (msg: Message) => {
    const color = msg.role === "user" ? "#fff" : "#000";

    if (typeof msg.content === "string") {
      return <Text style={{ color }}>{msg.content}</Text>;
    }

    if (msg.content.type === "image") {
      return (
        <Image source={{ uri: msg.content.content }} style={styles.image} />
      );
    }

    return <Text style={{ color }}>{msg.content.content}</Text>;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ChatHeader onMenuPress={() => setShowSidebar((p) => !p)} />

        <View style={styles.container}>
          {showSidebar && (
            <Sidebar
              searchValue={searchValue}
              onChangeSearch={setSearchValue}
              onClose={() => setShowSidebar(false)}
            />
          )}

          <ScrollView contentContainerStyle={styles.chatContent}>
            {!activeChat?.messages?.length ? (
              <WelcomeCard />
            ) : (
              activeChat.messages.map((m) => (
                <View
                  key={m.id}
                  style={[
                    styles.bubble,
                    m.role === "user" ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  {renderMsg(m)}
                </View>
              ))
            )}
          </ScrollView>

          {selectedImageUri && (
            <View style={styles.previewWrap}>
              <Image
                source={{ uri: selectedImageUri }}
                style={styles.previewImage}
              />
              <Text style={styles.previewText}>Image selected</Text>
            </View>
          )}

          <View style={{ paddingBottom: insets.bottom }}>
            <ChatInputBar
              value={message}
              onChangeText={setMessage}
              onSendPress={handleSend}
              onImagePress={handleImagePick}
              onMicPress={handleMicPress}
              hasSelectedImage={!!selectedImageUri}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  chatContent: {
    padding: 12,
    flexGrow: 1,
  },
  bubble: {
    padding: 10,
    marginVertical: 6,
    borderRadius: 10,
    maxWidth: "80%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#7A2E2E",
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  previewWrap: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: "#fff",
  },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginBottom: 6,
  },
  previewText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
});
