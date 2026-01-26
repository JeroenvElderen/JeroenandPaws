import { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import PrimaryButton from "../components/PrimaryButton";

const AuthScreen = ({ onAuthenticate }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuthenticate = (requirePassword = true) => {
    if (!email.trim() || (requirePassword && !password.trim())) {
      return;
    }
    onAuthenticate({
      name: email.split("@")[0],
      email: email.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Jeroen & Paws</Text>
        <Text style={styles.subtitle}>
          Log in or register to load your bookings from Outlook.
        </Text>
        <View style={styles.form}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <View style={styles.buttonStack}>
          <PrimaryButton label="Login" onPress={() => handleAuthenticate()} />
          <PrimaryButton
            label="Continue with Apple"
            variant="outline"
            onPress={() => handleAuthenticate(false)}
          />
          <PrimaryButton
            label="Register"
            variant="outline"
            onPress={handleAuthenticate}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f3fb",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2b1a4b",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#6c5a92",
    textAlign: "center",
    marginBottom: 24,
  },
  form: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: "#6c5a92",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e6def6",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#2b1a4b",
    marginBottom: 12,
    backgroundColor: "#fdfcff",
  },
  buttonStack: {
    width: "100%",
  },
});

export default AuthScreen;