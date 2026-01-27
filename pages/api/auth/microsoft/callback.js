const { exchangeCodeForTokens, serializeTokens } = require("../../_lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end("Method Not Allowed");
    return;
  }

  const { code, error, returnTo } = req.query || {};

  if (error) {
    res.statusCode = 400;
    res.end(`Login failed: ${error}`);
    return;
  }

  if (!code) {
    res.statusCode = 400;
    res.end("Missing authorization code");
    return;
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    serializeTokens(res, tokens);

    const redirectTarget = returnTo || "/booking";
    res.statusCode = 302;
    res.setHeader("Location", redirectTarget);
    res.end();
  } catch (err) {
    console.error("Auth callback error", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Failed to complete login" }));
  }
};
