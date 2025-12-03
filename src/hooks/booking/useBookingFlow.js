import { useState } from "react";

export function useBookingFlow() {
  const stepOrder = ["calendar", "time", "customer", "pet", "summary"];
  const [currentStep, setCurrentStep] = useState("calendar");

  return {
    stepOrder,
    currentStep,
    setCurrentStep,
  };
}
