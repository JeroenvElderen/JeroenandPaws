const { HARDCODED_SERVICES } = require("./_lib/hardcoded-services");

const normalizeString = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const requestedCategory = normalizeString(req.query?.category);

    const services = HARDCODED_SERVICES.filter((service) => {
      if (!requestedCategory) {
        return true;
      }

      return normalizeString(service.category) === requestedCategory;
    }).map((service) => ({
      ...service,
      id: service.slug,
      duration_minutes: service.duration,
    }));

    return res.status(200).json({ services });
  }

  return res.status(405).json({
    message: "Services are hardcoded and read-only. POST updates are disabled.",
  });
}