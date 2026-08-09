import { PriceRule, ImportedProductPreview, Product } from '../types';

/**
 * Calculates the final selling price based on original price and price rule.
 */
export function calculateSellingPrice(originalPrice: number, rule: PriceRule): number {
  if (isNaN(originalPrice) || originalPrice <= 0) return 0;
  
  let result = originalPrice;

  if (rule.type === 'fixed_add') {
    result = originalPrice + (rule.value || 0);
  } else if (rule.type === 'percentage_add') {
    result = originalPrice * (1 + (rule.value || 0) / 100);
  } else if (rule.type === 'fixed_price') {
    result = rule.value || originalPrice;
  }

  // Rounding logic
  if (rule.roundRule === 'round_10') {
    result = Math.ceil(result / 10) * 10;
  } else if (rule.roundRule === 'round_50') {
    result = Math.ceil(result / 50) * 50;
  } else if (rule.roundRule === 'round_100') {
    result = Math.ceil(result / 100) * 100;
  } else if (rule.roundRule === 'round_99') {
    result = Math.floor(result) + 0.99;
  } else {
    result = Math.round(result);
  }

  return Math.max(0, result);
}

/**
 * Format price for BDT currency display
 */
export function formatBDT(amount: number): string {
  return `৳ ${amount.toLocaleString('en-BD')}`;
}

/**
 * Normalizes raw product objects from various external e-commerce formats
 * (WooCommerce, Shopify, Custom REST APIs) into Bexo BD's ImportedProductPreview format.
 */
export function normalizeProductData(rawItems: any[]): ImportedProductPreview[] {
  if (!Array.isArray(rawItems)) return [];

  return rawItems.map((item, index) => {
    // 1. Identify Title
    const title = item.title?.rendered || item.title || item.name || item.product_name || `Imported Product #${index + 1}`;

    // 2. Identify SKU
    const sku = item.sku || item.code || item.item_code || item.product_code || `BEXO-${String(index + 1).padStart(4, '0')}`;

    // 3. Identify Price
    let price = 0;
    if (typeof item.price === 'number') price = item.price;
    else if (typeof item.price === 'string') price = parseFloat(item.price) || 0;
    else if (item.regular_price) price = parseFloat(item.regular_price) || 0;
    else if (item.basePrice) price = item.basePrice;
    else if (item.variants?.[0]?.price) price = parseFloat(item.variants[0].price) || 0;

    // 4. Identify Category
    let category = 'General';
    if (Array.isArray(item.categories) && item.categories.length > 0) {
      category = typeof item.categories[0] === 'string' ? item.categories[0] : (item.categories[0].name || 'General');
    } else if (item.category) {
      category = typeof item.category === 'string' ? item.category : (item.category.name || 'General');
    } else if (item.product_type) {
      category = item.product_type;
    }

    // 5. Identify Image
    let imageUrl = 'https://picsum.photos/seed/bexo/400/400';
    let images: string[] = [];

    if (Array.isArray(item.images) && item.images.length > 0) {
      images = item.images.map((img: any) => typeof img === 'string' ? img : (img.src || img.url)).filter(Boolean);
      if (images.length > 0) imageUrl = images[0];
    } else if (item.image) {
      imageUrl = typeof item.image === 'string' ? item.image : (item.image.src || item.image.url || imageUrl);
    } else if (item.imageUrl) {
      imageUrl = item.imageUrl;
    }

    // 6. Identify Description
    let description = item.description?.rendered || item.description || item.body_html || item.short_description || 'High-quality imported product available on Bexo BD.';
    // Clean HTML tags if present
    description = description.replace(/<[^>]*>?/gm, '').trim();
    if (description.length > 250) {
      description = description.slice(0, 247) + '...';
    }

    // 7. Stock Status
    let stockStatus: 'in_stock' | 'out_of_stock' = 'in_stock';
    let stockQuantity: number | undefined = undefined;

    if (item.stock_status === 'outofstock' || item.in_stock === false || item.stock === 0) {
      stockStatus = 'out_of_stock';
    }
    if (typeof item.stock_quantity === 'number') stockQuantity = item.stock_quantity;
    else if (typeof item.stock === 'number') stockQuantity = item.stock;

    // 8. Variants
    const variants: { name: string; options: string[] }[] = [];
    if (Array.isArray(item.attributes)) {
      item.attributes.forEach((attr: any) => {
        if (attr.name && Array.isArray(attr.options)) {
          variants.push({ name: attr.name, options: attr.options.map((o: any) => String(o)) });
        }
      });
    } else if (Array.isArray(item.options)) {
      item.options.forEach((opt: any) => {
        if (opt.name && Array.isArray(opt.values)) {
          variants.push({ name: opt.name, options: opt.values.map((v: any) => String(v)) });
        }
      });
    } else if (Array.isArray(item.variants)) {
      // Extract sizes / colors if present
      const sizes = item.variants.map((v: any) => v.option1 || v.size).filter(Boolean);
      if (sizes.length > 0) variants.push({ name: 'Size', options: Array.from(new Set(sizes)) });
    }

    return {
      externalId: String(item.id || item.product_id || index + 1),
      title,
      sku,
      category,
      description,
      imageUrl,
      images,
      originalPrice: price,
      calculatedPrice: price,
      stockStatus,
      stockQuantity,
      variants,
      selected: true,
    };
  });
}

/**
 * Server API helper to test connection to an API
 */
export async function testApiConnection(payload: {
  websiteUrl: string;
  apiType: string;
  authType: string;
  apiKey?: string;
  apiSecret?: string;
  customHeaders?: string;
}): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const response = await fetch('/api/test-api-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.errorReason || data.message || 'API Connection Failed',
      };
    }

    return {
      success: true,
      message: data.message || 'Connection test successful!',
      details: data.details,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Network Error: Could not reach Bexo BD API server.',
    };
  }
}

/**
 * Server API helper to fetch products from external website
 */
export async function fetchExternalProducts(payload: {
  websiteUrl: string;
  apiType: string;
  authType: string;
  apiKey?: string;
  apiSecret?: string;
  customHeaders?: string;
}): Promise<{ success: boolean; products?: ImportedProductPreview[]; errorReason?: string }> {
  try {
    const response = await fetch('/api/fetch-external-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      return {
        success: false,
        errorReason: data.errorReason || 'Product Data Not Found',
      };
    }

    const rawProducts = data.products || [];
    const normalized = normalizeProductData(rawProducts);

    return {
      success: true,
      products: normalized,
    };
  } catch (err: any) {
    return {
      success: false,
      errorReason: 'Network Error: Failed to retrieve external products.',
    };
  }
}
