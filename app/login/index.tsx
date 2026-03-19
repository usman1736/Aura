import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { logIn } from "../../auth";
import AuthButton from "../../components/AuthButton";
import { colors } from "../../constants/colors";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Enter email and password");
      return;
    }

    try {
      await logIn(email, password);
      router.replace("/chat");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Image
          source={require("../../assets/images/aura-logo.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Log in</Text>

        <TextInput
          placeholder="Email"
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
          style={styles.input}
        />

        <AuthButton title="Log in" onPress={handleLogin} />

        <Pressable onPress={() => router.push("/signup")}>
          <Text>Go to Signup</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 20 },
  logo: { width: 70, height: 70, alignSelf: "center" },
  title: { fontSize: 24, textAlign: "center" },
  input: {
    height: 50,
    backgroundColor: "#eee",
    marginVertical: 10,
    padding: 10,
  },
  backText: { color: colors.primary },
});

