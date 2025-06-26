// screens/SignupScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "../firebase/firebaseConfig";

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCommercial, setIsCommercial] = useState(false); // false = Home

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Please enter email and password");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDeviceRef = ref(database, `devices/${user.uid}/device1`);
      await set(userDeviceRef, {
        fan: "OFF",
        light: "OFF",
        person: "false",
        isCommercial: isCommercial,
      });

      Alert.alert("Success", "Account created");
      navigation.replace("Dashboard");
    } catch (error) {
      Alert.alert("Signup failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome !!</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            !isCommercial && styles.selectedToggle,
          ]}
          onPress={() => setIsCommercial(false)}
        >
          <Text style={styles.toggleText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isCommercial && styles.selectedToggle,
          ]}
          onPress={() => setIsCommercial(true)}
        >
          <Text style={styles.toggleText}>Commercial</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 30,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  title: {
    fontSize: 33,
    color: "#000",
    fontWeight: "bold",
    paddingHorizontal: 10,
    marginBottom: 36,
    textAlign: "left",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: "#000",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  selectedToggle: {
    backgroundColor: "#f4c2c2",
  },
  toggleText: {
    fontWeight: "bold",
    color: "#000",
  },
  signupButton: {
    backgroundColor: "#D48D8D",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 15,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
