import React from "react";
import SearchableSelect from "../SearchableSelect";
import { DOG_BREEDS, meetAndGreetPolicy } from "../constants";

const formatEntryDate = (value) => {
  if (!value) {
    return "Date not selected";
  }

  return new Date(value).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

const BookingForm = (props) => {
  const {
    visibleStage = "summary",
    service,
    scheduleEntries = [],
    formatTime,
    allowRecurring,
    recurrence,
    onRecurrenceChange,
    isMultiDay,
    error,
    success,
    clientName,
    setClientName,
    clientPhone,
    setClientPhone,
    clientEmail,
    setClientEmail,
    canLoadPets,
    fetchExistingPets,
    isLoadingPets,
    clientAddress,
    setClientAddress,
    clientAddressLocked,
    notes,
    setNotes,
    customerDetailsRef,
    onContinue,
    existingPets = [],
    selectedPetIds = [],
    setSelectedPetIds,
    showDogDetails,
    setShowDogDetails,
    dogCount,
    MAX_DOGS,
    addAnotherDog,
    removeDog,
    dogs = [],
    updateDogField,
    handleDogPhotoChange,
    breedSearch,
    setBreedSearch,
    filteredBreeds,
    hasAttemptedPetLoad,
    additionals = [],
    addons = [],
    toggleAdditional,
    additionalsOpen,
    setAdditionalsOpen,
    formatCurrency,
    parsePriceValue,
    pricing,
    travelNote,
    selectedAdditionalLabels,
    handleBookAndPay,
    isBooking,
    loading,
    hasAtLeastOneDog,
    isPopup,
    setShowFormPopup,
  } = props;

  const recurrenceOptions = isMultiDay
    ? [{ value: "weekly", label: "Weekly (multi-day schedule)" }]
    : [
        { value: "none", label: "One-time booking" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "six-months", label: "Every 6 months" },
        { value: "yearly", label: "Yearly" },
      ];

  const showContinue = visibleStage !== "summary";
  const savedPets = existingPets.filter((pet) => selectedPetIds.includes(pet.id));
  const activeDogs = dogs.slice(0, dogCount);
  const additionalLabels = (selectedAdditionalLabels || []).filter(Boolean);

  const continueLabelByStage = {
    customer: "Continue to pets",
    pet: "Continue to extras",
    addons: "Review booking",
  };

  return (
    <>
      {error ? <p className="error-banner">{error}</p> : null}
      {success ? <p className="success-banner">{success}</p> : null}

      {visibleStage === "summary" ? (
        <div className="outlook-summary-grid">
          <section className="outlook-section-card">
            <h4>Agenda</h4>
            <p className="summary-value">{service?.title || "Selected service"}</p>
            <p className="muted subtle">{service?.duration || "Custom duration"}</p>
          </section>

          <section className="outlook-section-card">
            <h4>When</h4>
            {scheduleEntries.length ? (
              <ul className="summary-list">
                {scheduleEntries.map((entry, index) => (
                  <li key={`${entry.date}-${index}`} className="summary-item stacked">
                    <span className="summary-value">{formatEntryDate(entry.date)}</span>
                    <span className="muted subtle">{formatTime(entry.time)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted subtle">No time selected yet.</p>
            )}
            {allowRecurring ? (
              <p className="muted subtle">Repeats: {recurrence || "none"}</p>
            ) : null}
          </section>

          <section className="outlook-section-card">
            <h4>Attendees</h4>
            <p className="summary-value">{clientName || "No name"}</p>
            <p className="muted subtle">{clientEmail || "No email"}</p>
            <p className="muted subtle">{clientPhone || "No phone"}</p>
            <p className="muted subtle">{clientAddress || "No location"}</p>
          </section>

          <section className="outlook-section-card">
            <h4>Pets</h4>
            {savedPets.length === 0 && activeDogs.length === 0 ? (
              <p className="muted subtle">Add at least one dog.</p>
            ) : (
              <ul className="summary-list">
                {savedPets.map((pet) => (
                  <li key={pet.id} className="summary-item">
                    <span className="summary-value">{pet.name || "Your pup"}</span>
                    {pet.breed ? <span className="muted subtle">{pet.breed}</span> : null}
                  </li>
                ))}
                {activeDogs
                  .filter((dog) => Boolean((dog?.name || "").trim() || (dog?.breed || "").trim()))
                  .map((dog, index) => (
                    <li key={`new-${index}`} className="summary-item">
                      <span className="summary-value">{dog.name || "Your pup"}</span>
                      {dog.breed ? <span className="muted subtle">{dog.breed}</span> : null}
                    </li>
                  ))}
              </ul>
            )}
          </section>

          <section className="outlook-section-card full-width">
            <h4>Body</h4>
            <p className="summary-value">{notes || "No extra notes."}</p>
            {additionalLabels.length ? (
              <p className="muted subtle">Extras: {additionalLabels.join(", ")}</p>
            ) : null}
            {travelNote ? <p className="muted subtle">{travelNote}</p> : null}
            <p className="muted subtle">{meetAndGreetPolicy}</p>
          </section>

          <section className="outlook-section-card full-width">
            <h4>Total</h4>
            <p className="summary-value">{formatCurrency(pricing.totalPrice)}</p>
            <p className="muted subtle">
              Service {formatCurrency(pricing.servicePrice)} / dog / visit
            </p>
            {pricing.travelSurcharge > 0 ? (
              <p className="muted subtle">
                Travel surcharge: {formatCurrency(pricing.travelSurcharge)}
              </p>
            ) : null}
          </section>

          <div className="actions-row">
            {hasAtLeastOneDog ? (
              <button
                type="button"
                className="button w-button"
                onClick={handleBookAndPay}
                disabled={isBooking || loading}
              >
                {isBooking ? "Saving…" : "Save booking"}
              </button>
            ) : (
              <p className="muted subtle">Add a dog profile before saving.</p>
            )}
            {isPopup ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => setShowFormPopup(false)}
              >
                Close
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="outlook-form-layout" ref={customerDetailsRef}>
          {visibleStage === "customer" ? (
            <>
              <label className="input-group full-width">
                <span>Title</span>
                <input
                  type="text"
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  placeholder="Add a title / your name"
                />
              </label>

              <label className="input-group">
                <span>Email</span>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(event) => setClientEmail(event.target.value)}
                  placeholder="name@email.com"
                />
              </label>

              <label className="input-group">
                <span>Phone</span>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(event) => setClientPhone(event.target.value)}
                  placeholder="Best number to reach you"
                />
              </label>

              <label className="input-group full-width">
                <span>Location</span>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(event) => {
                    if (!clientAddressLocked) {
                      setClientAddress(event.target.value);
                    }
                  }}
                  readOnly={clientAddressLocked}
                  placeholder="Find or type location"
                />
              </label>

              <label className="input-group full-width">
                <span>Description</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add booking details for Jeroen"
                />
              </label>

              {canLoadPets ? (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={fetchExistingPets}
                  disabled={isLoadingPets}
                >
                  {isLoadingPets ? "Loading pets…" : "Load my saved pets"}
                </button>
              ) : null}
            </>
          ) : null}

          {visibleStage === "pet" ? (
            <>
              {(existingPets.length > 0 || hasAttemptedPetLoad) ? (
                <div className="input-group full-width">
                  <span>Saved pets</span>
                  <div className="pet-list">
                    {existingPets.length === 0 ? (
                      <p className="muted subtle">No saved pets for this email.</p>
                    ) : (
                      existingPets.map((pet) => {
                        const isSelected = selectedPetIds.includes(pet.id);
                        return (
                          <label
                            key={pet.id}
                            className={`pet-option ${isSelected ? "selected" : ""}`}
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
                              <span className="pet-option__name">{pet.name || "Your pup"}</span>
                              <span className="pet-option__breed">{pet.breed || "Breed unknown"}</span>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : null}

              <div className="label-row full-width">
                <span>Add new pet details</span>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setShowDogDetails((prev) => !prev)}
                >
                  {showDogDetails ? "Hide" : "Show"}
                </button>
              </div>

              {showDogDetails
                ? activeDogs.map((dog, index) => (
                    <div key={`dog-${index}`} className="outlook-section-card full-width">
                      <div className="label-row">
                        <span>Dog {index + 1}</span>
                        {dogCount > 1 ? (
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={() => removeDog(index)}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>

                      <div className="form-grid">
                        <label className="input-group">
                          <span>Name</span>
                          <input
                            type="text"
                            value={dog.name || ""}
                            onChange={(event) =>
                              updateDogField(index, "name", event.target.value)
                            }
                            placeholder="Dog name"
                          />
                        </label>

                        <SearchableSelect
                          label="Breed"
                          options={DOG_BREEDS}
                          value={dog.breed || ""}
                          onChange={(value) => updateDogField(index, "breed", value)}
                          onSearch={(value) =>
                            setBreedSearch((prev) => ({ ...prev, [index]: value }))
                          }
                          filteredOptions={
                            filteredBreeds?.[index] ||
                            DOG_BREEDS.filter((option) =>
                              option
                                .toLowerCase()
                                .includes((breedSearch?.[index] || "").toLowerCase())
                            )
                          }
                        />
                      </div>

                      <label className="input-group full-width">
                        <span>Notes</span>
                        <textarea
                          value={dog.notes || ""}
                          onChange={(event) =>
                            updateDogField(index, "notes", event.target.value)
                          }
                          placeholder="Temperament, routines, medication…"
                        />
                      </label>

                      <label className="input-group full-width">
                        <span>Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => handleDogPhotoChange(index, event)}
                        />
                      </label>
                    </div>
                  ))
                : null}

              {dogCount < MAX_DOGS ? (
                <button type="button" className="ghost-button" onClick={addAnotherDog}>
                  + Add another dog
                </button>
              ) : null}
            </>
          ) : null}

          {visibleStage === "addons" ? (
            <>
              <label className="input-group full-width recurrence-group">
                <span>Recurring visits</span>
                <select
                  className="input-like-select recurrence-select"
                  value={
                    recurrenceOptions.some((option) => option.value === recurrence)
                      ? recurrence
                      : recurrenceOptions[0]?.value
                  }
                  onChange={(event) => onRecurrenceChange?.(event.target.value)}
                  disabled={isMultiDay}
                >
                  {recurrenceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="input-group full-width add-on-group">
                <div className="label-row">
                  <span>Additional care</span>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => setAdditionalsOpen((open) => !open)}
                  >
                    {additionalsOpen ? "Hide" : "Browse"}
                  </button>
                </div>

                {additionalsOpen ? (
                  <div className="add-on-carousel">
                    {addons.map((option) => {
                      const isSelected = additionals.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`add-on-card ${isSelected ? "selected" : ""}`}
                          onClick={() => toggleAdditional(option.value)}
                        >
                          <div className="add-on-card__header">
                            <span className="add-on-title">{option.label}</span>
                            <span className="add-on-chip add-on-price-chip">
                              {formatCurrency(parsePriceValue(option.price))}
                            </span>
                          </div>
                          <p className="add-on-description">{option.description}</p>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          {showContinue ? (
            <div className="actions-row">
              <button
                type="button"
                className="button w-button"
                onClick={() => onContinue?.()}
              >
                {continueLabelByStage[visibleStage] || "Continue"}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
};

export default BookingForm;
