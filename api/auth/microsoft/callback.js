const { exchangeCodeForTokens, serializeTokens } = require("../../_lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end("Method Not Allowed");
    return;
  }

  const url = new URL(req.url, process.env.BACKEND_BASE_URL);
  const code = url.searchParams.get("code");

  if (!code) {
    res.statusCode = 400;
    res.end("Missing authorization code");
    return;
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    serializeTokens(res, tokens);

    const redirectTo =
      process.env.FRONTEND_REDIRECT_URI || "http://localhost:3000/auth/callback";

    res.statusCode = 302;
    res.setHeader("Location", redirectTo);
    res.end();
  } catch (error) {
    console.error("Auth callback error", error);
    res.statusCode = 500;
    res.end("Failed to exchange authorization code");
  }
};