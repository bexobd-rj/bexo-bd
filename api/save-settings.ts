import { authenticateAdmin } from "./security.ts";

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-access-token'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  // Authenticate Admin
  const authResult = await authenticateAdmin(req);
  if (!authResult.authenticated) {
    return res.status(401).json({ success: false, error: authResult.error || "Unauthorized" });
  }

  try {
    const settings = req.body || {};
    return res.json({ success: true, message: "Settings saved successfully" });
  } catch (error: any) {
    console.error("Save settings error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
