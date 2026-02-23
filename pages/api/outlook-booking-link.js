export default function handler(req, res) {
  res
    .status(410)
    .json({
      error:
        "Deprecated endpoint: Microsoft Bookings URL is no longer required. Use in-app Outlook-style booking flow.",
    });
}
