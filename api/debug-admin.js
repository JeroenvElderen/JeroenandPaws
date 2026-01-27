const DEFAULT_OWNER_EMAIL = 'jeroen@jeroenandpaws.com';

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const resolveOwnerEmail = () =>
  normalizeEmail(process.env.ADMIN_EMAIL || DEFAULT_OWNER_EMAIL);

module.exports = async (req, res) => {
  try {
    if (req.method !== 'GET') {
      res.statusCode = 405;
      return res.end(JSON.stringify({ message: 'Method not allowed' }));
    }

    // Safer query parsing
    const url = new URL(req.url, `http://${req.headers.host}`);
    const rawEmail = url.searchParams.get('email') || '';

    const clientEmail = normalizeEmail(rawEmail);
    const ownerEmail = resolveOwnerEmail();

    res.setHeader('Content-Type', 'application/json');

    return res.end(
      JSON.stringify({
        clientEmail,
        ownerEmail,
        adminEmailEnv: process.env.ADMIN_EMAIL || null,
        matchesOwner:
          Boolean(clientEmail) && clientEmail === ownerEmail,
      })
    );
  } catch (err) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: String(err) }));
  }
};
