import { useMemo, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { supabase } from "../api/supabaseClient";
import { buildSessionPayload, resolveClientProfile } from "../utils/session";

const AuthScreen = ({ onAuthenticate }) => {
  const [mode, setMode] = useState("login");
  const isRegistering = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [eircode, setEircode] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    if (!email.trim()) return false;
    if (isRegistering) {
      return (
        Boolean(fullName.trim()) &&
        Boolean(phone.trim()) &&
        Boolean(eircode.trim()) &&
        Boolean(password.trim())
      );
    }
    return Boolean(password.trim());
  }, [email, password, fullName, phone, eircode, isRegistering]);

  const resolveSignedUpUser = async (signUpResult) => {
    const signUpUser =
      signUpResult.data?.user || signUpResult.data?.session?.user || null;

    if (signUpUser?.id) {
      return signUpUser;
    }

    const { data, error } = await supabase.auth.getUser();
    if (error) {
      throw error;
    }

    return data?.user || null;
  };

  const handleAuthenticate = async () => {
    if (!canSubmit) {
      setError("Please complete all required fields.");
      return;
    }
    
    setStatus("loading");
    setError("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!supabase) {
      onAuthenticate({
        name: fullName || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        phone: phone.trim(),
        address: eircode.trim(),
      });
      setStatus("idle");
      return;
    }

    try {
      if (isRegistering) {
        const signUpResult = await supabase.auth.signUp({
          email: normalizedEmail,
          password: password.trim(),
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
              address: eircode.trim(),
            },
          },
        });

        if (signUpResult.error) {
          throw signUpResult.error;
        }

        const user = await resolveSignedUpUser(signUpResult);

        if (!user?.id) {
          throw new Error(
            "Account created, but we could not finish your profile setup. Please log in again."
          );
        }

        const clientProfile = await resolveClientProfile({
          supabase,
          user,
          fallback: {
            email: normalizedEmail,
            fullName: fullName.trim(),
            phone: phone.trim(),
            address: eircode.trim(),
          },
        });

        onAuthenticate(
          buildSessionPayload({
            user,
            client: clientProfile,
            fallback: {
              email: normalizedEmail,
              phone: phone.trim(),
              address: eircode.trim(),
            },
          })
        );
        setStatus("idle");
        return;
      }

      const signInResult = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password.trim(),
      });

      if (signInResult.error) {
        throw signInResult.error;
      }

      const user = signInResult.data?.user;
      const clientResult = await supabase
        .from("clients")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();

      if (clientResult.error) {
        throw clientResult.error;
      }

      const clientProfile =
        clientResult.data ||
        (await resolveClientProfile({
          supabase,
          user,
          fallback: {
            email: normalizedEmail,
            fullName: "",
            phone: "",
            address: "",
          },
        }));

      onAuthenticate(
        buildSessionPayload({
          user,
          client: clientProfile,
          fallback: { email: normalizedEmail },
        })
      );
      setStatus("idle");
    } catch (authError) {
      setError(authError.message || "Unable to authenticate.");
      setStatus("error");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Jeroen & Paws</Text>
        <Text style={styles.subtitle}>
          Log in or register to manage your bookings and messages.
        </Text>
        <View style={styles.modeToggle}>
          <Pressable
            style={[
              styles.modeButton,
              !isRegistering && styles.modeButtonActive,
            ]}
            onPress={() => setMode("login")}
          >
            <Text
              style={[
                styles.modeButtonText,
                !isRegistering && styles.modeButtonTextActive,
              ]}
            >
              Login
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.modeButton,
              isRegistering && styles.modeButtonActive,
            ]}
            onPress={() => setMode("register")}
          >
            <Text
              style={[
                styles.modeButtonText,
                isRegistering && styles.modeButtonTextActive,
              ]}
            >
              Register
            </Text>
          </Pressable>
        </View>
        <View style={styles.form}>
          {isRegistering ? (
            <>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                value={fullName}
                onChangeText={setFullName}
              />
              <Text style={styles.label}>Phone number</Text>
              <TextInput
                style={styles.input}
                placeholder="+353..."
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Text style={styles.label}>Eircode</Text>
              <TextInput
                style={styles.input}
                placeholder="D02..."
                value={eircode}
                onChangeText={setEircode}
                autoCapitalize="characters"
              />
            </>
          ) : null}
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
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
        <View style={styles.buttonStack}>
          <PrimaryButton
            label={
              status === "loading"
                ? isRegistering
                  ? "Creating account..."
                  : "Signing in..."
                : isRegistering
                ? "Create account"
                : "Login"
            }
            onPress={handleAuthenticate}
            disabled={!canSubmit || status === "loading"}
          />
          <PrimaryButton
            label={isRegistering ? "Switch to login" : "Switch to register"}
            variant="outline"
            onPress={() => setMode(isRegistering ? "login" : "register")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0c081f",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0c081f",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#f4f2ff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#c9c5d8",
    textAlign: "center",
    marginBottom: 24,
  },
  form: {
    width: "100%",
    backgroundColor: "#120d23",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f1535",
    marginBottom: 20,
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "#120d23",
    padding: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f1535",
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: "#7c45f3",
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#c9c5d8",
  },
  modeButtonTextActive: {
    color: "#ffffff",
  },
  label: {
    fontSize: 13,
    color: "#c9c5d8",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#7c45f3",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#f4f2ff",
    marginBottom: 12,
    backgroundColor: "#0c081f",
  },
  buttonStack: {
    width: "100%",
  },
  errorText: {
    color: "#b42318",
    fontSize: 13,
    marginTop: 4,
  },
});

export default AuthScreen;
