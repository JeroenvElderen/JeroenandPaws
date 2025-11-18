const { buildAuthUrl } = require("../../_lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end("Method Not Allowed");
    return;
  }

  const authUrl = await buildAuthUrl();
  res.statusCode = 302;
  res.setHeader("Location", authUrl);
  res.end();
};