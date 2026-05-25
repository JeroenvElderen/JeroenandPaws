import type { NextApiRequest, NextApiResponse } from "next";
import { importPKCS8, SignJWT } from "jose";

const REVOLUT_TOKEN_URL = "https://b2b.revolut.com/api/1.0/auth/token";
const REVOLUT_JWT_ISSUER = "www.jeroenandpaws.com";

async function createClientAssertion() {
  const clientId = process.env.REVOLUT_CLIENT_ID;
  const privateKey = process.env.REVOLUT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientId) throw new Error("Missing REVOLUT_CLIENT_ID");
  if (!privateKey) throw new Error("Missing REVOLUT_PRIVATE_KEY");

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
    const refreshToken =
      process.env.REVOLUT_REFRESH_TOKEN ||
      process.env.REVOLUT_REFESH_TOKEN;

    if
