import { useState } from "react";
import { createEmptyDogProfile } from "../../utils";

export function useBookingPets(MAX_DOGS = 4, DOG_BREEDS) {
  const [dogCount, setDogCount] = useState(1);
  const [dogs, setDogs] = useState([createEmptyDogProfile()]);
  const [breedSearch, setBreedSearch] = useState({});

  const updateDogField = (index, field, value) => {
    setDogs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleDogPhotoChange = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateDogField(index, "photoDataUrl", reader.result);
      updateDogField(index, "photoName", file.name);
    };
    reader.readAsDataURL(file);
  };

  const addAnotherDog = () => {
    if (dogCount >= MAX_DOGS) return;
    setDogCount((n) => n + 1);
    setDogs((prev) => [...prev, createEmptyDogProfile()]);
  };

  const removeDog = (index) => {
    setDogs((prev) => prev.filter((_, i) => i !== index));
    setDogCount((n) => Math.max(1, n - 1));
  };

  const filteredBreeds = (dogIndex) => {
    const q = breedSearch[dogIndex]?.toLowerCase() || "";
    return DOG_BREEDS.filter((b) => b.toLowerCase().includes(q));
  };

  const hasAtLeastOneDog = dogs.some(
    (dog) => dog.name || dog.breed || dog.notes || dog.photoDataUrl
  );

  return {
    dogCount, dogs, breedSearch,
    setBreedSearch, updateDogField,
    handleDogPhotoChange, addAnotherDog,
    removeDog, filteredBreeds, hasAtLeastOneDog,
  };
}
