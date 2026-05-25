import type { NextApiRequest, NextApiResponse } from "next";

const REVOLUT_ACCOUNTS_URL = "https://b2b.revolut.com/api/1.0/accounts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const token =
      process.env.REVOLUT_ACCESS_TOKEN ||
      process.env.REVOLUT_ACCES_TOKEN;

    if (!token) {
      return res.status(500).json({
        error: "Missing token",
      });
    }

    const cleaned = token.trim();

    const response = await fetch(REVOLUT_ACCOUNTS_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cleaned}`,
        Accept: "application/json",
      },
    });

    const text = await response.text();

    return res.status(response.status).json({
      request: {
        authHeaderPreview: `Bearer ${cleaned.slice(0, 15)}...`,
        tokenLength: cleaned.length,
      },
      response: {
        status: response.status,
        body: text,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
