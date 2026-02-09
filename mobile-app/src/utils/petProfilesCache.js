import AsyncStorage from "@react-native-async-storage/async-storage";

const getStorageKey = (email) =>
  `pets-cache:${(email || "").trim().toLowerCase()}`;

export const loadCachedPets = async (email) => {
  if (!email) return null;
  try {
    const raw = await AsyncStorage.getItem(getStorageKey(email));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.pets)) return null;
    return parsed;
  } catch (error) {
    console.warn("Unable to read cached pets", error);
    return null;
  }
};

export const saveCachedPets = async (email, pets) => {
  if (!email) return;
  const payload = {
    pets: Array.isArray(pets) ? pets : [],
    updatedAt: new Date().toISOString(),
  };
  try {
    await AsyncStorage.setItem(
      getStorageKey(email),
      JSON.stringify(payload)
    );
  } catch (error) {
    console.warn("Unable to save cached pets", error);
  }
};

export const upsertCachedPet = async (email, pet) => {
  if (!email || !pet) return;
  const cached = await loadCachedPets(email);
  const pets = Array.isArray(cached?.pets) ? cached.pets : [];
  const nextPets = pet?.id
    ? pets.map((entry) => (entry.id === pet.id ? pet : entry))
    : pets;
  const shouldAppend = !pet?.id || !pets.some((entry) => entry.id === pet.id);
  const merged = shouldAppend ? [...nextPets, pet] : nextPets;
  await saveCachedPets(email, merged);
  return merged;
};