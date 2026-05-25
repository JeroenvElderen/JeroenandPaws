import type { NextApiRequest, NextApiResponse } from "next";
import { importPKCS8, SignJWT } from "jose";

const REVOLUT_TOKEN_URL = "https://b2b.revolut.com/api/1.0/auth/token";

const REVOLUT_REDIRECT_URI =
  process.env.REVOLUT_REDIRECT_URI ||
  "https://www.jeroenandpaws.com/api/revolut/callback";

const REVOLUT_JWT_ISSUER = "www.jeroenandpaws.com";

async function createClientAssertion() {
  const clientId = process.env.REVOLUT_CLIENT_ID;
  const privateKey = process.env.REVOLUT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientId) {
    throw new Error("Missing REVOLUT_CLIENT_ID");
  }

  if (!privateKey) {
    throw new Error("Missing REVOLUT_PRIVATE_KEY");
  }

  const key = await importPKCS8(privateKey, "RS256");

  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(REVOLUT_JWT_ISSUER)
    .setSubject(clientId)
    .setAudience("https://revolut.com")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(key);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const code = String(req.query.code || "");

    if (!code) {
      return res.status(400).json({
        error: "Missing Revolut authorization code",
      });
    }

    const clientAssertion = await createClientAssertion();

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_assertion_type:
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: clientAssertion,
    });

    const response = await fetch(REVOLUT_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        status: response.status,
        revolut_error: data,
      });
    }

    return res.status(200).json({
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Token exchange failed",
    });
  }
}