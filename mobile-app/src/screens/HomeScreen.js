import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { fetchJson } from "../api/client";
import { DEFAULT_AVAILABILITY_WINDOW_DAYS } from "../api/availability";
import {
  AVAILABILITY_TIMEOUT_MS,
  getCachedAvailability,
  prefetchAvailability,
} from "../api/availabilityCache";
import { supabase } from "../api/supabaseClient";
import { useSession } from "../context/SessionContext";
import { loadActiveCards, saveActiveCards } from "../utils/activeCards";

const OWNER_EMAIL = "jeroen@jeroenandpaws.com";
const OWNER_CLIENT_ID = "94cab38a-1f08-498b-8efa-7ed8f561926f";

const formatDateLabel = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  }).format(date);

const formatDateStamp = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
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

const formatElapsedTime = (totalMs) => {
  if (!Number.isFinite(totalMs) || totalMs < 0) return "00:00:00";
  const totalSeconds = Math.floor(totalMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
};

const formatPetsLabel = (pets) => {
  if (!pets) return "Pets";
  if (Array.isArray(pets)) {
    const names = pets
      .map((pet) => (typeof pet === "string" ? pet : pet?.name))
      .filter(Boolean);
    return names.length ? names.join(", ") : "Pets";
  }
  if (typeof pets === "string") return pets;
  if (typeof pets === "object") return pets.name || "Pets";
  return "Pets";
};

const startOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value = new Date()) => {
  const date = startOfDay(value);
  date.setDate(date.getDate() + 1);
  return date;
};

const isSameDay = (value, reference) =>
  value &&
  reference &&
  startOfDay(value).getTime() === startOfDay(reference).getTime();

const resolveBookingPets = (booking) => {
  const directPets = booking?.pets;

  if (Array.isArray(directPets)) {
    return directPets.filter(Boolean);
  }

  if (directPets && typeof directPets === "object") {
    return [directPets];
  }

  if (typeof directPets === "string") {
    return [directPets];
  }

  const bookingPets = Array.isArray(booking?.booking_pets)
    ? booking.booking_pets
        .map((bookingPet) => bookingPet?.pets || bookingPet?.pet)
        .filter(Boolean)
    : [];

  return bookingPets;
};

