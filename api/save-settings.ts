export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const settings = req.body || {};
    // Here we could save to a database if we had a backend database configured.
    // For now, return success to the frontend which will also save to localStorage/Supabase.
    return res.json({ success: true, message: "Settings saved successfully" });
  } catch (error: any) {
    console.error("Save settings error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
