import { useEffect, useState } from "react";
import {
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../api/supabaseClient";
import { useSession } from "../context/SessionContext";

const REVOLUT_PORTAL_URL = "https://revolut.me/jeroenandpaws";

const PaymentMethodsScreen = () => {
  const { session, setSession } = useSession();
  const [billingName, setBillingName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingVat, setBillingVat] = useState("");
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const details =
      session?.user?.user_metadata?.billing_details || session?.client || {};
    setBillingName(details?.billing_name || session?.name || "");
    setBillingAddress(details?.billing_address || session?.address || "");
    setBillingVat(details?.billing_vat || "");
  }, [session]);

  const handleUpdatePayment = async () => {
    await Linking.openURL(REVOLUT_PORTAL_URL);
  };

  const handleSaveBilling = async () => {
    if (!supabase || !session?.user) return;
    setStatus("saving");
    try {
      const billingDetails = {
        billing_name: billingName.trim(),
        billing_address: billingAddress.trim(),
        billing_vat: billingVat.trim(),
      };
      const { error } = await supabase.auth.updateUser({
        data: { billing_details: billingDetails },
      });
      if (error) throw error;
      setSession((current) =>
        current
          ? {
              ...current,
              user: {
                ...current.user,
                user_metadata: {
                  ...current.user.user_metadata,
                  billing_details: billingDetails,
                },
              },
            }
          : current
      );
      setStatus("idle");
    } catch (error) {
      console.error("Failed to update billing details", error);
      setStatus("error");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Payment methods</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Primary card</Text>
          <Text style={styles.value}>
            Manage your saved card through Revolut checkout.
          </Text>
          <Pressable style={styles.button} onPress={handleUpdatePayment}>
            <Text style={styles.buttonText}>Update payment method</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Billing settings</Text>
          <Text style={styles.value}>
            Keep invoice details up to date for receipts.
          </Text>
          <Text style={styles.inputLabel}>Billing name</Text>
          <TextInput
            style={styles.input}
            value={billingName}
            onChangeText={setBillingName}
            placeholder="Name or company"
          />
          <Text style={styles.inputLabel}>Billing address</Text>
          <TextInput
            style={styles.input}
            value={billingAddress}
            onChangeText={setBillingAddress}
            placeholder="Address or Eircode"
          />
          <Text style={styles.inputLabel}>VAT number (optional)</Text>
          <TextInput
            style={styles.input}
            value={billingVat}
            onChangeText={setBillingVat}
            placeholder="VAT number"
          />
          <Pressable style={styles.button} onPress={handleSaveBilling}>
            <Text style={styles.buttonText}>
              {status === "saving" ? "Saving..." : "Update billing details"}
            </Text>
          </Pressable>
          {status === "error" ? (
            <Text style={styles.errorText}>
              We could not save your billing details.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f3fb",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#f6f3fb",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 6,
  },
  value: {
    fontSize: 13,
    color: "#6c5a92",
    marginBottom: 12,
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#efe9fb",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6def6",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4a3a68",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6c5a92",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e6def6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#2b1a4b",
    backgroundColor: "#ffffff",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#b42318",
    marginTop: 6,
  },
});

export default PaymentMethodsScreen;