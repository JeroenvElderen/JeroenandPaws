export function useBookingPricing(service, dogs, scheduleEntries, parsePriceValue) {
  const servicePrice = parsePriceValue(service.price ?? service.cost ?? "0");

  const dogCount = dogs.filter(
    (dog) => dog.name || dog.breed || dog.notes || dog.photoDataUrl
  ).length;

  const visitCount = scheduleEntries.length;

  const perDogPerVisit = servicePrice;
  const additionalDogPrice = perDogPerVisit * 0.5;
  const additionalDogDiscount =
    dogCount >= 2 ? Math.max(perDogPerVisit - additionalDogPrice, 0) : 0;
  const secondDogPrice = additionalDogPrice;
  const thirdDogPrice = additionalDogPrice;
  const secondDogDiscount = additionalDogDiscount;
  const thirdDogDiscount = additionalDogDiscount;

  const perVisitTotal =
    dogCount >= 1
      ? perDogPerVisit + additionalDogPrice * Math.max(dogCount - 1, 0)
      : 0;

  const baseTotal = perVisitTotal * visitCount;

  const totalPrice = baseTotal;

  const formatCurrency = (v) => `€${Number(v).toFixed(2)}`;

  return {
    totalPrice,
    dogCount,
    visitCount,
    perDogPerVisit,
    servicePrice,
    perVisitTotal,
    additionalDogPrice,
    additionalDogDiscount,
    secondDogPrice,
    secondDogDiscount,
    thirdDogPrice,
    thirdDogDiscount,
    formatCurrency,
  };
}
