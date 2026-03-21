import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CheckoutScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardholder, setCardholder] = useState("");
  const [cvv, setCvv] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postal, setPostal] = useState("");

  const price = "$120";

  const handlePurchase = () => {
    if (
      !firstName ||
      !lastName ||
      !cardNumber ||
      !cardholder ||
      !cvv ||
      !address ||
      !city ||
      !province ||
      !postal
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    Alert.alert("Success", "Purchase completed!");
    router.replace("/chat");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 🔙 BACK */}
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C2C2C" />
        </Pressable>

        {/* TITLE */}
        <Text style={styles.title}>Checkout</Text>

        {/* INPUTS */}
        <TextInput
          placeholder="First Name"
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          placeholder="Last Name"
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
        />

        <TextInput
          placeholder="Card Number"
          style={styles.input}
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="numeric"
        />

        <TextInput
          placeholder="Cardholder Name"
          style={styles.input}
          value={cardholder}
          onChangeText={setCardholder}
        />

        <TextInput
          placeholder="CVV"
          style={styles.input}
          value={cvv}
          onChangeText={setCvv}
          keyboardType="numeric"
        />

        <TextInput
          placeholder="Address"
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />

        <TextInput
          placeholder="City"
          style={styles.input}
          value={city}
          onChangeText={setCity}
        />

        <TextInput
          placeholder="Province"
          style={styles.input}
          value={province}
          onChangeText={setProvince}
        />

        <TextInput
          placeholder="Postal Code"
          style={styles.input}
          value={postal}
          onChangeText={setPostal}
        />

        {/* PRICE */}
        <Text style={styles.price}>Total: {price}</Text>

        {/* PURCHASE BUTTON */}
        <Pressable style={styles.button} onPress={handlePurchase}>
          <Text style={styles.buttonText}>Purchase</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  backButton: {
    marginBottom: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },

  input: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#F3EDED",
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  price: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 15,
    textAlign: "center",
  },

  button: {
    backgroundColor: "#2C2C2C",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
