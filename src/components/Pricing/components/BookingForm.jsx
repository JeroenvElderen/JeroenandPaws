import React from "react";
import SearchableSelect from "../SearchableSelect";
import { DOG_BREEDS } from "../constants";
import { createEmptyDogProfile } from "../utils";

const BookingForm = ({
  error,
  success,
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  clientEmail,
  setClientEmail,
  clientAddress,
  setClientAddress,
  canLoadPets,
  fetchExistingPets,
  isLoadingPets,
  existingPets,
  hasAttemptedPetLoad,
  selectedPetIds,
  setSelectedPetIds,
  showDogDetails,
  setShowDogDetails,
  dogCount,
  addAnotherDog,
  removeDog,
  dogs,
  updateDogField,
  handleDogPhotoChange,
  MAX_DOGS,
  breedSearch,
  setBreedSearch,
  notes,
  setNotes,
  additionals,
  additionalsOpen,
  setAdditionalsOpen,
  toggleAdditional,
  addons,
  selectedAdditionalLabels,
  formatCurrency,
  parsePriceValue,
  pricing,
  hasAtLeastOneDog,
  handleBookAndPay,
  isBooking,
  loading,
  isPopup,
  setShowFormPopup,
  addOnDropdownRef,
  filteredBreeds,
  visibleStage = "summary",
  onContinue,
}) => {
  const showCustomerDetails = ["customer", "pet", "summary"].includes(
    visibleStage
  );
  const showPetDetails = ["pet", "summary"].includes(visibleStage);
  const showPricingSummary = ["summary"].includes(visibleStage);
  const canAdvanceToPets = Boolean(
    clientName.trim() && clientEmail.trim() && clientPhone.trim()
  );

  const handleAdvance = (nextStage) => {
    if (onContinue) {
      onContinue(nextStage);
    }
  };

  return (
    <>
      {error && <p className="error-banner">{error}</p>}
      {success && <p className="success-banner">{success}</p>}
      <div className="form-grid">
        {showCustomerDetails && (
          <>
            <label className="input-group">
              <span>Your name</span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client name"
              />
            </label>
            <label className="input-group">
              <span>Your phone</span>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Best number to reach you"
              />
            </label>
            <label className="input-group email-group">
              <span>Your email</span>
              <div className="email-row">
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="name@email.com"
                />
                {canLoadPets && (
                  <button
                    type="button"
                    className="ghost-button load-pets-button"
                    onClick={fetchExistingPets}
                    disabled={isLoadingPets}
                  >
                    {isLoadingPets ? "Loading…" : "Load pets"}
                  </button>
                )}
              </div>
            </label>
            <label className="input-group full-width">
              <span>Service address</span>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Street, city, and any entry details"
              />
            </label>
          </>
        )}

        {showPetDetails && (
          <>
            {(existingPets.length > 0 || hasAttemptedPetLoad) && (
              <div className="input-group full-width pet-list-group">
                {existingPets.length === 0 ? (
                  <p className="muted subtle">
                    No pets found for this email. Start a new pet profile below.
                  </p>
                ) : (
                  <>
                  <div className="pet-chip-row">
                    {existingPets.map((pet) => {
                      const isSelected = selectedPetIds.includes(pet.id);
                      return (
                        <button
                          type="button"
                          key={`chip-${pet.id}`}
                          className={`pet-chip ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedPetIds((prev) =>
                              isSelected ? prev.filter((id) => id !== pet.id) : [...prev, pet.id]
                            );
                          }}
                        >
                          {pet.name || pet.breed || "Saved pet"}
                        </button>
                      );
                    })}
                  </div>
                  <div className="pet-list">
                    {existingPets.map((pet) => {
                      const isSelected = selectedPetIds.includes(pet.id);
                      const petInitial = (pet.name || pet.breed || "🐾")
                        .charAt(0)
                        .toUpperCase();
                      const noteText = pet.notes || pet.bio || "";

                      return (
                        <label
                          key={pet.id}
                          className={`pet-option ${
                            isSelected ? "selected" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              setSelectedPetIds((prev) => {
                                if (checked) {
                                  return [...prev, pet.id];
                                }
                                return prev.filter((id) => id !== pet.id);
                              });
                            }}
                          />
                          <div className="pet-option__details">
                            <div className="pet-option__identity">
                              <div
                                className="pet-option__thumb"
                                aria-hidden="true"
                              >
                                {pet.photo_data_url || pet.photoDataUrl ? (
                                  <img
                                    src={pet.photo_data_url || pet.photoDataUrl}
                                    alt={`${pet.name} avatar`}
                                    className="pet-option__avatar"
                                  />
                                ) : (
                                  <div className="pet-option__avatar placeholder">
                                    <span className="pet-option__initial">
                                      {petInitial}
                                    </span>
                                  </div>
                                )}
                                <div className="pet-option__glow" />
                              </div>
                            <div className="pet-option__text">
                                <span className="pet-option__name">
                                  {pet.name || "Your pup"}
                                </span>
                              <div className="pet-option__meta-row">
                                  {pet.breed && (
                                    <span className="pet-option__breed">
                                      {pet.breed}
                                    </span>
                                  )}
                                  <span className="pet-option__pill">
                                    Saved profile
                                  </span>
                                </div>
                                {noteText && (
                                  <p className="pet-option__notes" title={noteText}>
                                    {noteText}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  </>
                )}
                </div>
            )}
          {existingPets.length > 0 && !showDogDetails && (
              <div className="input-group full-width">
                <div className="label-row">
                  <span className="muted subtle">
                    Need to share details for another dog?
                  </span>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => setShowDogDetails(true)}
                    disabled={dogCount >= MAX_DOGS}
                  >
                    {dogCount >= MAX_DOGS
                      ? "Dog limit reached"
                      : "Add another dog"}
                  </button>
                </div>
              </div>
            )}
            {showDogDetails && (
              <>
                <div className="input-group full-width">
                  <div className="label-row">
                    <span>Dog details</span>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={addAnotherDog}
                      disabled={dogCount >= MAX_DOGS}
                    >
                      Add another dog
                    </button>
                  </div>
                </div>
                {Array.from({ length: dogCount }).map((_, index) => {
                  const dogProfile = dogs[index] || createEmptyDogProfile();
                  return (
                    <div className="dog-row" key={index}>
                      <label className="input-group">
                        <span>Dog {index + 1} Name</span>
                        <input
                          type="text"
                          value={dogProfile.name}
                          onChange={(e) =>
                            updateDogField(index, "name", e.target.value)
                          }
                          placeholder="e.g. Bella"
                        />
                      </label>

                  <SearchableSelect
                        label={`Dog ${index + 1} Breed`}
                        options={DOG_BREEDS}
                        value={dogProfile.breed}
                        onChange={(value) =>
                          updateDogField(index, "breed", value)
                        }
                        onSearch={(query) =>
                          setBreedSearch((prev) => ({ ...prev, [index]: query }))
                        }
                        filteredOptions={filteredBreeds(index)}
                        placeholder="Start typing a breed"
                      />

                        <label className="input-group">
                        <span>Notes</span>
                        <textarea
                          value={dogProfile.notes}
                          onChange={(e) =>
                            updateDogField(index, "notes", e.target.value)
                          }
                          placeholder="Anything I should know?"
                        />
                      </label>

                  <label className="input-group">
                        <span>Photo (optional)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleDogPhotoChange(index, e.target.files?.[0])
                          }
                        />
                        {dogProfile.photoDataUrl && (
                          <div className="photo-preview">
                            <img
                              src={dogProfile.photoDataUrl}
                              alt={`Dog ${index + 1} preview`}
                            />
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() =>
                                updateDogField(index, "photoDataUrl", "")
                              }
                            >
                              Remove photo
                            </button>
                          </div>
                        )}
                      </label>

                      {dogCount > 1 && (
                        <button
                          type="button"
                          className="ghost-button remove-button"
                          onClick={() => removeDog(index)}
                        >
                          Remove dog {index + 1}
                        </button>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
      <label className="input-group full-width">
        <span>Anything we should know?</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Share special instructions or preferences"
        />
      </label>

      {(visibleStage === "pet" || visibleStage === "summary") && (
        <>
          <div className="pricing-row" ref={addOnDropdownRef}>
            <div className="input-group full-width add-on-group">
              <div className="label-row">
                <span>Additional care (optional)</span>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setAdditionalsOpen((open) => !open)}
                  aria-expanded={additionalsOpen}
                >
                  {additionalsOpen ? "Hide" : "Browse"} add-ons
                </button>
              </div>
              {additionalsOpen && (
                <div className="add-on-carousel" role="listbox">
                  {addons.map((option) => {
                    const isSelected = additionals.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`add-on-card ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleAdditional(option.value)}
                        aria-pressed={isSelected}
                      >
                        <div className="add-on-card__header">
                          <span className="add-on-title">{option.label}</span>
                          <span className="add-on-price">
                            {formatCurrency(parsePriceValue(option.price))}
                          </span>
                        <p className="add-on-description">{option.description}</p>
                        <span className="add-on-chip">{option.benefit || "Popular"}</span>
                        </div>
                        <span className="add-on-check" aria-hidden="true">
                          ✓
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            <div className="add-on-running-total">
                <span>Running add-on total</span>
                <strong>{formatCurrency(pricing.addonTotal || 0)}</strong>
              </div>
            </div>
          </div>

          {showPricingSummary && (
            <div className="price-summary-card">
              <div className="price-summary__header">
                <div>
                  <p className="muted small">Current price</p>
                  <h4>{formatCurrency(pricing.totalPrice)}</h4>
                </div>
                <p className="muted subtle price-summary__meta">
                  {pricing.dogCount && pricing.visitCount
                    ? `${pricing.dogCount} dog${
                        pricing.dogCount > 1 ? "s" : ""
                      } × ${pricing.visitCount} visit${
                        pricing.visitCount > 1 ? "s" : ""
                      }`
                    : "Add dogs and pick dates to calculate"}
                </p>
              </div>
              <ul className="price-summary__list">
                <li>
                  Service: {formatCurrency(pricing.servicePrice)} per dog / visit
                </li>
                {pricing.selectedAddons.map((addon) => (
                  <li key={addon.id || addon.value}>
                    + {addon.label}: {formatCurrency(parsePriceValue(addon.price))} one-time
                  </li>
                ))}
                <li>
                  Total per dog / visit: {formatCurrency(pricing.servicePrice)}
                </li>
              </ul>
              {pricing.selectedAddons.length > 0 && (
                <p className="muted subtle">
                  Add-on pricing applied once per booking in addition to the base service price.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {visibleStage === "customer" && (
        <div className="actions-row">
          <div className="actions-stack">
            <button
              type="button"
              className="button w-button"
              onClick={() => handleAdvance("pet")}
              disabled={!canAdvanceToPets}
            >
              Continue to pet details
            </button>
          </div>
        </div>
      )}

      {visibleStage === "pet" && (
        <div className="actions-row">
          <div className="actions-stack">
            {hasAtLeastOneDog ? (
              <button
                type="button"
                className="button w-button"
                onClick={() => handleAdvance("summary")}
              >
                Continue to summary
              </button>
            ) : (
              <p className="muted subtle">Add at least one dog to continue.</p>
            )}
          </div>
        </div>
      )}

      {visibleStage === "summary" && (
        <>
          <div className="actions-row">
            <div className="actions-stack">
              {hasAtLeastOneDog ? (
                <button
                  type="button"
                  className="button w-button"
                  onClick={handleBookAndPay}
                  disabled={isBooking || loading}
                >
                  {isBooking ? "Booking…" : "Confirm / Book"}
                </button>
              ) : (
                <p className="muted subtle">Add at least one dog to continue.</p>
              )}
              {isPopup && (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setShowFormPopup(false)}
                >
                  Close form
                </button>
              )}
            </div>
          </div>
          <p className="muted subtle">Times shown in your timezone</p>
        </>
      )}
    </>
  );
};

export default BookingForm;