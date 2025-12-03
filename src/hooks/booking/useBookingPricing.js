export function useBookingPricing(service, dogs, scheduleEntries, parsePriceValue) {
  const servicePrice = parsePriceValue(service.price ?? service.cost ?? "0");

  const dogCount = dogs.filter(
    (dog) => dog.name || dog.breed || dog.notes || dog.photoDataUrl
  ).length;

  const visitCount = scheduleEntries.length;

  const baseTotal = dogCount * visitCount * servicePrice;

  const totalPrice = baseTotal;

  const formatCurrency = (v) => `€${Number(v).toFixed(2)}`;

  return {
    totalPrice,
    dogCount,
    visitCount,
    perDogPerVisit: servicePrice,
    formatCurrency,
  };
}
