export default async function handler(req, res) {
  try {
    let imageUrl = req.query.url;
    
    // Support POST requests as well
    if (req.method === 'POST') {
        imageUrl = req.body.url;
    }

    if (!imageUrl) {
      return res.status(400).send("No image URL provided");
    }

    // Security Check: Prevent SSRF
    let parsedUrl;
    try {
      parsedUrl = new URL(imageUrl);
    } catch (e) {
      return res.status(400).send("Invalid URL format");
    }

    const isHttp = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    if (!isHttp) {
      return res.status(400).send("Only http or https URLs are permitted");
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    
    const isInternal = 
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "169.254.169.254" || 
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname); 

    if (isInternal) {
      return res.status(403).send("Access to internal or private URLs is forbidden");
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      return res.status(500).send("Failed to fetch image");
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    
    let ext = "jpg";
    if (contentType.includes("png")) {
      ext = "png";
    } else if (contentType.includes("webp")) {
      ext = "webp";
    } else if (contentType.includes("gif")) {
      ext = "gif";
    } else if (contentType.includes("jpeg")) {
      ext = "jpeg";
    } else {
      try {
        const cleanUrl = imageUrl.split('?')[0];
        const parts = cleanUrl.split('.');
        if (parts.length > 1) {
          const possibleExt = parts[parts.length - 1].toLowerCase();
          if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(possibleExt)) {
            ext = possibleExt;
          }
        }
      } catch(e) {}
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="bexobd-${Date.now()}.${ext}"`);
    res.send(buffer);
  } catch (error) {
    console.error("Proxy Download Error:", error);
    res.status(500).send("Error reading image content");
  }
}
