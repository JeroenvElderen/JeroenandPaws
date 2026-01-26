import { useEffect, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
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

const CalendarScreen = () => {
  const { session } = useSession();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadBookings = async () => {
      try {
        const data = await fetchJson(
          `/api/client-bookings?email=${encodeURIComponent(session.email)}`
        );
        if (!isMounted) return;
        setBookings(data.bookings || []);
      } catch (error) {
        console.error("Failed to load bookings", error);
      }
    };

    if (session?.email) {
      loadBookings();
    }

    return () => {
      isMounted = false;
    };
  }, [session?.email]);

  const currentMonth = new Date();
  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  const bookedDays = useMemo(() => {
    const days = bookings.reduce((acc, booking) => {
      if (!booking?.start_at) return acc;
      const date = new Date(booking.start_at);
      if (date.getFullYear() === year && date.getMonth() === monthIndex) {
        acc.add(date.getDate());
      }
      return acc;
    }, new Set());

    return days;
  }, [bookings, monthIndex, year]);

  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const calendarSlots = Array.from({ length: firstDayOfMonth }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, index) => index + 1)
  );
  const weeks = [];
  for (let i = 0; i < calendarSlots.length; i += 7) {
    weeks.push(calendarSlots.slice(i, i + 7));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Calendar</Text>
        <View style={styles.calendarCard}>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <View style={styles.weekHeader}>
            {"SMTWTFS".split("").map((day) => (
              <Text key={day} style={styles.weekHeaderText}>
                {day}
              </Text>
            ))}
          </View>
          {weeks.map((week, index) => (
            <View key={`week-${index}`} style={styles.weekRow}>
              {week.map((day, dayIndex) => {
                if (!day) {
                  return <View key={`empty-${dayIndex}`} style={styles.dayCell} />;
                }
                const isBooked = bookedDays.has(day);
                return (
                  <View
                    key={`day-${day}`}
                    style={[styles.dayCell, isBooked && styles.dayBooked]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isBooked && styles.dayTextBooked,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
        <View style={styles.listCard}>
          <Text style={styles.listTitle}>Booked dates</Text>
          {bookings.length === 0 ? (
            <Text style={styles.emptyText}>
              No bookings found for this account yet.
            </Text>
          ) : (
            bookings.map((booking) => {
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
            })
          )}
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
    backgroundColor: "#f6f3fb",
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 16,
    textAlign: "center",
  },
  calendarCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    marginBottom: 20,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 12,
    textAlign: "center",
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekHeaderText: {
    width: 32,
    textAlign: "center",
    color: "#7b6a9f",
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
    backgroundColor: "#6c3ad6",
  },
  dayText: {
    fontSize: 12,
    color: "#2b1a4b",
    fontWeight: "600",
  },
  dayTextBooked: {
    color: "#ffffff",
  },
  listCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ebe4f7",
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 12,
  },
  bookingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f2ecfb",
  },
  bookingDate: {
    fontSize: 14,
    color: "#2b1a4b",
    fontWeight: "600",
  },
  bookingService: {
    fontSize: 13,
    color: "#6c5a92",
    marginTop: 2,
  },
  bookingTime: {
    fontSize: 12,
    color: "#7b6a9f",
    marginTop: 2,
  },
  bookingStatus: {
    fontSize: 12,
    color: "#5d2fc5",
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 13,
    color: "#7b6a9f",
  },
});

export default CalendarScreen;