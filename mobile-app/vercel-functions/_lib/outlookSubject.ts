export type ParsedOutlookSubject = {
  clientName: string | null;
  dogNames: string[];
  serviceName: string;
};

/**
 * Parse the canonical calendar title:
 * [JP] - dog or dog & dog - service - client name
 */
export function parseOutlookSubject(subject: string): ParsedOutlookSubject {
  const match = subject
    .trim()
    .match(/^\[JP\]\s+-\s+(.+?)\s+-\s+(.+?)\s+-\s+(.+)$/i);

  if (!match) {
    return { clientName: null, dogNames: [], serviceName: "unknown" };
  }

  const [, dogsPart, serviceName, clientName] = match;
  const dogNames = dogsPart
    .split(/\s*(?:&|,)\s*/)
    .map((name) => name.trim())
    .filter(Boolean);

  return {
    clientName: clientName.trim() || null,
    dogNames,
    serviceName: serviceName.trim() || "unknown",
  };
}
