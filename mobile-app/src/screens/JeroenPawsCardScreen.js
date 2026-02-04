import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { supabase } from "../api/supabaseClient";
import { useSession } from "../context/SessionContext";
import { clearActiveCard } from "../utils/activeCards";

const OWNER_EMAIL = "jeroen@jeroenandpaws.com";

const defaultActivities = [
  { key: "pee", label: "Pee", icon: "💧" },
  { key: "poo", label: "Poo", icon: "💩" },
  { key: "food", label: "Food", icon: "🍽️" },
  { key: "water", label: "Water", icon: "🧊" },
  { key: "walk", label: "Walk", icon: "🐾" },
];

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

const normalizePets = (pets) => {
  if (!pets) return [];
  if (Array.isArray(pets)) {
    return pets
      .map((pet) => {
        if (!pet) return null;
        if (typeof pet === "string") return { name: pet };
        return pet;
      })
      .filter(Boolean);
  }
  if (typeof pets === "string") {
    return [{ name: pets }];
  }
  if (typeof pets === "object") {
    return [pets];
  }
  return [];
};

const buildPetMeta = (pet) => {
  if (!pet) return "Pet details";
  const resolveAge = () => {
    if (pet.age) {
      return typeof pet.age === "number" ? `${pet.age} yrs` : pet.age;
    }
    if (Number.isFinite(pet.age_years)) {
      return `${pet.age_years} yrs`;
    }
    if (Number.isFinite(pet.ageYears)) {
      return `${pet.ageYears} yrs`;
    }
    if (Number.isFinite(pet.age_months)) {
      return `${pet.age_months} mos`;
    }
    if (Number.isFinite(pet.ageMonths)) {
      return `${pet.ageMonths} mos`;
    }
    return null;
  };
  const age = resolveAge();
  const weight = pet.weight_kg
    ? `${pet.weight_kg} kg`
    : pet.weight
    ? `${pet.weight}`
    : null;
  const details = [pet.breed, age, weight].filter(Boolean);
  return details.length ? details.join(" · ") : "Pet details";
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

const buildStaticMapUrl = (coords) => {
  if (!coords) return null;
  const lat = coords.latitude.toFixed(5);
  const lon = coords.longitude.toFixed(5);
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=15&size=640x320&markers=${lat},${lon},red-pushpin`;
};

const JeroenPawsCardScreen = ({ navigation, route }) => {
  const { session } = useSession();
  const isOwner =
    session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const petList = useMemo(
    () => normalizePets(route?.params?.pets || route?.params?.pet),
    [route?.params?.pet, route?.params?.pets]
  );
  const petsLabel = petList.length
    ? formatPetsLabel(petList)
    : "Your pets";
  const resolvedPets = useMemo(
    () =>
      petList.length
        ? petList
        : [
            {
              name: petsLabel,
              id: "default",
            },
          ],
    [petList, petsLabel]
  );
  const serviceTitle = route?.params?.serviceTitle || "Drop-In Visits";
  const [note, setNote] = useState("");
  const [photoCount, setPhotoCount] = useState(0);
  const [cardPhotos, setCardPhotos] = useState([]);
  const [photoUploadStatus, setPhotoUploadStatus] = useState("idle");
  const [photoUploadError, setPhotoUploadError] = useState("");
  const [walkCompleted, setWalkCompleted] = useState(false);
  const [finishStatus, setFinishStatus] = useState("idle");
  const [finishError, setFinishError] = useState("");
  const [finishedAt, setFinishedAt] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const locationSubscriptionRef = useRef(null);
  const [loadedCardId, setLoadedCardId] = useState(null);
  const isReadOnly = Boolean(route?.params?.readOnly || route?.params?.cardId);
  const [cardStartedAt, setCardStartedAt] = useState(
    route?.params?.startedAt || route?.params?.bookingStart || Date.now()
  );
  const [cardPets, setCardPets] = useState(resolvedPets);
  const [cardPetsLabel, setCardPetsLabel] = useState(petsLabel);
  const [cardServiceTitle, setCardServiceTitle] = useState(serviceTitle);
  const bookingStart = route?.params?.bookingStart
    ? new Date(route.params.bookingStart)
    : null;
  const bookingEnd = route?.params?.bookingEnd
    ? new Date(route.params.bookingEnd)
    : null;
  const bookingDurationMinutes =
    bookingStart && bookingEnd
      ? Math.max(
          Math.floor((bookingEnd.getTime() - bookingStart.getTime()) / 60000),
          0
        )
      : 0;
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  const remainingMs = bookingDurationMinutes
    ? Math.max((bookingDurationMinutes - elapsedMinutes) * 60000, 0)
    : 0;
  const canFinishVisit =
    !isOwner || !bookingDurationMinutes || elapsedMinutes >= bookingDurationMinutes;

  const getPetKey = (pet, index) => pet?.id || pet?.name || `pet-${index}`;

  const buildActivityCounts = (pets) =>
    pets.reduce((acc, pet, index) => {
      const petKey = getPetKey(pet, index);
      acc[petKey] = defaultActivities.reduce((activityAcc, activity) => {
        activityAcc[activity.key] = 0;
        return activityAcc;
      }, {});
      return acc;
    }, {});

  const [counts, setCounts] = useState(() => buildActivityCounts(cardPets));

  useEffect(() => {
    if (!isReadOnly) {
      setCardPets(resolvedPets);
      setCardPetsLabel(petsLabel);
      setCardServiceTitle(serviceTitle);
      setCounts(buildActivityCounts(resolvedPets));
    }
  }, [resolvedPets, petsLabel, serviceTitle, isReadOnly]);

  const updateCount = (petKey, key, delta) => {
    setCounts((prev) => ({
      ...prev,
      [petKey]: {
        ...prev[petKey],
        [key]: Math.max(0, (prev[petKey]?.[key] || 0) + delta),
      },
    }));
  };

  useEffect(() => {
    if (!isOwner || isReadOnly) {
      return undefined;
    }
    let isMounted = true;
    const startTracking = async () => {
      setLocationError("");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (isMounted) {
          setLocationError("Location permission is required for tracking.");
        }
        return;
      }
      try {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (isMounted) {
          setLocation(current.coords);
        }
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 5,
          },
          (update) => {
            if (!isMounted) return;
            setLocation(update.coords);
          }
        );
        locationSubscriptionRef.current = subscription;
      } catch (error) {
        if (isMounted) {
          setLocationError("Unable to load live location right now.");
        }
      }
    };
    startTracking();
    return () => {
      isMounted = false;
      locationSubscriptionRef.current?.remove?.();
      locationSubscriptionRef.current = null;
    };
  }, [isOwner, isReadOnly]);

  useEffect(() => {
    let isMounted = true;

    const loadFinishedCard = async () => {
      if (!route?.params?.cardId || !supabase) return;

      try {
        const { data, error } = await supabase
          .from("jeroen_paws_cards")
          .select("*")
          .eq("id", route.params.cardId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!isMounted || !data) return;
        setLoadedCardId(data.id);
        setNote(data.note || "");
        setPhotoCount(data.photo_count || 0);
        setWalkCompleted(Boolean(data.walk_completed));
        setFinishedAt(data.finished_at || null);
        if (data.service_title) {
          setCardServiceTitle(data.service_title);
        }
        if (data.pets_label) {
          setCardPetsLabel(data.pets_label);
        }
        if (data.pets) {
          setCardPets(normalizePets(data.pets));
        }
        if (data.started_at) {
          setCardStartedAt(data.started_at);
        }
        if (data.activity_counts) {
          setCounts(data.activity_counts);
        }
      } catch (loadError) {
        if (!isMounted) return;
        setFinishError(
          loadError.message || "Unable to load the finished card."
        );
      }
    };

    loadFinishedCard();

    return () => {
      isMounted = false;
    };
  }, [route?.params?.cardId]);

  useEffect(() => {
    if (!supabase) return;
    const cardId = route?.params?.cardId || loadedCardId;
    if (!cardId) return;

    let isMounted = true;
    const loadPhotos = async () => {
      try {
        const { data, error } = await supabase
          .from("jeroen_paws_card_photos")
          .select("id, photo_url, storage_path")
          .eq("card_id", cardId)
          .order("created_at", { ascending: true });
        if (error) throw error;
        if (!isMounted) return;
        const mapped = (data || []).map((photo) => ({
          id: photo.id,
          url: photo.photo_url,
          path: photo.storage_path,
        }));
        setCardPhotos(mapped);
      } catch (photoError) {
        if (!isMounted) return;
        console.error("Failed to load card photos", photoError);
      }
    };

    loadPhotos();
    return () => {
      isMounted = false;
    };
  }, [loadedCardId, route?.params?.cardId]);

  useEffect(() => {
    setPhotoCount(cardPhotos.length);
  }, [cardPhotos]);

  const handleAddPhoto = async () => {
    if (!supabase || isReadOnly || !isOwner) {
      return;
    }

    setPhotoUploadError("");
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPhotoUploadError("Photo access is required to upload images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      setPhotoUploadStatus("uploading");
      const fileExtension = asset.uri.split(".").pop() || "jpg";
      const bookingId = route?.params?.bookingId || "manual";
      const storagePath = `cards/${bookingId}/${Date.now()}.${fileExtension}`;

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from("jeroen-paws-card-photos")
        .upload(storagePath, blob, {
          contentType: asset.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("jeroen-paws-card-photos")
        .getPublicUrl(storagePath);
      const photoUrl = publicUrlData?.publicUrl;

      if (!photoUrl) {
        throw new Error("Failed to get photo URL.");
      }

      const insertPayload = {
        card_id: loadedCardId || route?.params?.cardId || null,
        booking_id: route?.params?.bookingId || null,
        owner_email: session?.email || OWNER_EMAIL,
        photo_url: photoUrl,
        storage_path: storagePath,
      };

      const { data: inserted, error: insertError } = await supabase
        .from("jeroen_paws_card_photos")
        .insert(insertPayload)
        .select("id, photo_url, storage_path")
        .maybeSingle();

      if (insertError) {
        throw insertError;
      }

      if (inserted) {
        setCardPhotos((prev) => [
          ...prev,
          {
            id: inserted.id,
            url: inserted.photo_url,
            path: inserted.storage_path,
          },
        ]);
      }

      setPhotoUploadStatus("idle");
    } catch (error) {
      console.error("Failed to upload photo", error);
      setPhotoUploadStatus("idle");
      setPhotoUploadError(
        error.message || "Unable to upload photo right now."
      );
    }
  };

  useEffect(() => {
    if (finishedAt) {
      const endTime = new Date(finishedAt).getTime();
      setElapsedMs(
        Math.max(endTime - new Date(cardStartedAt).getTime(), 0)
      );
      return undefined;
    }

    if (isReadOnly) {
      return undefined;
    }

    const interval = setInterval(() => {
      setElapsedMs(Date.now() - new Date(cardStartedAt).getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [isReadOnly, finishedAt, cardStartedAt]);

  const handleFinishVisit = async () => {
    if (isReadOnly) {
      return;
    }

    const totalWalks = Object.values(counts).reduce(
      (sum, petCounts) => sum + (petCounts?.walk || 0),
      0
    );
    if (totalWalks > 0) {
      setWalkCompleted(true);
    }
    setFinishStatus("saving");
    setFinishError("");

    if (!supabase) {
      setFinishStatus("idle");
      return;
    }

    try {
      const finishTimestamp = new Date().toISOString();
      const cardPayload = {
        booking_id: route?.params?.bookingId || null,
        client_id: route?.params?.clientId || null,
        owner_email: session?.email || OWNER_EMAIL,
        service_title: cardServiceTitle,
        pets: cardPets,
        pets_label: cardPetsLabel,
        activity_counts: counts,
        note,
        photo_count: photoCount,
        walk_completed: totalWalks > 0,
        started_at: new Date(cardStartedAt).toISOString(),
        finished_at: finishTimestamp,
        elapsed_seconds: Math.floor(elapsedMs / 1000),
      };

      const { data, error } = await supabase
        .from("jeroen_paws_cards")
        .insert(cardPayload)
        .select("*")
        .maybeSingle();

      if (error) {
        throw error;
      }

      setLoadedCardId(data?.id || null);
      setFinishedAt(finishTimestamp);

      if (isOwner && route?.params?.bookingId) {
        await clearActiveCard(session?.email || OWNER_EMAIL, route.params.bookingId);
      }

      if (route?.params?.bookingId) {
        const { error: bookingError } = await supabase
          .from("bookings")
          .update({ status: "finished" })
          .eq("id", route.params.bookingId);
        if (bookingError) {
          throw bookingError;
        }
      }

      if (route?.params?.bookingId) {
        const { error: photoUpdateError } = await supabase
          .from("jeroen_paws_card_photos")
          .update({ card_id: data?.id || null })
          .eq("booking_id", route.params.bookingId)
          .is("card_id", null);
        if (photoUpdateError) {
          throw photoUpdateError;
        }
      }

      if (route?.params?.clientId) {
        const messageBody = JSON.stringify({
          type: "jeroen_paws_card",
          card_id: data?.id || null,
          title: `${cardServiceTitle} complete`,
          pets_label: cardPetsLabel,
          summary: note ? `Note: ${note}` : "Tap to view the finished card.",
        });
        const { error: messageError } = await supabase
          .from("messages")
          .insert({
            client_id: route.params.clientId,
            sender: "owner",
            body: messageBody,
          });

        if (messageError) {
          throw messageError;
        }
      }

      setFinishStatus("saved");
    } catch (saveError) {
      setFinishError(
        saveError.message || "Unable to save the finished card."
      );
      setFinishStatus("error");
    }
  };

  const handleResetWalk = () => {
    if (!isOwner || isReadOnly) return;
    Alert.alert(
      "Reset walk?",
      "This will stop the current walk and reset the card to not started.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            if (route?.params?.bookingId) {
              await clearActiveCard(
                session?.email || OWNER_EMAIL,
                route.params.bookingId
              );
            }
            setFinishedAt(null);
            setWalkCompleted(false);
            setElapsedMs(0);
            setPhotoCount(0);
            setCardPhotos([]);
            setCounts(buildActivityCounts(cardPets));
            setCardStartedAt(Date.now());
            navigation.goBack();
          },
        },
      ]
    );
  };

  const mapUrl = buildStaticMapUrl(location);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{cardServiceTitle}</Text>
            <Text style={styles.headerSubtitle}>{cardPetsLabel}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.mapCard}>
          {mapUrl ? (
            <Image
              source={{ uri: mapUrl }}
              style={styles.mapImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>
                {locationError || "Fetching live map..."}
              </Text>
              {walkCompleted ? (
                <View style={styles.routeBadge}>
                  <Text style={styles.routeBadgeText}>
                    Walking route tracked
                  </Text>
                </View>
              ) : null}
            </View>
          )}
          {isOwner && !isReadOnly ? (
            <Pressable
              style={styles.addPhotoButton}
              onPress={handleAddPhoto}
              disabled={photoUploadStatus === "uploading"}
            >
              <Text style={styles.addPhotoText}>
                {photoUploadStatus === "uploading"
                  ? "Uploading..."
                  : "📷 Add Photo"}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Active time</Text>
          <Text style={styles.timerValue}>{formatElapsedTime(elapsedMs)}</Text>
          {finishedAt ? (
            <Text style={styles.timerMeta}>Finished</Text>
          ) : null}
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Note</Text>
          <TextInput
            style={styles.noteInput}
            multiline
            placeholder={`Add a note for ${cardPetsLabel}`}
            value={note}
            onChangeText={setNote}
            editable={!isReadOnly}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activities</Text>
          {cardPets.map((pet, index) => {
            const petName = pet?.name || cardPetsLabel;
            const avatarText = petName.slice(0, 1).toUpperCase();
            const meta = buildPetMeta(pet);
            const petKey = getPetKey(pet, index);
            return (
              <View key={petKey} style={styles.petSection}>
                <View style={styles.petRow}>
                  <View style={styles.petAvatar}>
                    <Text style={styles.petAvatarText}>{avatarText}</Text>
                  </View>
                  <View>
                    <Text style={styles.petName}>{petName}</Text>
                    <Text style={styles.petBreed}>{meta}</Text>
                  </View>
                </View>
                {defaultActivities.map((activity) => {
                  const activityCount = counts[petKey]?.[activity.key] ?? 0;
                  return (
                    <View key={activity.key} style={styles.activityRow}>
                    <View style={styles.activityLabel}>
                      <Text style={styles.activityIcon}>{activity.icon}</Text>
                      <Text style={styles.activityText}>
                        {activity.label}
                      </Text>
                    </View>
                    {isReadOnly ? (
                      <View style={styles.readOnlyCount}>
                        <Text style={styles.readOnlyCountText}>
                          {activityCount}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.counter}>
                        <Pressable
                          style={[
                            styles.counterButton,
                            activityCount > 0 && styles.counterButtonPrimary,
                          ]}
                          onPress={() => updateCount(petKey, activity.key, -1)}
                          disabled={isReadOnly}
                        >
                          <Text style={styles.counterButtonText}>−</Text>
                        </Pressable>
                        <Text style={styles.counterValue}>
                          {activityCount}
                        </Text>
                        <Pressable
                          style={[
                            styles.counterButton,
                            styles.counterButtonPrimary,
                          ]}
                          onPress={() => updateCount(petKey, activity.key, 1)}
                          disabled={isReadOnly}
                        >
                          <Text style={styles.counterButtonText}>+</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                  );
                })}
              </View>
              );
          })}
        </View>

        {cardPhotos.length ? (
          <View style={styles.photoGallery}>
            <Text style={styles.sectionTitle}>Photo Gallery</Text>
            <View style={styles.photoGrid}>
              {cardPhotos.map((photo) => (
                <Image
                  key={photo.id || photo.url}
                  source={{ uri: photo.url }}
                  style={styles.photoThumb}
                />
              ))}
            </View>
          </View>
        ) : null}

        {finishError ? (
          <Text style={styles.errorText}>{finishError}</Text>
        ) : null}
        {!isReadOnly && canFinishVisit ? (
          <Pressable
            style={styles.finishButton}
            onPress={
              finishedAt
                ? () => navigation.goBack()
                : handleFinishVisit
            }
            disabled={finishStatus === "saving"}
          >
            <Text style={styles.finishButtonText}>
              {finishStatus === "saving"
                ? "Saving..."
                : finishedAt
                ? "Close card"
                : "Finish Visit"}
            </Text>
          </Pressable>
        ) : !isReadOnly && !canFinishVisit ? (
          <View style={styles.finishBadge}>
            <Text style={styles.finishBadgeText}>
              Remaining time {formatElapsedTime(remainingMs)}
            </Text>
          </View>
        ) : (
          <View style={styles.finishBadge}>
            <Text style={styles.finishBadgeText}>
              {loadedCardId ? "Finished card" : "Read-only view"}
            </Text>
          </View>
        )}
        <Text style={styles.photoCountText}>
          Photos: {photoCount} uploaded
        </Text>
        {photoUploadError ? (
          <Text style={styles.errorText}>{photoUploadError}</Text>
        ) : null}
      {isOwner && !isReadOnly ? (
          <Pressable style={styles.resetButton} onPress={handleResetWalk}>
            <Text style={styles.resetButtonText}>Reset walk</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#efe7dd",
  },
  backIcon: {
    fontSize: 20,
    color: "#2b1a4b",
  },
  headerText: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6c5a92",
  },
  headerSpacer: {
    width: 42,
  },
  mapCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    padding: 16,
    marginBottom: 16,
  },
  mapImage: {
    height: 160,
    borderRadius: 16,
    marginBottom: 16,
  },
  mapPlaceholder: {
    height: 160,
    borderRadius: 16,
    backgroundColor: "#f0ecf6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  mapPlaceholderText: {
    color: "#8c7bb0",
    fontSize: 13,
    marginBottom: 8,
  },
  routeBadge: {
    backgroundColor: "#2f63d6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  routeBadgeText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 12,
  },
  addPhotoButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cfd6e0",
    paddingVertical: 12,
    alignItems: "center",
  },
  addPhotoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3a2b55",
  },
  timerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  timerLabel: {
    fontSize: 13,
    color: "#6c5a92",
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2f63d6",
  },
  timerMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#7b6a9f",
  },
  noteCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    padding: 16,
    marginBottom: 16,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 8,
  },
  noteInput: {
    minHeight: 72,
    fontSize: 14,
    color: "#4a3b63",
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2b1a4b",
    marginBottom: 16,
  },
  petSection: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#efe4f7",
    paddingBottom: 12,
  },
  petRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  petAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#efe9fb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  petAvatarText: {
    fontWeight: "700",
    color: "#5d2fc5",
  },
  petName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  petBreed: {
    fontSize: 13,
    color: "#7b6a9f",
    marginTop: 4,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  activityLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  activityIcon: {
    fontSize: 18,
  },
  activityText: {
    fontSize: 15,
    color: "#2b1a4b",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  readOnlyCount: {
    minWidth: 38,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#f2eff8",
    alignItems: "center",
    justifyContent: "center",
  },
  readOnlyCountText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2b1a4b",
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#d9d9de",
    alignItems: "center",
    justifyContent: "center",
  },
  counterButtonPrimary: {
    backgroundColor: "#2b1a4b",
  },
  counterButtonText: {
    fontSize: 18,
    color: "#ffffff",
  },
  counterValue: {
    fontSize: 15,
    color: "#2b1a4b",
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
  },
  finishButton: {
    borderRadius: 999,
    backgroundColor: "#2f63d6",
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#2b1a4b",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  finishButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  finishBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cfd6e0",
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  finishBadgeText: {
    color: "#2b1a4b",
    fontWeight: "600",
  },
  photoCountText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 12,
    color: "#7b6a9f",
  },
  resetButton: {
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#f0c2c2",
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff5f5",
    marginBottom: 12,
  },
  resetButtonText: {
    color: "#a01212",
    fontWeight: "700",
  },
  photoGallery: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ebe4f7",
    padding: 16,
    marginBottom: 16,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  photoThumb: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: "#f0ecf6",
  },
  errorText: {
    textAlign: "center",
    color: "#b42318",
    marginBottom: 10,
    fontSize: 13,
  },
});

export default JeroenPawsCardScreen;