// /lib/revolut/businessAuth.ts
import { importPKCS8, SignJWT } from "jose";

const TOKEN_URL = "https://b2b.revolut.com/api/1.0/auth/token";
const ISSUER = "www.jeroenandpaws.com";

async function createClientAssertion() {
  const clientId = process.env.REVOLUT_CLIENT_ID;
  const privateKey = process.env.REVOLUT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientId) throw new Error("Missing REVOLUT_CLIENT_ID");
  if (!privateKey) throw new Error("Missing REVOLUT_PRIVATE_KEY");

  const key = await importPKCS8(privateKey, "RS256");

  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(ISSUER)
    .setSubject(clientId)
    .setAudience("https://revolut.com")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(key);
}

export async function getFreshRevolutAccessToken() {
  const refreshToken = process.env.REVOLUT_REFRESH_TOKEN;

  if (!refreshToken) throw new Error("Missing REVOLUT_REFRESH_TOKEN");

  const clientAssertion = await createClientAssertion();

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken.trim(),
    client_assertion_type:
      "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: clientAssertion,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data.access_token as string;
}