const HomeScreen = ({ navigation }) => {
  const { session } = useSession();
  const [bookings, setBookings] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeRoverCards, setActiveRoverCards] = useState({});
  const [activeCardsLoaded, setActiveCardsLoaded] = useState(false);
  const [timeTick, setTimeTick] = useState(Date.now());
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [finishedCards, setFinishedCards] = useState({});
  const isJeroenAccount =
    session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const dateStamp = useMemo(() => formatDateStamp(new Date()), []);

  const loadBookings = useCallback(
    async (options = {}) => {
      const { silent = false } = options;
      if (!session?.email) return;

      try {
        const data = await fetchJson(
          `/api/client-bookings?email=${encodeURIComponent(session.email)}`,
          { timeoutMs: 10000 }
        );
        setBookings(data.bookings || []);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to load bookings", error);
      }
    },
    [session?.email]
  );

  useEffect(() => {
    if (session?.email) {
      loadBookings();
    }
  }, [session?.email, loadBookings]);

  useEffect(() => {
    let isMounted = true;
    const loadStoredActiveCards = async () => {
      if (!isJeroenAccount || !session?.email) {
        setActiveCardsLoaded(true);
        return;
      }
      const stored = await loadActiveCards(session.email);
      if (!isMounted) return;
      setActiveRoverCards(stored);
      setActiveCardsLoaded(true);
    };
    loadStoredActiveCards();
    return () => {
      isMounted = false;
    };
  }, [isJeroenAccount, session?.email]);

  useEffect(() => {
    if (!activeCardsLoaded || !isJeroenAccount || !session?.email) {
      return;
    }
    saveActiveCards(session.email, activeRoverCards);
  }, [activeCardsLoaded, activeRoverCards, isJeroenAccount, session?.email]);

  useFocusEffect(
    useCallback(() => {
      if (session?.email) {
        loadBookings({ silent: true });
      }
    }, [loadBookings, session?.email])
  );

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const loadInitialAvailability = async () => {
      const clientAddress = (session?.address || session?.client?.address || "")
        .trim();
      if (!clientAddress) return;

      try {
        const defaultDurationMinutes = 60;
        const cached = getCachedAvailability({
          durationMinutes: defaultDurationMinutes,
          windowDays: DEFAULT_AVAILABILITY_WINDOW_DAYS,
          clientAddress,
        });
        if (cached) return;
        const data = await fetchJson("/api/services", {
          timeoutMs: AVAILABILITY_TIMEOUT_MS,
        });
        if (!isMounted) return;
        const services = (data?.services || []).filter(Boolean);
        if (!services.length) return;
        await Promise.all(
          services.map((service) => {
            const durationMinutes = Number(
              service.duration_minutes ||
                service.durationMinutes ||
                defaultDurationMinutes
            );
            return prefetchAvailability({
              durationMinutes,
              windowDays: DEFAULT_AVAILABILITY_WINDOW_DAYS,
              clientAddress,
              timeoutMs: AVAILABILITY_TIMEOUT_MS,
            });
          })
        );
      } catch (error) {
        console.warn("Failed to prefetch availability", error);
      }
    };

    if (session?.email) {
      timeoutId = setTimeout(loadInitialAvailability, 150);
    }

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [session?.email, session?.address]);

  useEffect(() => {
    const activeCount = Object.keys(activeRoverCards).length;
    if (!activeCount) {
      return undefined;
    }
    const interval = setInterval(() => setTimeTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeRoverCards]);

  const loadFinishedCards = useCallback(async () => {
    if (!supabase || !session?.email) {
      setFinishedCards({});
      return;
    }

    try {
      const dayStart = startOfDay();
      const dayEnd = endOfDay();
      let query = supabase
        .from("jeroen_paws_cards")
        .select("*")
        .gte("finished_at", dayStart.toISOString())
        .lt("finished_at", dayEnd.toISOString());

      if (isJeroenAccount) {
        query = query.eq("owner_email", session.email);
      } else if (session?.id) {
        query = query.eq("client_id", session.id);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      const mapped = (data || []).reduce((acc, card) => {
        if (card?.booking_id) {
          acc[card.booking_id] = card;
        }
        return acc;
      }, {});
      setFinishedCards(mapped);
    } catch (error) {
      console.error("Failed to load finished cards", error);
    }
  }, [isJeroenAccount, session?.email, session?.id]);

  useEffect(() => {
    loadFinishedCards();
  }, [loadFinishedCards]);

  useEffect(() => {
    if (!Object.keys(finishedCards).length) {
      return;
    }
    setActiveRoverCards((prev) => {
      const next = { ...prev };
      Object.keys(finishedCards).forEach((bookingId) => {
        delete next[bookingId];
      });
      return next;
    });
  }, [finishedCards]);

  useEffect(() => {
    if (!supabase || !session?.id) {
      return undefined;
    }

    const bookingFilter =
      !isJeroenAccount && session?.id
        ? `client_id=eq.${session.id}`
        : undefined;
    const bookingChannel = supabase
      .channel("bookings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: bookingFilter },
        () => {
          loadBookings({ silent: true });
        }
      )
      .subscribe();

    const cardChannel = supabase
      .channel("jeroen-paws-cards-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "jeroen_paws_cards" },
        () => {
          loadFinishedCards();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(cardChannel);
    };
  }, [isJeroenAccount, loadBookings, loadFinishedCards, session?.id]);

  useEffect(() => {
    if (!supabase || !session?.id) {
      return undefined;
    }

    const messageChannel = supabase
      .channel("messages-unread")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          loadUnreadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [loadUnreadMessages, session?.id]);

  const now = new Date();
  const upcomingBookings = bookings
    .filter((booking) => {
      const start = booking?.start_at ? new Date(booking.start_at) : null;
      const status = (booking?.status || "").toLowerCase();
      if (!start) return false;
      if (status.includes("cancelled") || status.includes("canceled")) {
        return false;
      }
      const isAllowedStatus =
        !status ||
        status.includes("confirmed") ||
        status.includes("paid") ||
        status.includes("scheduled") ||
        status.includes("completed") ||
        status.includes("finished");
      if (!isAllowedStatus) {
        return false;
      }
      if (isSameDay(start, now)) {
        return true;
      }
      return start >= now;
    })
    .sort(
      (a, b) => new Date(a.start_at || 0) - new Date(b.start_at || 0)
    );
  const upcomingPreview = upcomingBookings;

  const displayName = session?.name || "Jeroen";
  const firstName = displayName.split(" ").filter(Boolean)[0] || displayName;
  const unreadBadgeCount = useMemo(() => {
    if (!unreadCount) return 0;
    if (isJeroenAccount) return unreadCount;
    return 1;
  }, [isJeroenAccount, unreadCount]);
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const loadUnreadMessages = useCallback(async () => {
    if (!session?.id || !supabase) {
      setUnreadCount(0);
      return;
    }

    const isOwner = isJeroenAccount;
    const storageKey = `messages:lastRead:${
      isOwner ? OWNER_CLIENT_ID : session.id
    }`;

    try {
      const raw = await AsyncStorage.getItem(storageKey);
      const lastReadMap = raw ? JSON.parse(raw) : {};
      const lastReadValues = Object.values(lastReadMap)
        .map((value) => new Date(value).getTime())
        .filter((value) => Number.isFinite(value));
      const minLastRead =
        lastReadValues.length > 0 ? Math.min(...lastReadValues) : null;

      let query = supabase
        .from("messages")
        .select("client_id, created_at, sender")
        .order("created_at", { ascending: false });

      if (isOwner) {
        query = query.eq("sender", "client");
      } else {
        query = query.eq("sender", "owner").eq("client_id", session.id);
      }

      if (minLastRead) {
        query = query.gt("created_at", new Date(minLastRead).toISOString());
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      const unreadClients = (data || []).reduce((acc, message) => {
        const lastRead = lastReadMap[message.client_id];
        if (!lastRead) {
          acc.add(message.client_id);
          return acc;
        }
        if (new Date(message.created_at) > new Date(lastRead)) {
          acc.add(message.client_id);
        }
        return acc;
      }, new Set());

      const count = unreadClients.size;

      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load unread messages", error);
    }
  }, [isJeroenAccount, session?.id]);

  useFocusEffect(
    useCallback(() => {
      loadUnreadMessages();
    }, [loadUnreadMessages])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await Promise.all([
                loadBookings(),
                loadFinishedCards(),
                loadUnreadMessages(),
              ]);
              setRefreshing(false);
            }}
            tintColor="#5d2fc5"
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Hi {firstName}</Text>
            <Text style={styles.subtitle}>Your booking overview</Text>
            <Text style={styles.dateStamp}>{dateStamp}</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              onPress={() =>
                navigation.navigate("Profile", { screen: "ProfileOverview" })
              }
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => navigation.navigate("Messages")}>
              <View style={styles.iconBadgeWrapper}>
                <View style={styles.iconBadge}>
                  <Ionicons name="chatbubble-ellipses" size={18} color="#f4f2ff" />
                </View>
                {unreadBadgeCount > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>
                      {unreadBadgeCount}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          </View>
        </View>

        <Text style={styles.updateText}>
          Updated at {lastUpdated ? formatTime(lastUpdated) : "—"}
        </Text>

        <View style={styles.noticeCard}>
          <Ionicons name="calendar" size={18} color="#f4f2ff" />
          <Text style={styles.noticeText}>
            {upcomingBookings.length
              ? `${upcomingBookings.length} upcoming booking${
                  upcomingBookings.length === 1 ? "" : "s"
                }`
              : "No upcoming bookings yet"}
          </Text>
        </View>

        {!isJeroenAccount ? (
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
        ) : null}

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
            const petList = resolveBookingPets(booking);
            const petsLabel = formatPetsLabel(petList);
            const bookingId = booking?.id ?? booking?.start_at ?? serviceTitle;
            const finishedCard = finishedCards[booking?.id];
            const hasActiveCard = Boolean(activeRoverCards[bookingId]);
            const activeStart = activeRoverCards[bookingId];
            const canViewCard = Boolean(finishedCard?.id);
            const elapsedMs =
              hasActiveCard && activeStart
                ? Math.max(timeTick - activeStart, 0)
                : 0;

            return (
              <View
                key={bookingId}
                style={[
                  styles.card,
                  isJeroenAccount && styles.cardJeroen,
                  hasActiveCard && styles.cardJeroenActive,
                ]}
              >
                <View style={styles.cardRow}>
                  <View>
                    <Text style={styles.cardTime}>
                      {formatTimeRange(start, end)}
                    </Text>
                    <Text style={styles.cardTitle}>
                      {serviceTitle || "Service"}
                    </Text>
                    <Text style={styles.cardMeta}>{petsLabel}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {finishedCard
                        ? "Finished"
                        : booking.status || "Scheduled"}
                    </Text>
                  </View>
                </View>
                {isJeroenAccount || canViewCard ? (
                  <View style={styles.cardFooter}>
                    {isJeroenAccount && hasActiveCard ? (
                      <Text style={styles.cardTimerText}>
                        Timer {formatElapsedTime(elapsedMs)}
                      </Text>
                    ) : null}
                    <Pressable
                      style={({ pressed }) => [
                        styles.cardButton,
                        (hasActiveCard || finishedCard) &&
                          styles.cardButtonActive,
                        pressed && styles.cardPressed,
                      ]}
                      onPress={() => {
                        if (finishedCard?.id) {
                          navigation.navigate("JeroenPawsCard", {
                            cardId: finishedCard.id,
                            readOnly: true,
                          });
                          return;
                        }
                        if (hasActiveCard) {
                          navigation.navigate("JeroenPawsCard", {
                            bookingId,
                            serviceTitle,
                            pets: petList,
                            clientId: booking?.client_id,
                            startedAt: activeStart,
                            bookingStart: booking?.start_at,
                            bookingEnd: booking?.end_at,
                          });
                          return;
                        }
                        if (!isJeroenAccount) {
                          return;
                        }
                        const startTimestamp = Date.now();
                        setActiveRoverCards((prev) => ({
                          ...prev,
                          [bookingId]: startTimestamp,
                        }));
                        navigation.navigate("JeroenPawsCard", {
                          bookingId,
                          serviceTitle,
                          pets: petList,
                          clientId: booking?.client_id,
                          startedAt: startTimestamp,
                          bookingStart: booking?.start_at,
                          bookingEnd: booking?.end_at,
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.cardButtonText,
                          (hasActiveCard || finishedCard) &&
                            styles.cardButtonTextActive,
                        ]}
                      >
                        {finishedCard
                          ? "Open Jeroen & Paws Card"
                          : hasActiveCard
                          ? "Open Jeroen & Paws Card"
                          : isJeroenAccount
                          ? "Start Jeroen & Paws Card"
                          : "View Jeroen & Paws Card"}
                      </Text>
                    </Pressable>
                    {isJeroenAccount && booking?.client_id ? (
                      <Pressable
                        style={({ pressed }) => [
                          styles.cardButton,
                          pressed && styles.cardPressed,
                        ]}
                        onPress={() =>
                          navigation.navigate("Profile", {
                            screen: "ProfileOverview",
                            params: { clientId: booking.client_id },
                          })
                        }
                      >
                        <Text style={styles.cardButtonText}>
                          View client profile
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>
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
    backgroundColor: "#0c081f",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#0c081f",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#120d23",
    borderWidth: 1,
    borderColor: "#1f1535",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f4f2ff",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: "#c9c5d8",
    marginTop: 2,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  dateStamp: {
    fontSize: 13,
    color: "#8b7ca8",
    marginTop: 4,
    letterSpacing: 0.2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#1f1535",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#2a1d45",
  },
  avatarText: {
    fontWeight: "700",
    color: "#f4f2ff",
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1f1535",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2a1d45",
  },
  iconBadgeWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: "#d33a3a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#0c081f",
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
  },
  updateText: {
    fontSize: 14,
    color: "#8b7ca8",
    marginBottom: 14,
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  noticeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#120d23",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f1535",
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 14,
    gap: 10,
  },
  noticeText: {
    fontSize: 14,
    color: "#f4f2ff",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  quickActions: {
    gap: 12,
    marginBottom: 12,
  },
  quickCard: {
    backgroundColor: "#120d23",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f1535",
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
    color: "#f4f2ff",
    fontWeight: "600",
  },
  quickSubtext: {
    fontSize: 13,
    color: "#c9c5d8",
    marginTop: 4,
  },
  chevron: {
    fontSize: 24,
    color: "#8b6ca8",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f4f2ff",
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: "#120d23",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f1535",
  },
  emptyText: {
    fontSize: 14,
    color: "#c9c5d8",
  },
  card: {
    backgroundColor: "#120d23",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f1535",
    marginBottom: 16,
  },
  cardJeroen: {
    borderColor: "#2f2149",
  },
  cardJeroenActive: {
    borderWidth: 2,
    borderColor: "#7c45f3",
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 4,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTime: {
    fontSize: 16,
    color: "#f4f2ff",
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 15,
    color: "#c9c5d8",
    marginTop: 4,
    fontWeight: "600",
  },
  cardMeta: {
    fontSize: 14,
    color: "#8b7ca8",
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: "#1f1535",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadgeText: {
    color: "#bfa7ff",
    fontWeight: "600",
    fontSize: 12,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#1f1535",
    paddingTop: 12,
    marginTop: 4,
  },
  cardTimerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7c45f3",
    marginBottom: 10,
  },
  cardButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2a1d45",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#120d23",
    marginBottom: 12,
  },
  cardButtonActive: {
    backgroundColor: "#7c45f3",
    borderColor: "#7c45f3",
  },
  cardButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f4f2ff",
    textAlign: "center",
  },
  cardButtonTextActive: {
    color: "#ffffff",
  },
});

export default HomeScreen;
