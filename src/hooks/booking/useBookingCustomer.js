import { useState } from "react";

export function useBookingCustomer(profile) {
  const [clientName, setClientName] = useState(profile?.full_name || "");
  const [clientPhone, setClientPhone] = useState(profile?.phone || "");
  const [clientEmail, setClientEmail] = useState(profile?.email || "");
  const [clientAddress, setClientAddress] = useState(profile?.address || "");
  const [notes, setNotes] = useState("");

  const isCustomerValid =
    clientName.trim() && clientPhone.trim() && clientEmail.trim() && clientAddress.trim();

  return {
    clientName, setClientName,
    clientPhone, setClientPhone,
    clientEmail, setClientEmail,
    clientAddress, setClientAddress,
    notes, setNotes,
    isCustomerValid,
  };
}
