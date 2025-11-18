const { buildAuthUrl } = require("../../_lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end("Method Not Allowed");
    return;
  }

  try {
    const authUrl = await buildAuthUrl();
    res.statusCode = 302;
    res.setHeader("Location", authUrl);
    res.end();
  } catch (error) {
    console.error("Auth login error", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Failed to start login" }));
  }
};
