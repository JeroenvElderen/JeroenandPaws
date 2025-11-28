const { supabaseAdmin } = require('./_lib/supabase');

const isAdmin = (req) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'jeroen@jeroenandpaws.com';
  const headerEmail = (req.headers['x-admin-email'] || '').toLowerCase();
  return headerEmail && headerEmail === adminEmail.toLowerCase();
};

module.exports = async (req, res) => {
  //
  // 🟢 GET — Load services (optionally filtered by category)
  //
  if (req.method === 'GET') {
    const { category } = req.query;

    let query = supabaseAdmin
      .from('services_catalog')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const servicesResult = await query;

    if (servicesResult.error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Failed to load services' }));
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ services: servicesResult.data || [] }));
    return;
  }

  //
  // 🔐 POST — Create or update a service (admin only)
  //
  if (req.method === 'POST') {
    if (!isAdmin(req)) {
      res.statusCode = 401;
      res.end(JSON.stringify({ message: 'Admin email required' }));
      return;
    }

    const service = req.body?.service;

    if (!service?.title) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: 'Service title is required' }));
      return;
    }

    const payload = {
      title: service.title,
      slug:
        service.slug ||
        service.id ||
        service.title.toLowerCase().replace(/\s+/g, '-'),
      description: service.description || null,
      price: service.price || null,
      duration_minutes:
        service.duration_minutes || service.durationMinutes || 60,
      sort_order: service.sort_order ?? 0,
      is_active: service.is_active ?? true,
      category: service.category || 'General', // 👈 NEW CATEGORY SUPPORT
    };

    const upsertResult = await supabaseAdmin
      .from('services_catalog')
      .upsert(payload, { onConflict: 'slug' })
      .select('*')
      .single();

    if (upsertResult.error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Failed to save service' }));
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ service: upsertResult.data }));
    return;
  }

  //
  // ❌ Unsupported method
  //
  res.statusCode = 405;
  res.setHeader('Allow', 'GET, POST');
  res.end('Method Not Allowed');
};
