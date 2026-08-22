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

  // 1. Authenticate Admin
  const authResult = await authenticateAdmin(req);
  if (!authResult.authenticated) {
    return res.status(401).json({ success: false, error: authResult.error || "Unauthorized" });
  }

  try {
    const { selectedProducts, markupValue, markupType } = req.body || {};
    if (!selectedProducts || !Array.isArray(selectedProducts)) {
      return res.status(400).json({ success: false, error: "selectedProducts array is required" });
    }

    const processed = selectedProducts.map(p => {
      let price = parseFloat(p.sourcePrice) || 0;
      let finalPrice = price;
      let pMarkupValue = parseFloat(markupValue) || 0;
      
      if (markupType === 'percentage' && pMarkupValue > 0) {
        finalPrice = price + (price * (pMarkupValue / 100));
      } else if (markupType === 'fixed' && pMarkupValue > 0) {
        finalPrice = price + pMarkupValue;
      }

      return {
        id: 'IMP-' + Math.random().toString(36).substr(2, 9),
        originalId: p.originalId,
        title: p.name,
        name: p.name,
        sku: p.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
        category: p.category || "Imported",
        price: finalPrice,
        sourcePrice: price,
        stock: p.stock || 10,
        image: p.img || "https://picsum.photos/seed/bexo/400/400",
        status: "published",
        date: new Date().toISOString().split('T')[0],
        imported: true
      };
    });

    return res.json({ success: true, products: processed });
  } catch (error: any) {
    console.error("Publish products error:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
}
