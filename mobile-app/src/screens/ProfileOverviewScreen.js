import { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../api/supabaseClient";
import ScreenHeader from "../components/ScreenHeader";
import { useSession } from "../context/SessionContext";


const ProfileOverviewScreen = ({ navigation }) => {
  const { session } = useSession();
  const [clientProfile, setClientProfile] = useState(null);
  const [pets, setPets] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!session?.id || !supabase) {
        return;
      }

      try {
        const clientResult = await supabase
          .from("clients")
          .select("*")
          .eq("id", session.id)
          .maybeSingle();

        const petsResult = await supabase
          .from("pets")
          .select("*")
          .eq("owner_id", session.id)
          .order("created_at", { ascending: false });

        if (!isMounted) return;
        if (clientResult.error) {
          throw clientResult.error;
        }
        if (petsResult.error) {
          throw petsResult.error;
        }

        setClientProfile(clientResult.data || null);
        setPets(petsResult.data || []);
      } catch (profileError) {
        console.error("Failed to load profile", profileError);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [session?.id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader title="Profile overview" />
        <Pressable
          style={styles.searchRow}
          onPress={() => navigation.navigate("Book")}
        >
          <Text style={styles.searchIcon}>✨</Text>
          <Text style={styles.searchText}>Book a new service</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Client details</Text>
        <View style={styles.sectionCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>
              {clientProfile?.full_name || session?.name || "—"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>
              {clientProfile?.email || session?.email || "—"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>
              {clientProfile?.phone_number || session?.phone || "—"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Eircode</Text>
            <Text style={styles.detailValue}>
              {clientProfile?.address || session?.address || "—"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Pets</Text>
        {pets.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No pets saved yet. Add a pet in your next booking.
            </Text>
          </View>
        ) : (
          pets.map((pet) => (
            <View key={pet.id || pet.name} style={styles.petCard}>
              <Text style={styles.petName}>{pet.name || "Pet"}</Text>
              <Text style={styles.petMeta}>{pet.breed || "Breed TBD"}</Text>
              <Text style={styles.petMeta}>{pet.age || "Age TBD"}</Text>
            </View>
          ))
        )}
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
    backgroundColor: "#f6f3fb",
    padding: 20,
    paddingBottom: 32,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
    fontSize: 18,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    color: "#3a2b55",
    fontWeight: "600",
  },
  chevron: {
    fontSize: 20,
    color: "#a194bb",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 20,
    overflow: "hidden",
  },
  detailRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f2ecfb",
  },
  detailLabel: {
    fontSize: 12,
    color: "#7b6a9f",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 15,
    color: "#2b1a4b",
    fontWeight: "600",
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#7b6a9f",
  },
  petCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  petMeta: {
    fontSize: 13,
    color: "#6c5a92",
    marginTop: 4,
  },
});

export default ProfileOverviewScreen;