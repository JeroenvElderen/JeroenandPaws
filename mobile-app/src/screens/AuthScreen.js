import { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../components/PrimaryButton";
import { supabase, supabaseAdmin } from "../api/supabaseClient";
import { buildSessionPayload, resolveClientProfile } from "../utils/session";
import { useTheme } from "../context/ThemeContext";

const AuthScreen = ({ onAuthenticate }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [mode, setMode] = useState("login");
  const isRegistering = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [eircode, setEircode] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isRegistering) {
      setPhone((current) => (current?.startsWith("+353") ? current : "+353"));
    } else {
      setShowPassword(false);
    }
  }, [isRegistering]);

  const normalizePhone = (value) => {
    const trimmed = value.replace(/\s+/g, "");
    if (!trimmed) return "+353";
    let normalized = trimmed;
    if (normalized.startsWith("+353")) {
      normalized = normalized.slice(4);
    }
    if (normalized.startsWith("0")) {
      normalized = normalized.slice(1);
    }
    normalized = normalized.replace(/[^\d]/g, "");
    return `+353${normalized}`;
  };

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

  const emailError = useMemo(() => {
    if (!email.trim()) return "";
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    return isValid ? "" : "Enter a valid email address.";
  }, [email]);

  const phoneError = useMemo(() => {
    if (!isRegistering) return "";
    if (!phone.trim()) return "";
    const digits = phone.replace(/[^\d]/g, "");
    return digits.length >= 11 ? "" : "Enter a valid Irish mobile number.";
  }, [isRegistering, phone]);

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
        const userMetadata = {
          full_name: fullName.trim(),
          phone: phone.trim(),
          address: eircode.trim(),
        };
        let user = null;

        if (supabaseAdmin) {
          const { error: adminError } =
            await supabaseAdmin.auth.admin.createUser({
              email: normalizedEmail,
              password: password.trim(),
              phone: phone.trim(),
              email_confirm: true,
              user_metadata: userMetadata,
            });

          if (adminError) {
            if (adminError.message?.toLowerCase().includes("already")) {
              throw new Error(
                "An account already exists for this email. Please log in instead."
              );
            }
            throw adminError;
          }

        const signInResult = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: password.trim(),
          });

          if (signInResult.error) {
            throw signInResult.error;
          }

        user = signInResult.data?.user || null;
        } else {
          const signUpResult = await supabase.auth.signUp({
            email: normalizedEmail,
            password: password.trim(),
            options: {
              data: userMetadata,
            },
          });

          if (signUpResult.error) {
            throw signUpResult.error;
          }

          user =
            signUpResult.data?.user ||
            signUpResult.data?.session?.user ||
            (await resolveSignedUpUser(signUpResult));
        }

        const clientProfile = await resolveClientProfile({
          supabase,
          user,
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
          Sign in to manage bookings, messages, and care updates.
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
                style={[styles.input, phoneError && styles.inputError]}
                placeholder="+353..."
                value={phone}
                onChangeText={(value) => setPhone(normalizePhone(value))}
                keyboardType="phone-pad"
              />
              {phoneError ? (
                <Text style={styles.helperError}>{phoneError}</Text>
              ) : null}
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
            style={[styles.input, emailError && styles.inputError]}
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? (
            <Text style={styles.helperError}>{emailError}</Text>
          ) : null}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable
              style={styles.passwordToggle}
              onPress={() => setShowPassword((current) => !current)}
            >
              <Text style={styles.passwordToggleText}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </Pressable>
          </View>
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

const createStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 26,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: theme.spacing.xl,
    },
    form: {
      width: "100%",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.shadow.soft.shadowColor,
      shadowOpacity: theme.shadow.soft.shadowOpacity,
      shadowOffset: theme.shadow.soft.shadowOffset,
      shadowRadius: theme.shadow.soft.shadowRadius,
      elevation: theme.shadow.soft.elevation,
    },
    modeToggle: {
      flexDirection: "row",
      backgroundColor: theme.colors.surfaceElevated,
      padding: theme.spacing.xs,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.md,
    },
    modeButton: {
      flex: 1,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.pill,
      alignItems: "center",
    },
    modeButtonActive: {
      backgroundColor: theme.colors.accent,
    },
    modeButtonText: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    modeButtonTextActive: {
      color: theme.colors.white,
    },
    label: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
      fontWeight: "600",
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceElevated,
    },
    inputError: {
      borderColor: theme.colors.danger,
    },
    helperError: {
      color: theme.colors.danger,
      fontSize: theme.typography.caption.fontSize,
      marginTop: -theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    passwordRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    passwordInput: {
      flex: 1,
      marginBottom: 0,
    },
    passwordToggle: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surfaceElevated,
    },
    passwordToggleText: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    buttonStack: {
      width: "100%",
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.typography.caption.fontSize,
      marginTop: theme.spacing.xs,
    },
  });

export default AuthScreen;
