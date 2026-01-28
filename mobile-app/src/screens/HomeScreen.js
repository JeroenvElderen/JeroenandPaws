import { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchJson } from "../api/client";
import { useSession } from "../context/SessionContext";

const formatDateLabel = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  }).format(date);

const formatTime = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

const formatTimeRange = (start, end) => {
  if (!start || !end) return "Time TBD";
  return `${formatTime(start)} – ${formatTime(end)}`;
};

const formatCountdown = (totalMs) => {
  if (!Number.isFinite(totalMs) || totalMs <= 0) return "0s";
  const totalSeconds = Math.floor(totalMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  }

  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};

const HomeScreen = ({ navigation }) => {
  const { session } = useSession();
  const [bookings, setBookings] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [bookingCount, setBookingCount] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [activeRoverCards, setActiveRoverCards] = useState({});
  const [timeTick, setTimeTick] = useState(Date.now());

  useEffect(() => {
    let isMounted = true;

    const loadBookings = async () => {
      try {
        const data = await fetchJson(
          `/api/client-bookings?email=${encodeURIComponent(session.email)}`
        );
        if (!isMounted) return;
        setBookings(data.bookings || []);
        setLastUpdated(new Date());
        setBookingCount(Array.isArray(data.bookings) ? data.bookings.length : 0);
        setBookingError("");
      } catch (error) {
        console.error("Failed to load bookings", error);
        if (!isMounted) return;
        setBookingError(error?.message || "Unable to load bookings.");
        setBookingCount(0);
      }
    };

    if (session?.email) {
      loadBookings();
    }

    return () => {
      isMounted = false;
    };
  }, [session?.email]);

  useEffect(() => {
    const activeCount = Object.keys(activeRoverCards).length;
    if (!activeCount) {
      return undefined;
    }
    const interval = setInterval(() => setTimeTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeRoverCards]);

  const now = new Date();
  const upcomingBookings = bookings
    .filter((booking) => {
      const start = booking?.start_at ? new Date(booking.start_at) : null;
      const status = (booking?.status || "").toLowerCase();
      if (!start) return false;
      if (status.includes("cancelled") || status.includes("canceled")) {
        return false;
      }
      return start >= now;
    })
    .sort(
      (a, b) => new Date(a.start_at || 0) - new Date(b.start_at || 0)
    );
  const upcomingPreview = upcomingBookings.slice(0, 3);

  const displayName = session?.name || "Jeroen";
  const isJeroenAccount =
    session?.email?.toLowerCase() === "jeroen@jeroenandpaws.com";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.debugBanner}>
          <Text style={styles.debugTitle}>Debug</Text>
          <Text style={styles.debugLine}>
            Email: {session?.email || "—"}
          </Text>
          <Text style={styles.debugLine}>
            Bookings returned: {bookingCount ?? "—"}
          </Text>
          {bookingError ? (
            <Text style={styles.debugError}>Error: {bookingError}</Text>
          ) : null}
        </View>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Hi {displayName}</Text>
            <Text style={styles.subtitle}>Your booking overview</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={() => navigation.navigate("ProfileOverview")}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => navigation.navigate("Messages")}>
              <View style={styles.iconBadge}>
                <Text style={styles.iconBadgeText}>💬</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <Text style={styles.updateText}>
          Updated at {lastUpdated ? formatTime(lastUpdated) : "—"}
        </Text>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>🗓️</Text>
          <Text style={styles.noticeText}>
            {upcomingBookings.length
              ? `${upcomingBookings.length} upcoming booking${
                  upcomingBookings.length === 1 ? "" : "s"
                }`
              : "No upcoming bookings yet"}
          </Text>
        </View>

        <View style={styles.quickActions}>
          <Pressable
            style={({ pressed }) => [
              styles.quickCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => navigation.navigate("Book")}
          >
            <View>
              <Text style={styles.quickLabel}>Book a service</Text>
              <Text style={styles.quickSubtext}>
                Send a new request in seconds
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Upcoming visits</Text>
        {upcomingPreview.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Upcoming bookings will show here once they are confirmed.
            </Text>
          </View>
        ) : (
          upcomingPreview.map((booking) => {
            const start = booking?.start_at ? new Date(booking.start_at) : null;
            const end = booking?.end_at ? new Date(booking.end_at) : null;
            const serviceTitle =
              booking?.service_title || booking?.services_catalog?.title;
            const pets = booking?.pets?.join
              ? booking.pets.join(", ")
              : booking?.pets || "Your pets";
            const bookingId = booking?.id ?? booking?.start_at ?? serviceTitle;
            const hasActiveCard = Boolean(activeRoverCards[bookingId]);
            const durationMs =
              start && end ? Math.max(end.getTime() - start.getTime(), 0) : 0;
            const remainingMs = hasActiveCard
              ? Math.max(durationMs - (timeTick - activeRoverCards[bookingId]), 0)
              : durationMs;

            return (
              <Pressable
                key={bookingId}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => navigation.navigate("Calendar")}
              >
                <View style={styles.cardRow}>
                  <View>
                    <Text style={styles.cardTime}>
                      {formatTimeRange(start, end)}
                    </Text>
                    <Text style={styles.cardTitle}>
                      {serviceTitle || "Service"}
                    </Text>
                    <Text style={styles.cardMeta}>{pets}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {booking.status || "Scheduled"}
                    </Text>
                  </View>
                </View>
                {isJeroenAccount ? (
                  <View style={styles.cardFooter}>
                    {hasActiveCard ? (
                      <Text style={styles.cardTimerText}>
                        {formatCountdown(remainingMs)}
                      </Text>
                    ) : null}
                    <Pressable
                      style={({ pressed }) => [
                        styles.cardButton,
                        hasActiveCard && styles.cardButtonActive,
                        pressed && styles.cardPressed,
                      ]}
                      onPress={() => {
                        if (hasActiveCard) {
                          navigation.navigate("Calendar");
                          return;
                        }
                        setActiveRoverCards((prev) => ({
                          ...prev,
                          [bookingId]: Date.now(),
                        }));
                      }}
                    >
                      <Text
                        style={[
                          styles.cardButtonText,
                          hasActiveCard && styles.cardButtonTextActive,
                        ]}
                      >
                        {hasActiveCard
                          ? "Open Jeroen & Paws Card"
                          : "Start Jeroen & Paws Card"}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </Pressable>
            );
          })
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
  debugBanner: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#efe7dd",
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 4,
  },
  debugLine: {
    fontSize: 13,
    color: "#4a3b63",
    marginBottom: 2,
  },
  debugError: {
    fontSize: 13,
    color: "#b42318",
    marginTop: 4,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#f6f3fb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c5a92",
    marginTop: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#efe9fb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#d8ccef",
  },
  avatarText: {
    fontWeight: "700",
    color: "#5d2fc5",
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e6def6",
  },
  iconBadgeText: {
    fontSize: 18,
  },
  updateText: {
    fontSize: 14,
    color: "#7b6a9f",
    marginBottom: 14,
  },
  noticeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    shadowColor: "#2b1a4b",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 14,
  },
  noticeIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  noticeText: {
    fontSize: 14,
    color: "#3a2b55",
    fontWeight: "700",
  },
  quickActions: {
    gap: 12,
    marginBottom: 12,
  },
  quickCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.96,
  },
  quickLabel: {
    fontSize: 15,
    color: "#2f2149",
    fontWeight: "600",
  },
  quickSubtext: {
    fontSize: 13,
    color: "#7b6a9f",
    marginTop: 4,
  },
  chevron: {
    fontSize: 24,
    color: "#a194bb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
  },
  emptyText: {
    fontSize: 14,
    color: "#7b6a9f",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTime: {
    fontSize: 16,
    color: "#2b1a4b",
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 15,
    color: "#4a3a68",
    marginTop: 4,
    fontWeight: "600",
  },
  cardMeta: {
    fontSize: 14,
    color: "#7b6a9f",
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: "#efe9fb",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadgeText: {
    color: "#5d2fc5",
    fontWeight: "600",
    fontSize: 12,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#efe4d6",
    paddingTop: 12,
    marginTop: 4,
  },
  cardTimerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2f63d6",
    marginBottom: 10,
  },
  cardButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d9d2c7",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  cardButtonActive: {
    backgroundColor: "#2f63d6",
    borderColor: "#2f63d6",
  },
  cardButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#554e44",
    textAlign: "center",
  },
  cardButtonTextActive: {
    color: "#ffffff",
  },
});

export default HomeScreen;