import { useCallback, useEffect, useMemo, useState } from "react"
import { BookingDialog } from "./Modal"
import { DOG_BREEDS } from "../Pricing/constants"
import {
  createEmptyDogProfile,
  generateDemoAvailability,
} from "../Pricing/utils"
import {
  computeApiBaseUrl,
  getCachedAvailability,
  prefetchAvailability,
} from "../Pricing/availabilityCache"
import { useAuth } from "@/context/AuthContext"

const BUSINESS_TIME_ZONE = "Europe/Dublin"

const MAX_DOGS = 4

export function BookingModal({ service, onClose }) {
  const apiBaseUrl = computeApiBaseUrl()
  const { profile } = useAuth()

  const [currentStep, setCurrentStep] = useState("calendar")
  const [availability, setAvailability] = useState({
    dates: [],
    timeZone: BUSINESS_TIME_ZONE,
  })
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedSlots, setSelectedSlots] = useState({})
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [isBooking, setIsBooking] = useState(false)
  const [dogs, setDogs] = useState([createEmptyDogProfile()])
  const [dogCount, setDogCount] = useState(1)
  const [breedSearch, setBreedSearch] = useState({})

  const parsePriceValue = useCallback((value) => {
    if (value === null || value === undefined) return 0
    if (typeof value === "number") return value

    const normalized = String(value).replace(/,/g, ".")
    const numeric = Number(normalized.replace(/[^0-9.]/g, ""))
    return Number.isFinite(numeric) ? numeric : 0
  }, [])

  const formatCurrency = useCallback((value) => {
    const numeric = Number.isFinite(value) ? value : 0
    return `€${numeric.toFixed(2)}`
  }, [])

  const availabilityMap = useMemo(() => {
    return Object.fromEntries((availability?.dates || []).map((day) => [day.date, day]))
  }, [availability?.dates])

  const isDayAvailableForService = useCallback((day) => {
    if (!day) return false
    return Array.isArray(day.slots) && day.slots.some((slot) => slot.available)
  }, [])

  const getDefaultSlotForDate = useCallback(
    (isoDate) => {
      const day = availabilityMap[isoDate]
      if (!day) return ""

      const firstAvailable = day.slots.find((slot) => slot.available)
      return firstAvailable?.time || ""
    },
    [availabilityMap]
  )

  const formatTime = useCallback(
    (value) => {
      if (!value) return ""
      const [hours, minutes] = value.split(":")
      if (!hours || !minutes) return value

      const date = new Date()
      date.setHours(Number(hours), Number(minutes), 0, 0)

      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: BUSINESS_TIME_ZONE,
      })
    },
    []
  )

  const scheduleEntries = useMemo(() => {
    return Object.entries(selectedSlots)
      .map(([date, time]) => ({ date, time }))
      .filter((entry) => entry.date)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [selectedSlots])

  const filteredBreeds = useCallback(
    (dogIndex) => {
      const query = breedSearch[dogIndex]?.toLowerCase() || ""
      return DOG_BREEDS.filter((breed) => breed.toLowerCase().includes(query))
    },
    [breedSearch]
  )

  const hasAtLeastOneDog = useMemo(() => {
    const dogsToCheck = dogs.slice(0, dogCount)
    return dogsToCheck.some((dog) => {
      if (!dog) return false
      const name = (dog.name || "").trim()
      const breed = (dog.breed || "").trim()
      const notesText = (dog.notes || "").trim()
      return Boolean(name || breed || notesText || dog.profileId)
    })
  }, [dogCount, dogs])

  const pricing = useMemo(() => {
    const servicePrice = parsePriceValue(service?.price ?? service?.cost ?? "0")
    const activeDogsCount = dogs
      .slice(0, dogCount)
      .map((dog) => {
        const name = (dog?.name || "").trim()
        const breed = (dog?.breed || "").trim()
        const notesText = (dog?.notes || "").trim()
        const profileId = dog?.profileId
        return name || breed || notesText || profileId ? dog : null
      })
      .filter(Boolean).length

    const visitCount = scheduleEntries.filter((entry) => entry.date && entry.time).length
    const perDogPerVisit = servicePrice
    const totalPrice = activeDogsCount && visitCount ? perDogPerVisit * activeDogsCount * visitCount : 0

    const descriptionParts = [service?.title].filter(Boolean)

    if (activeDogsCount) {
      descriptionParts.push(`${activeDogsCount} dog${activeDogsCount > 1 ? "s" : ""}`)
    }

    if (visitCount) {
      descriptionParts.push(`${visitCount} visit${visitCount > 1 ? "s" : ""}`)
    }

    return {
      dogCount: activeDogsCount,
      visitCount,
      perDogPerVisit,
      totalPrice,
      selectedAddons: [],
      parsePriceValue,
      description: descriptionParts.join(" · "),
    }
  }, [dogCount, dogs, parsePriceValue, scheduleEntries, service?.cost, service?.price])

  const resetForm = useCallback(() => {
    setSelectedDate("")
    setSelectedTime("")
    setSelectedSlots({})
    setNotes("")
    setCurrentStep("calendar")
    setDogs([createEmptyDogProfile()])
    setDogCount(1)
  }, [])

  const normalizeAvailability = useCallback(
    (data = {}) => ({
      ...data,
      dates: data?.dates || [],
      timeZone: BUSINESS_TIME_ZONE,
    }),
    []
  )

  const loadAvailability = useCallback(async () => {
    try {
      const cached = getCachedAvailability(service?.id)
      if (cached) {
        setAvailability(normalizeAvailability(cached))
        return
      }

      const data = await prefetchAvailability(service, apiBaseUrl)
      setAvailability(normalizeAvailability(data))
    } catch (error) {
      console.error("Unable to load live availability", error)
      const fallback = generateDemoAvailability(service?.durationMinutes)
      setAvailability(normalizeAvailability(fallback))
    }
  }, [apiBaseUrl, normalizeAvailability, service])

  useEffect(() => {
    if (!service) return
    loadAvailability()
    resetForm()
  }, [loadAvailability, resetForm, service])

  useEffect(() => {
    const client = profile?.client
    if (!client) return

    const phoneNumber = client.phone_number || client.phone || ""
    setClientName(client.full_name || "")
    setClientPhone(phoneNumber || "")
    setClientEmail(client.email || "")
    setClientAddress(client.address || "")
  }, [profile])

  const updateDogField = (index, field, value) => {
    setDogs((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleDogPhotoChange = (index, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      updateDogField(index, "photoDataUrl", event.target.result)
      updateDogField(index, "photoName", file.name)
    }
    reader.readAsDataURL(file)
  }

  const addAnotherDog = () => {
    setDogCount((prev) => Math.min(prev + 1, MAX_DOGS))
    setDogs((prev) => {
      if (prev.length >= MAX_DOGS) return prev
      return [...prev, createEmptyDogProfile()]
    })
  }

  const removeDog = (index) => {
    setDogCount((prev) => Math.max(1, prev - 1))
    setDogs((prev) => prev.filter((_, i) => i !== index))
  }

  const handleBook = async (paymentOrderId) => {
    const validSchedule = scheduleEntries.filter((entry) => entry.date && entry.time)
    if (!validSchedule.length) {
      alert("Please pick at least one date and time.")
      return
    }

    if (!clientName.trim() || !clientPhone.trim() || !clientEmail.trim() || !clientAddress.trim()) {
      alert("Please add your name, phone number, email, and address so we can confirm your booking.")
      return
    }

    setIsBooking(true)
    try {
      const durationMinutes = Number.isFinite(service?.durationMinutes) ? service.durationMinutes : 60
      const payload = {
        date: validSchedule[0].date,
        time: validSchedule[0].time,
        durationMinutes,
        serviceId: service?.id,
        serviceTitle: service?.title,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientAddress: clientAddress.trim(),
        clientEmail: clientEmail.trim(),
        notes: notes.trim(),
        timeZone: availability.timeZone || BUSINESS_TIME_ZONE,
        pets: dogs.slice(0, dogCount),
        dogCount: dogs.slice(0, dogCount).length,
        schedule: validSchedule.map((entry) => ({ ...entry, durationMinutes })),
        bookingMode: "single",
        amount: pricing.totalPrice,
        payment_order_id: paymentOrderId,
      }

      const requestUrl = `${apiBaseUrl}/api/book`
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Booking could not be completed right now. Please try again shortly.")
      }

      const data = await response.json()
      return data?.booking_id
    } finally {
      setIsBooking(false)
    }
  }

  const handleBookAndPay = async () => {
    if (!pricing.dogCount || !pricing.visitCount) {
      alert("Add at least one dog and choose a time to see the price.")
      return
    }

    try {
      const amountInEuro = Number(pricing.totalPrice.toFixed(2))
      const paymentRes = await fetch("/api/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInEuro,
          description: pricing.description || `Booking: ${service?.title}`,
        }),
      })

      const paymentData = await paymentRes.json()
      if (!paymentData?.orderId) {
        throw new Error("Payment order could not be created.")
      }

      const bookingId = await handleBook(paymentData.orderId)
      if (!bookingId) throw new Error("No booking ID returned!")

      if (paymentData.url) {
        window.location.href = paymentData.url
      } else {
        alert("Unable to begin payment")
      }
    } catch (error) {
      console.error("Booking + payment error", error)
      alert("Unable to start payment. Try again.")
    }
  }

  const state = {
    service,
    currentStep,
    setCurrentStep,
    availability,
    isDayAvailableForService,
    getDefaultSlotForDate,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    selectedSlots,
    setSelectedSlots,
    formatTime,
    clientName,
    setClientName,
    clientPhone,
    setClientPhone,
    clientEmail,
    setClientEmail,
    clientAddress,
    setClientAddress,
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
    hasAtLeastOneDog,
    scheduleEntries,
    pricing,
    notes,
    setNotes,
    formatCurrency,
    handleBookAndPay,
    isBooking,
  }

  return (
    <BookingDialog
      open={Boolean(service)}
      onClose={onClose}
      service={service}
      state={state}
    />
  )
}

export default BookingModal