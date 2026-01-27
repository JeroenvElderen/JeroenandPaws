const { exchangeCodeForTokens, serializeTokens } = require("../../_lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end("Method Not Allowed");
    return;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString("utf8");
  const { code } = body ? JSON.parse(body) : {};

  if (!code) {
    res.statusCode = 400;
    res.end(JSON.stringify({ message: "Missing authorization code" }));
    return;
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    serializeTokens(res, tokens);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ status: "ok" }));
  } catch (error) {
    console.error("Auth exchange error", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: "Failed to exchange code" }));
  }
};