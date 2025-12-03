import { useBookingFlow } from "./useBookingFlow";
import { useBookingCalendar } from "./useBookingCalendar";
import { useBookingCustomer } from "./useBookingCustomer";
import { useBookingPets } from "./useBookingPets";
import { useBookingPricing } from "./useBookingPricing";

export function useBookingState(service, availability, isDayAvailableForService, profile, DOG_BREEDS) {
  const flow = useBookingFlow();
  const calendar = useBookingCalendar(service, availability, isDayAvailableForService);
  const customer = useBookingCustomer(profile);
  const pets = useBookingPets(4, DOG_BREEDS);
  const pricing = useBookingPricing(service, pets.dogs, calendar.scheduleEntries, Number);

  return {
    ...flow,
    ...calendar,
    ...customer,
    ...pets,
    pricing,
  };
}
