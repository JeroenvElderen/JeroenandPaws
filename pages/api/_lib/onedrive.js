import { getAppOnlyAccessToken } from "./auth";
import fs from "fs";
import path from "path";
import { Client } from "@microsoft/microsoft-graph-client";

export async function uploadToOneDrive(localPath, invoiceNumber) {
  const accessToken = await getAppOnlyAccessToken();

  const client = Client.init({
    authProvider: (done) => done(null, accessToken),
  });

  const buffer = fs.readFileSync(localPath);

  const filePath = `/Invoices/${invoiceNumber}.pdf`;

  await client.api(`/me/drive/root:${filePath}:/content`).put(buffer);

  return filePath; // stored in OneDrive
}
