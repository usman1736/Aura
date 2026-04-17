import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { logOut } from "../../auth";
import AuthButton from "../../components/AuthButton";
import { colors } from "../../constants/colors";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getAuth().currentUser;
    setUser(currentUser);
  }, []);

  const handleLogout = async () => {
    await logOut();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/aura-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>AURA</Text>
        <Text style={styles.subtitle}>AI Style Companion</Text>

        {user && (
          <View style={styles.userSection}>
            <Text style={styles.loggedLabel}>Logged in as</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        )}

        <View style={styles.buttonGroup}>
          {user ? (
            <AuthButton title="Logout" onPress={handleLogout} />
          ) : (
            <>
              <AuthButton
                title="Log in"
                onPress={() => router.push("/login" as any)}
              />
              <AuthButton
                title="Sign up"
                variant="secondary"
                onPress={() => router.push("/signup" as any)}
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  logo: {
    width: 70,
    height: 70,
    marginBottom: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: "600",
    color: colors.primary,
    letterSpacing: 2,
  },

  subtitle: {
    fontSize: 13,
    color: "#8B7F7F",
    marginBottom: 40,
  },

  userSection: {
    alignItems: "center",
    marginBottom: 40,
  },

  loggedLabel: {
    fontSize: 11,
    color: "#A89A9A",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  email: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: "500",
  },

  buttonGroup: {
    width: "100%",
  },
});
