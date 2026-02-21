import React from "react";
import AddonsForm from "./AddonsForm";

const BookingForm = ({
  visibleStage,
  onContinue,
  scheduleEntries = [],
  formatTime,
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  clientEmail,
  setClientEmail,
  clientAddress,
  setClientAddress,
  clientAddressLocked,
  notes,
  setNotes,
  dogs = [],
  dogCount = 1,
  addAnotherDog,
  removeDog,
  updateDogField,
  handleDogPhotoChange,
  MAX_DOGS = 4,
  setBreedSearch,
  filteredBreeds,
  addons,
  additionals,
  toggleAdditional,
  formatCurrency,
  parsePriceValue,
  pricing,
  handleBookAndPay,
  isBooking,
  loading,
}) => {
  const summaryDate = scheduleEntries[0]?.date || "Not selected";
  const summaryTime = scheduleEntries[0]?.time
    ? formatTime(scheduleEntries[0].time)
    : "Not selected";

  if (visibleStage === "customer") {
    return (
      <div className="outlook-form-layout" role="group" aria-label="Customer details">
        <div className="booking-hero" style={{ marginBottom: 12 }}>
          <p className="eyebrow">Outlook booking</p>
          <h3>Customer details</h3>
          <p className="muted">Add your contact details for confirmations and reminders.</p>
        </div>
        <div className="form-grid">
          <label className="input-group">
            Full name
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          </label>
          <label className="input-group">
            Phone
            <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
          </label>
          <label className="input-group full-width">
            Email
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              required
            />
          </label>
          <label className="input-group full-width">
            Eircode
            <input
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              placeholder="A98H940"
              disabled={clientAddressLocked}
            />
          </label>
        </div>
        {onContinue && (
          <button type="button" className="button w-button" onClick={onContinue}>
            Continue to pets
          </button>
        )}
      </div>
    );
  }

  if (visibleStage === "pet") {
    return (
      <div role="group" aria-label="Pet details">
        <div className="booking-hero" style={{ marginBottom: 12 }}>
          <p className="eyebrow">Outlook booking</p>
          <h3>Pet profiles</h3>
          <p className="muted">Keep your dogs in one place with notes for every visit.</p>
        </div>
        <div className="actions-row" style={{ marginBottom: 12 }}>
          <button type="button" className="ghost-button" onClick={removeDog} disabled={dogCount <= 1}>
            − Remove dog
          </button>
          <button
            type="button"
            className="button w-button"
            onClick={addAnotherDog}
            disabled={dogCount >= MAX_DOGS}
          >
            + Add dog
          </button>
        </div>

        <div className="booking-stack">
          {dogs.slice(0, dogCount).map((dog, index) => (
            <div className="step-card" key={`dog-${index}`}>
              <h4>Dog {index + 1}</h4>
              <div className="form-grid">
                <label className="input-group">
                  Name
                  <input
                    value={dog.name || ""}
                    onChange={(e) => updateDogField(index, "name", e.target.value)}
                  />
                </label>
                <label className="input-group">
                  Breed
                  <input
                    value={dog.breed || ""}
                    onChange={(e) => {
                      setBreedSearch((prev) => ({ ...prev, [index]: e.target.value }));
                      updateDogField(index, "breed", e.target.value);
                    }}
                    list={`breed-options-${index}`}
                  />
                  <datalist id={`breed-options-${index}`}>
                    {(filteredBreeds ? filteredBreeds(index) : [])
                      .slice(0, 30)
                      .map((breed) => <option key={breed} value={breed} />)}
                  </datalist>
                </label>
                <label className="input-group full-width">
                  Notes
                  <textarea
                    rows={3}
                    value={dog.notes || ""}
                    onChange={(e) => updateDogField(index, "notes", e.target.value)}
                  />
                </label>
                <label className="input-group full-width">
                  Photo (optional)
                  <input type="file" accept="image/*" onChange={(e) => handleDogPhotoChange(index, e)} />
                </label>
              </div>
            </div>
          ))}
        </div>

        {onContinue && (
          <button type="button" className="button w-button" onClick={onContinue}>
            Continue to additional care
          </button>
        )}
      </div>
    );
  }

  if (visibleStage === "addons") {
    return (
      <div role="group" aria-label="Add-ons">
        <div className="booking-hero" style={{ marginBottom: 12 }}>
          <p className="eyebrow">Outlook booking</p>
          <h3>Additional care</h3>
          <p className="muted">Choose optional add-ons and leave any care instructions.</p>
        </div>

        <AddonsForm
          addons={addons}
          additionals={additionals}
          toggleAdditional={toggleAdditional}
          formatCurrency={formatCurrency}
          parsePriceValue={parsePriceValue}
          description="Purple-themed add-ons for your new booking experience."
        />

        <label className="input-group full-width" style={{ marginTop: 12 }}>
          Booking notes
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything we should know before the visit?"
          />
        </label>

        {onContinue && (
          <button type="button" className="button w-button" onClick={onContinue}>
            Continue to summary
          </button>
        )}
      </div>
    );
  }

  return (
    <div role="group" aria-label="Booking summary">
      <div className="booking-hero" style={{ marginBottom: 12 }}>
        <p className="eyebrow">Outlook booking</p>
        <h3>Summary & confirm</h3>
        <p className="muted">Review details below, then confirm your booking.</p>
      </div>

      <div className="step-card">
        <p><strong>Date:</strong> {summaryDate}</p>
        <p><strong>Time:</strong> {summaryTime}</p>
        <p><strong>Dogs:</strong> {pricing?.dogCount || 0}</p>
        <p><strong>Total:</strong> {formatCurrency ? formatCurrency(pricing?.totalPrice || 0) : "€0"}</p>
      </div>

      <button type="button" className="button w-button" onClick={handleBookAndPay} disabled={isBooking || loading}>
        {isBooking ? "Saving…" : "Confirm booking"}
      </button>
    </div>
  );
};

export default BookingForm;
