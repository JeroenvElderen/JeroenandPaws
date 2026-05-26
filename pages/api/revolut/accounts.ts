import type { NextApiRequest, NextApiResponse } from "next";
import { getFreshRevolutAccessToken } from "../../../lib/revolut/businessAuth";

const ACCOUNTS_URL = "https://b2b.revolut.com/api/1.0/accounts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const accessToken = await getFreshRevolutAccessToken();

    const response = await fetch(ACCOUNTS_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || "Revolut accounts failed",
    });
  }
}
