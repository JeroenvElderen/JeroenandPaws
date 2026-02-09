import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchJson } from "../api/client";
import { supabase } from "../api/supabaseClient";
import { useSession } from "../context/SessionContext";
import { useTheme } from "../context/ThemeContext";

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

const buildDateKey = (year, monthIndex, day) => {
  const month = String(monthIndex + 1).padStart(2, "0");
  const dayValue = String(day).padStart(2, "0");
  return `${year}-${month}-${dayValue}`;
};

const BOOKING_STATUS_STEPS = [
  "Requested",
  "Confirmed",
  "Paid",
  "Completed",
];

const resolveBookingStepIndex = (status) => {
  const normalized = (status || "").toLowerCase();
  if (
    normalized.includes("complete") ||
    normalized.includes("finished") ||
    normalized.includes("done")
  ) {
    return 3;
  }
  if (normalized.includes("paid")) return 2;
  if (normalized.includes("confirm")) return 1;
  if (normalized.includes("request") || normalized.includes("pending")) return 0;
  return 0;
};

const CalendarScreen = ({ navigation }) => {
  const { session } = useSession();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [bookings, setBookings] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(async () => {
    if (!session?.email) return;
    try {
      const data = await fetchJson(
        `/api/client-bookings?email=${encodeURIComponent(session.email)}`
      );
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Failed to load bookings", error);
    }
  }, [session?.email]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    if (!supabase || !session?.id) {
      return undefined;
    }

    const bookingFilter = session?.id
      ? `client_id=eq.${session.id}`
      : undefined;
    const channel = supabase
      .channel("calendar-bookings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: bookingFilter },
        () => {
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadBookings, session?.id]);

  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  const bookingMap = useMemo(() => {
    return bookings.reduce((acc, booking) => {
      if (!booking?.start_at) return acc;
      const date = new Date(booking.start_at);
      const dateKey = buildDateKey(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(booking);
      return acc;
    }, {});
  }, [bookings]);

  useEffect(() => {
    const monthBookings = Object.keys(bookingMap)
      .filter((key) => key.startsWith(`${year}-${String(monthIndex + 1).padStart(2, "0")}`))
      .sort();

    if (!monthBookings.length) {
      setSelectedDateKey(null);
      return;
    }

    const selectionInMonth =
      selectedDateKey && selectedDateKey.startsWith(`${year}-${String(monthIndex + 1).padStart(2, "0")}`);

    if (!selectionInMonth) {
      setSelectedDateKey(monthBookings[0]);
    }
  }, [bookingMap, monthIndex, selectedDateKey, year]);

  const selectedBookings = selectedDateKey
    ? bookingMap[selectedDateKey] || []
    : [];

  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const calendarSlots = Array.from({ length: firstDayOfMonth }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, index) => index + 1)
  );
  const weeks = [];
  for (let i = 0; i < calendarSlots.length; i += 7) {
    const week = calendarSlots.slice(i, i + 7);
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadBookings();
              setRefreshing(false);
            }}
            tintColor={theme.colors.accent}
          />
        }
      >
        <Text style={styles.title}>Calendar</Text>
        <View style={styles.syncCard}>
          <Text style={styles.syncTitle}>Calendar sync</Text>
          <Text style={styles.syncSubtitle}>
            Keep bookings visible in Google, Apple, or Outlook. Send your
            preferred calendar email and we will connect the feed.
          </Text>
          {[
            { key: "google", label: "Google Calendar" },
            { key: "apple", label: "Apple Calendar" },
            { key: "outlook", label: "Outlook" },
          ].map((provider, index, all) => (
            <View
              key={provider.key}
              style={[
                styles.syncRow,
                index === all.length - 1 && styles.syncRowLast,
              ]}
            >
              <View>
                <Text style={styles.syncProvider}>{provider.label}</Text>
                <Text style={styles.syncStatus}>Not connected</Text>
              </View>
              <Pressable
                style={styles.syncAction}
                onPress={() => navigation.navigate("Messages")}
              >
                <Text style={styles.syncActionText}>Request sync</Text>
              </Pressable>
            </View>
          ))}
        </View>
        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Pressable style={styles.monthButton} onPress={goToPreviousMonth}>
              <Text style={styles.monthButtonText}>‹</Text>
            </Pressable>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <Pressable style={styles.monthButton} onPress={goToNextMonth}>
              <Text style={styles.monthButtonText}>›</Text>
            </Pressable>
          </View>
          <View style={styles.weekHeader}>
            {"SMTWTFS".split("").map((day, index) => (
              <Text key={`${day}-${index}`} style={styles.weekHeaderText}>
                {day}
              </Text>
            ))}
          </View>
          {weeks.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.weekRow}>
              {week.map((day, dayIndex) => {
                if (!day) {
                  return (
                    <View
                      key={`empty-${weekIndex}-${dayIndex}`}
                      style={styles.dayCell}
                    />
                  );
                }
                const dateKey = buildDateKey(year, monthIndex, day);
                const isBooked = Boolean(bookingMap[dateKey]?.length);
                const isSelected = selectedDateKey === dateKey;
                
                return (
                  <Pressable
                    key={dateKey}
                    style={({ pressed }) => [
                      styles.dayCell,
                      isBooked && styles.dayBooked,
                      isSelected && styles.daySelected,
                      pressed && styles.dayPressed,
                    ]}
                    onPress={() => setSelectedDateKey(dateKey)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isBooked && styles.dayTextBooked,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
        <View style={styles.listCard}>
          <Text style={styles.listTitle}>
            {selectedDateKey ? "Booking details" : "Select a date"}
          </Text>
          {selectedDateKey && selectedBookings.length === 0 ? (
            <Text style={styles.emptyText}>No bookings on this date.</Text>
          ) : null}
          {!selectedDateKey && bookings.length === 0 ? (
            <Text style={styles.emptyText}>
              No bookings found for this account yet.
            </Text>
          ) : null}
          {selectedBookings.map((booking) => {
            const start = booking?.start_at ? new Date(booking.start_at) : null;
            const end = booking?.end_at ? new Date(booking.end_at) : null;
            const serviceTitle =
              booking?.service_title || booking?.services_catalog?.title;
            const statusStepIndex = resolveBookingStepIndex(booking?.status);

              return (
              <View key={booking.id} style={styles.bookingRow}>
                <View style={styles.bookingCopy}>
                  <Text style={styles.bookingDate}>
                    {start ? formatDateLabel(start) : "Date TBD"}
                  </Text>
                  <Text style={styles.bookingService}>
                    {serviceTitle || "Service"}
                  </Text>
                  <Text style={styles.bookingTime}>
                    {start && end
                      ? `${formatTime(start)} – ${formatTime(end)}`
                      : "Time TBD"}
                  </Text>
                  <View style={styles.statusTimeline}>
                    {BOOKING_STATUS_STEPS.map((step, index) => {
                      const isComplete = index <= statusStepIndex;
                      const isLast = index === BOOKING_STATUS_STEPS.length - 1;
                      return (
                        <View key={step} style={styles.statusStep}>
                          <View style={styles.statusIndicator}>
                            <View
                              style={[
                                styles.statusDot,
                                isComplete && styles.statusDotActive,
                              ]}
                            />
                            {!isLast ? (
                              <View
                                style={[
                                  styles.statusLine,
                                  isComplete && styles.statusLineActive,
                                ]}
                              />
                            ) : null}
                          </View>
                          <Text
                            style={[
                              styles.statusLabel,
                              isComplete && styles.statusLabelActive,
                            ]}
                          >
                            {step}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                  <Pressable
                    style={styles.galleryButton}
                    onPress={() =>
                      navigation.navigate("BookingGallery", {
                        bookingId: booking.id,
                        bookingTitle: serviceTitle || "Booking",
                      })
                    }
                  >
                    <Text style={styles.galleryButtonText}>
                      View booking gallery
                    </Text>
                  </Pressable>
                </View>
              <Text style={styles.bookingStatus}>
                  {booking.status || "Scheduled"}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
      flexGrow: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      textAlign: "center",
    },
    syncCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.lg,
    },
    syncTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    syncSubtitle: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    syncRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    syncRowLast: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },
    syncProvider: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textPrimary,
      fontWeight: "600",
    },
    syncStatus: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    syncAction: {
      backgroundColor: theme.colors.surfaceAccent,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: 999,
    },
    syncActionText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.accentSoft,
      fontWeight: "600",
    },
    calendarCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginBottom: theme.spacing.lg,
    },
    monthHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
    },
    monthButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surfaceAccent,
      alignItems: "center",
      justifyContent: "center",
    },
    monthButtonText: {
      fontSize: 18,
      color: theme.colors.accentSoft,
    },
    monthLabel: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      textAlign: "center",
      marginHorizontal: theme.spacing.sm,
    },
    weekHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    weekHeaderText: {
      width: 32,
      textAlign: "center",
      color: theme.colors.textMuted,
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "600",
    },
    weekRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.xs,
    },
    dayCell: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "transparent",
    },
    dayBooked: {
      backgroundColor: theme.colors.surfaceAccent,
    },
    daySelected: {
      backgroundColor: theme.colors.accentDeep,
      borderColor: theme.colors.accentDeep,
    },
    dayPressed: {
      opacity: 0.85,
    },
    dayText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      fontWeight: "600",
    },
    dayTextBooked: {
      color: theme.colors.accentSoft,
    },
    dayTextSelected: {
      color: theme.colors.white,
    },
    listCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
    },
    listTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    bookingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    bookingCopy: {
      flex: 1,
      paddingRight: theme.spacing.sm,
    },
    bookingDate: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textPrimary,
      fontWeight: "600",
    },
    bookingService: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    bookingTime: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    bookingStatus: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.accentSoft,
      fontWeight: "600",
    },
    galleryButton: {
      alignSelf: "flex-start",
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.surfaceAccent,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    galleryButtonText: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    statusTimeline: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: theme.spacing.sm,
    },
    statusStep: {
      flex: 1,
      alignItems: "center",
    },
    statusIndicator: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.border,
    },
    statusDotActive: {
      backgroundColor: theme.colors.accent,
    },
    statusLine: {
      flex: 1,
      height: 2,
      backgroundColor: theme.colors.border,
      marginHorizontal: 3,
    },
    statusLineActive: {
      backgroundColor: theme.colors.accent,
    },
    statusLabel: {
      marginTop: theme.spacing.xs,
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textMuted,
      textAlign: "center",
    },
    statusLabelActive: {
      color: theme.colors.textPrimary,
      fontWeight: "600",
    },
    emptyText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
    },
  });

export default CalendarScreen;
