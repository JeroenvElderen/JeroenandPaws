const { lookupAddressFromEircode } = require("./_lib/travel");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end(JSON.stringify({ message: "Method not allowed" }));
    return;
  }

  const code = (req.query.eircode || req.query.code || "").trim();

  if (!code) {
    res.statusCode = 400;
    res.end(JSON.stringify({ message: "Please provide an Eircode to search." }));
    return;
  }

  const result = await lookupAddressFromEircode(code);

  if (!result || !result.address) {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: "We couldn't find an address for that Eircode." }));
    return;
  }

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.end(
    JSON.stringify({
      address: result.address,
      coordinates:
        result.lat && result.lon
          ? { lat: result.lat, lon: result.lon }
          : undefined,
    })
  );
};
