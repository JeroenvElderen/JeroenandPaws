import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const token = process.env.REVOLUT_ACCES_TOKEN?.trim();

    return res.status(200).json({
      exists: !!token,
      startsWith: token?.slice(0, 8),
      endsWith: token?.slice(-8),
      length: token?.length,
      containsSpaces: /\s/.test(token || ""),
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
