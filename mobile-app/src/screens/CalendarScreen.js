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

const CalendarScreen = () => {
  const { theme } = useTheme();
  const { session } = useSession();
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

  const styles = useMemo(() => createStyles(theme), [theme]);

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

              return (
              <View key={booking.id} style={styles.bookingRow}>
                <View>
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
  calendarCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.soft,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  monthButtonText: {
    fontSize: 18,
    color: theme.colors.accentSoft,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginHorizontal: 12,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 12,
  },
  weekHeaderText: {
    width: 32,
    textAlign: "center",
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dayCell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dayBooked: {
    backgroundColor: theme.colors.surfaceAccent,
  },
  daySelected: {
    backgroundColor: theme.colors.accent,
  },
  dayPressed: {
    opacity: 0.85,
  },
  dayText: {
    fontSize: 12,
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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.soft,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  bookingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  bookingDate: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  bookingService: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  bookingTime: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  bookingStatus: {
    fontSize: 12,
    color: theme.colors.accentSoft,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  });

export default CalendarScreen;
