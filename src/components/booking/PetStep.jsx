import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Camera, Trash2, Plus } from "lucide-react"

export function PetStep({ state }) {
  const {
    dogs,
    dogCount,
    MAX_DOGS,
    updateDogField,
    handleDogPhotoChange,
    addAnotherDog,
    removeDog,
    breedSearch,
    setBreedSearch,
    filteredBreeds,
    setCurrentStep,
    hasAtLeastOneDog,
  } = state

  return (
    <div className="space-y-6 pb-6">
      <h2 className="text-xl font-semibold text-white">
        Your dog{dogCount > 1 ? "s" : ""}
      </h2>

      <p className="text-sm opacity-70">
        Add the details of each pet included in this booking.
      </p>

      <div className="space-y-6">
        {dogs.slice(0, dogCount).map((dog, index) => (
          <div
            key={index}
            className="bg-brand-purple/10 border border-brand-purple/30 rounded-xl p-4 space-y-4 shadow-sm relative"
          >
            {/* Remove button */}
            {dogCount > 1 && (
              <button
                className="absolute right-3 top-3 text-white/70 hover:text-red-400"
                onClick={() => removeDog(index)}
              >
                <Trash2 size={18} />
              </button>
            )}

            {/* Dog name */}
            <div className="space-y-2">
              <label className="text-sm text-white/70">Name</label>
              <Input
                className="bg-brand-dark border-brand-purple/30 text-white"
                placeholder="Buddy"
                value={dog.name}
                onChange={(e) => updateDogField(index, "name", e.target.value)}
              />
            </div>

            {/* Breed autocomplete */}
            <div className="space-y-2">
              <label className="text-sm text-white/70">Breed</label>
              <div className="relative">
                <Input
                  className="bg-brand-dark border-brand-purple/30 text-white"
                  placeholder="Labrador, Poodle..."
                  value={dog.breed || ""}
                  onChange={(e) => {
                    updateDogField(index, "breed", e.target.value)
                    setBreedSearch((prev) => ({
                      ...prev,
                      [index]: e.target.value,
                    }))
                  }}
                />

                {/* Autocomplete dropdown */}
                {breedSearch[index] && (
                  <ul className="absolute z-20 mt-1 w-full bg-brand-dark border border-brand-purple/30 rounded-lg shadow-md max-h-40 overflow-y-auto">
                    {filteredBreeds(index).map((breed) => (
                      <li
                        key={breed}
                        className="px-3 py-2 hover:bg-brand-purple/20 cursor-pointer text-white text-sm"
                        onClick={() => {
                          updateDogField(index, "breed", breed)
                          setBreedSearch((prev) => ({
                            ...prev,
                            [index]: "",
                          }))
                        }}
                      >
                        {breed}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm text-white/70">Notes</label>
              <Textarea
                className="bg-brand-dark border-brand-purple/30 text-white"
                placeholder="Anything we should know?"
                value={dog.notes}
                onChange={(e) => updateDogField(index, "notes", e.target.value)}
              />
            </div>

            {/* Photo upload */}
            <div className="space-y-2">
              <label className="text-sm text-white/70">Photo</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 bg-brand-purple text-white px-3 py-2 rounded-md hover:bg-brand-purpleDark transition">
                  <Camera size={18} />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleDogPhotoChange(index, e.target.files[0])
                    }
                  />
                </label>

                {dog.photoDataUrl && (
                  <img
                    src={dog.photoDataUrl}
                    alt="Dog preview"
                    className="h-12 w-12 rounded-lg object-cover border border-brand-purple/40"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add another dog */}
      {dogCount < MAX_DOGS && (
        <Button
          variant="outline"
          className="w-full border-brand-purple text-white hover:bg-brand-purple/20"
          onClick={addAnotherDog}
        >
          <Plus size={18} className="mr-2" /> Add another dog
        </Button>
      )}

      {/* Continue */}
      <Button
        className="w-full bg-brand-purple hover:bg-brand-purpleDark text-white"
        disabled={!hasAtLeastOneDog}
        onClick={() => setCurrentStep("summary")}
      >
        Continue
      </Button>
    </div>
  )
}
