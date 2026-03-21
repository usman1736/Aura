import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function MarketplaceScreen() {
  const item = {
    name: "Black Leather Jacket",
    price: "$120",
    image: "https://images.unsplash.com/photo-1520975916090-3105956dac38",
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.price}>{item.price}</Text>

      <Pressable style={styles.button} onPress={() => router.push("/checkout")}>
        <Text style={styles.buttonText}>Buy Now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  price: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2C2C2C",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});

