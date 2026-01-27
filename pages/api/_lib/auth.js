const crypto = require("crypto");

const TOKEN_COOKIE = "msTokens";
const SCOPES = ["offline_access", "Calendars.ReadWrite"];

const requiredEnv = [
  "AZURE_CLIENT_ID",
  "AZURE_CLIENT_SECRET",
  "AZURE_TENANT_ID",
  "BACKEND_BASE_URL",
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Missing env var ${key}`);
  }
});

const authority = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0`;
const redirectUri =
  process.env.AZURE_REDIRECT_URI ||
  `${process.env.BACKEND_BASE_URL}/api/auth/microsoft/callback`;

  const encryptionSecret =
  process.env.TOKEN_ENCRYPTION_KEY ||
  process.env.AZURE_CLIENT_SECRET ||
  "development-token-key";

if (!process.env.TOKEN_ENCRYPTION_KEY && !process.env.AZURE_CLIENT_SECRET) {
  console.warn(
    "Missing TOKEN_ENCRYPTION_KEY and AZURE_CLIENT_SECRET; using fallback encryption key"
  );
}

const encryptionKey = crypto
  .createHash("sha256")
  .update(encryptionSecret)
  .digest();

const serializeCookie = (name, value, options = {}) => {
  const segments = [`${name}=${value}`];
  if (options.maxAge) segments.push(`Max-Age=${options.maxAge}`);
  if (options.domain) segments.push(`Domain=${options.domain}`);
  if (options.path) segments.push(`Path=${options.path}`);
  if (options.secure) segments.push("Secure");
  if (options.httpOnly) segments.push("HttpOnly");
  if (options.sameSite) segments.push(`SameSite=${options.sameSite}`);
  return segments.join("; ");
};

const parseCookieHeader = (header) => {
  if (!header) return {};
  return header.split(/; */).reduce((acc, part) => {
    const [key, ...rest] = part.split("=");
    if (!key) return acc;
    acc[key.trim()] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
};

const encrypt = (data) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
};

const decrypt = (payload) => {
  const buffer = Buffer.from(payload, "base64");
  const iv = buffer.subarray(0, 16);
  const tag = buffer.subarray(16, 32);
  const encrypted = buffer.subarray(32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
  return JSON.parse(decrypted);
};

const serializeTokens = (res, tokens) => {
  const encoded = encrypt(tokens);
  const secure = process.env.NODE_ENV === "production";
  const cookieString = serializeCookie(TOKEN_COOKIE, encoded, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  res.setHeader("Set-Cookie", cookieString);
};

const parseTokens = (req) => {
  if (!req.headers.cookie) return null;
  const cookies = parseCookieHeader(req.headers.cookie || "");
  if (!cookies[TOKEN_COOKIE]) return null;
  try {
    return decrypt(cookies[TOKEN_COOKIE]);
  } catch (error) {
    console.error("Failed to decrypt token cookie", error);
    return null;
  }
};

const buildAuthUrl = async () => {
  const params = new URLSearchParams({
    client_id: process.env.AZURE_CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: SCOPES.join(" "),
    prompt: "select_account",
  });

  return `${authority}/authorize?${params.toString()}`;
};

const tokenRequest = async (formData, { includeRedirect = true } = {}) => {
  const response = await fetch(`${authority}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AZURE_CLIENT_ID,
      client_secret: process.env.AZURE_CLIENT_SECRET,
      ...(includeRedirect ? { redirect_uri: redirectUri } : {}),
      ...formData,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token endpoint error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  };
};

const exchangeCodeForTokens = async (code) =>
  tokenRequest({
    grant_type: "authorization_code",
    code,
    scope: SCOPES.join(" "),
  });

const refreshTokens = async (stored) => {
  if (!stored?.refreshToken) return null;
  return tokenRequest({
    grant_type: "refresh_token",
    refresh_token: stored.refreshToken,
    scope: SCOPES.join(" "),
  });
};

let cachedAppToken = null;

const appTokenRequest = async () => {
  const token = await tokenRequest(
    {
      grant_type: "client_credentials",
      scope: "https://graph.microsoft.com/.default",
    },
    { includeRedirect: false }
  );

  cachedAppToken = {
    accessToken: token.accessToken,
    expiresAt: token.expiresAt,
  };

  return cachedAppToken;
};

const hasValidAppToken = () => {
  if (!cachedAppToken?.expiresAt) return false;
  const expiresAt = new Date(cachedAppToken.expiresAt);
  return expiresAt.getTime() > Date.now() + 60 * 1000;
};

const getAppOnlyAccessToken = async () => {
  if (hasValidAppToken()) {
    return cachedAppToken.accessToken;
  }

  const freshToken = await appTokenRequest();
  return freshToken.accessToken;
};

const needsRefresh = (tokens) => {
  if (!tokens?.expiresAt) return true;
  const expiresAt = new Date(tokens.expiresAt);
  const refreshThreshold = Date.now() + 5 * 60 * 1000;
  return expiresAt.getTime() <= refreshThreshold;
};

const ensureTokens = async (req, res) => {
  const stored = parseTokens(req);
  if (!stored) return null;

  if (!needsRefresh(stored)) {
    return stored;
  }

  const refreshed = await refreshTokens(stored);
  if (refreshed) {
    serializeTokens(res, refreshed);
    return refreshed;
  }

  return null;
};

module.exports = {
  buildAuthUrl,
  ensureTokens,
  exchangeCodeForTokens,
  getAppOnlyAccessToken,
  parseTokens,
  serializeTokens,
};