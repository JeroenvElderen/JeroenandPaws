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
import { useTheme } from "../context/ThemeContext";

const AuthScreen = ({ onAuthenticate }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [mode, setMode] = useState("login");
  const isRegistering = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [eircode, setEircode] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(null);
  const [verificationChannel, setVerificationChannel] = useState("email");

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
        const recipient =
          verificationChannel === "sms" ? phone.trim() : normalizedEmail;
        const signUpResult = await supabase.auth.signInWithOtp({
          ...(verificationChannel === "sms"
            ? { phone: recipient }
            : { email: recipient }),
          options: {
            shouldCreateUser: true,
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

        setPendingVerification({
          channel: verificationChannel,
          recipient,
          email: normalizedEmail,
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: eircode.trim(),
        });
        setVerificationCode("");
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

  const handleVerifyCode = async () => {
    if (!pendingVerification) return;
    if (!verificationCode.trim()) {
      setError("Enter the verification code.");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp(
        pendingVerification.channel === "sms"
          ? {
              phone: pendingVerification.recipient,
              token: verificationCode.trim(),
              type: "sms",
            }
          : {
              email: pendingVerification.recipient,
              token: verificationCode.trim(),
              type: "email",
            }
      );

      if (verifyError) {
        throw verifyError;
      }

      const user = data?.user || (await resolveSignedUpUser({ data })) || null;

      if (!user?.id) {
        throw new Error("We could not verify your account. Please try again.");
      }

      const clientProfile = await resolveClientProfile({
        supabase,
        user,
        fallback: {
          email: pendingVerification.email,
          fullName: pendingVerification.fullName,
          phone: pendingVerification.phone,
          address: pendingVerification.address,
        },
      });

      onAuthenticate(
        buildSessionPayload({
          user,
          client: clientProfile,
          fallback: {
            email: pendingVerification.email,
            phone: pendingVerification.phone,
            address: pendingVerification.address,
          },
        })
      );

      setPendingVerification(null);
      setVerificationCode("");
      setStatus("idle");
    } catch (verifyError) {
      setError(verifyError.message || "Unable to verify your email.");
      setStatus("error");
    }
  };

  const handleResendCode = async () => {
    if (!pendingVerification) return;
    setStatus("loading");
    setError("");

    try {
      const { error: resendError } = await supabase.auth.signInWithOtp({
        ...(pendingVerification.channel === "sms"
          ? { phone: pendingVerification.recipient }
          : { email: pendingVerification.recipient }),
        options: {
          shouldCreateUser: true,
        },
      });

      if (resendError) {
        throw resendError;
      }

      setStatus("idle");
      setError(
        pendingVerification.channel === "sms"
          ? "Verification code sent. Check your SMS messages."
          : "Verification code sent. Check your email."
      );
    } catch (resendError) {
      setError(resendError.message || "Unable to resend code.");
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
        {pendingVerification ? (
          <>
            <View style={styles.form}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={styles.input}
                placeholder="123456"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
              />
              <Text style={styles.helperText}>
                Enter the code sent to {pendingVerification.recipient}.
              </Text>
              {pendingVerification.channel === "email" ? (
                <Text style={styles.helperText}>
                  Emails come from jeroen@jeroenandpaws.com.
                </Text>
              ) : null}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
            <View style={styles.buttonStack}>
              <PrimaryButton
                label={status === "loading" ? "Verifying..." : "Verify code"}
                onPress={handleVerifyCode}
                disabled={status === "loading"}
              />
              <PrimaryButton
                label={
                  status === "loading" ? "Sending code..." : "Resend code"
                }
                variant="outline"
                onPress={handleResendCode}
                disabled={status === "loading"}
              />
            </View>
          </>
        ) : (
          <>
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
                  <View style={styles.channelToggle}>
                    <Pressable
                      style={[
                        styles.channelButton,
                        verificationChannel === "email" &&
                          styles.channelButtonActive,
                      ]}
                      onPress={() => setVerificationChannel("email")}
                    >
                      <Text
                        style={[
                          styles.channelButtonText,
                          verificationChannel === "email" &&
                            styles.channelButtonTextActive,
                        ]}
                      >
                        Send code by email
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.channelButton,
                        verificationChannel === "sms" &&
                          styles.channelButtonActive,
                      ]}
                      onPress={() => setVerificationChannel("sms")}
                    >
                      <Text
                        style={[
                          styles.channelButtonText,
                          verificationChannel === "sms" &&
                            styles.channelButtonTextActive,
                        ]}
                      >
                        Send code by SMS
                      </Text>
                    </Pressable>
                  </View>
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
          </>
        )}
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
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.lg,
    },
    modeToggle: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.xs,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
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
      borderColor: theme.colors.accent,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceElevated,
    },
    channelToggle: {
      flexDirection: "row",
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    channelButton: {
      flex: 1,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.md,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceElevated,
    },
    channelButtonActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    channelButtonText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      fontWeight: "600",
      textAlign: "center",
    },
    channelButtonTextActive: {
      color: theme.colors.white,
    },
    buttonStack: {
      width: "100%",
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.typography.caption.fontSize,
      marginTop: theme.spacing.xs,
    },
    helperText: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.caption.fontSize,
    },
  });

export default AuthScreen;
