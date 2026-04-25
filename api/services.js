const { HARDCODED_SERVICES } = require("./_lib/hardcoded-services");

const normalizeString = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

module.exports = async (req, res) => {
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

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ services }));
    return;
  }

  //
  // ❌ Unsupported method
  //
  res.statusCode = 405;
  res.setHeader("Allow", "GET");
  res.end(
    JSON.stringify({
      message: "Services are hardcoded and read-only. POST updates are disabled.",
    })
  );
};
