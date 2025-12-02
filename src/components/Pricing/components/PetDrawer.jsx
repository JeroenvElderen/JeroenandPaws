import React, { useEffect, useState } from "react";
import { DOG_BREEDS } from "../constants";
import { createEmptyDogProfile } from "../utils";

const PetDrawer = ({
  isOpen,
  onClose,

  existingPets,
  selectedSavedPetIds,
  setSelectedSavedPetIds,

  onSave,
}) => {
  const [newPets, setNewPets] = useState([]);
  const [breedQuery, setBreedQuery] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setNewPets([]);
    }
  }, [isOpen]);

  // ─────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────
  const toggleSavedPet = (id) => {
    setSelectedSavedPetIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const addDog = () => {
    setNewPets((prev) => [...prev, createEmptyDogProfile()]);
  };

  const removeDog = (i) => {
    setNewPets((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateDogField = (i, field, value) => {
    setNewPets((prev) => {
      const clone = [...prev];
      clone[i][field] = value;
      return clone;
    });
  };

  const handlePhotoChange = (i, file) => {
    const reader = new FileReader();
    reader.onload = () => {
      updateDogField(i, "photoDataUrl", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const isValidNewPet = (p) => p.name?.trim() && p.breed?.trim();
  const validNewPets = newPets.filter(isValidNewPet);

  const canSave = selectedSavedPetIds.length > 0 || validNewPets.length > 0;

  const handleSave = () => {
    if (!canSave) return;

    // Pass validated new pets + selected saved IDs back to BookingModal
    onSave(validNewPets, selectedSavedPetIds);
  };

  // BREED FILTER
  const getFilteredBreeds = (index) => {
    const q = (breedQuery[index] || "").toLowerCase();
    return DOG_BREEDS.filter((b) => b.toLowerCase().includes(q));
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <>
      <div
        className={`drawer-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <div className={`drawer pet-drawer ${isOpen ? "open" : ""}`}>
        {/* HEADER */}
        <header className="drawer-header">
          <h4>Your Dogs</h4>

          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </header>

        {/* BODY */}
        <div className="drawer-body">

          {/* SAVED PETS */}
          {existingPets.length > 0 && (
            <div className="block-section">
              <div className="label-row">
                <span>Saved profiles</span>
              </div>

              <div className="pet-grid">
                {existingPets.map((pet) => {
                  const isSelected = selectedSavedPetIds.includes(pet.id);
                  const initial = pet.name?.charAt(0)?.toUpperCase() || "🐾";
                  const avatar = pet.photo_data_url || pet.photoDataUrl;

                  return (
                    <div
                      key={pet.id}
                      className={`pet-card ${isSelected ? "selected" : ""}`}
                      onClick={() => toggleSavedPet(pet.id)}
                    >
                      <div className="pet-card-avatar">
                        {avatar ? (
                          <img src={avatar} alt={pet.name} />
                        ) : (
                          <div className="pet-avatar-placeholder">{initial}</div>
                        )}
                        {isSelected && (
                          <div className="pet-card-check">✓</div>
                        )}
                      </div>

                      <div className="pet-card-info">
                        <strong>{pet.name}</strong>
                        {pet.breed && (
                          <p className="muted small">{pet.breed}</p>
                        )}
                        {pet.notes && (
                          <p className="muted tiny">{pet.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* NEW PETS FORM */}
          <div className="label-row">
            <span>Add a new dog</span>
            <button className="ghost-button" onClick={addDog}>
              + Add dog
            </button>
          </div>

          {newPets.map((dog, index) => (
            <div className="dog-edit-card" key={index}>
              <label className="input-group">
                <span>Name</span>
                <input
                  type="text"
                  value={dog.name}
                  onChange={(e) =>
                    updateDogField(index, "name", e.target.value)
                  }
                  placeholder="Bella"
                />
              </label>

              <label className="input-group">
                <span>Breed</span>
                <input
                  type="text"
                  value={dog.breed}
                  placeholder="Start typing breed..."
                  onChange={(e) => {
                    updateDogField(index, "breed", e.target.value);
                    setBreedQuery((prev) => ({
                      ...prev,
                      [index]: e.target.value,
                    }));
                  }}
                />

                {breedQuery[index] && (
                  <div className="breed-dropdown">
                    {getFilteredBreeds(index).length === 0 && (
                      <div className="no-results">No breeds found</div>
                    )}

                    {getFilteredBreeds(index).map((b) => (
                      <div
                        key={b}
                        className="breed-option"
                        onClick={() => {
                          updateDogField(index, "breed", b);
                          setBreedQuery((prev) => ({ ...prev, [index]: "" }));
                        }}
                      >
                        {b}
                      </div>
                    ))}
                  </div>
                )}
              </label>

              <label className="input-group">
                <span>Notes (optional)</span>
                <textarea
                  value={dog.notes || ""}
                  onChange={(e) =>
                    updateDogField(index, "notes", e.target.value)
                  }
                  placeholder="Anything we should know?"
                />
              </label>

              <label className="input-group">
                <span>Photo (optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handlePhotoChange(index, e.target.files?.[0])
                  }
                />

                {dog.photoDataUrl && (
                  <img
                    src={dog.photoDataUrl}
                    alt={dog.name}
                    className="dog-preview"
                  />
                )}
              </label>

              {newPets.length > 1 && (
                <button
                  className="ghost-button remove-button"
                  onClick={() => removeDog(index)}
                >
                  Remove dog
                </button>
              )}
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <footer className="drawer-footer">
          <button
            className="button w-button primary"
            onClick={handleSave}
            disabled={!canSave}
          >
            Save dogs →
          </button>
        </footer>
      </div>
    </>
  );
};

export default PetDrawer;
