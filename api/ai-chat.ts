import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Rule-based fallback response generator when API key is not present or network issues occur
function generateRuleBasedFallback(message: string, isLoggedIn: boolean | string, context: any) {
  const msgLower = (message || "").toLowerCase().trim();
  const userIsLoggedIn =
    isLoggedIn === true ||
    isLoggedIn === "true" ||
    (typeof isLoggedIn === "string" && isLoggedIn.toLowerCase() === "true") ||
    Boolean(context?.userEmail) ||
    Boolean(context?.userName);

  if (!userIsLoggedIn) {
    // Mode 1: Public AI
    if (
      msgLower.includes("balance") ||
      msgLower.includes("ব্যালেন্স") ||
      msgLower.includes("order") ||
      msgLower.includes("অর্ডার") ||
      msgLower.includes("profile") ||
      msgLower.includes("প্রোফাইল") ||
      msgLower.includes("wallet") ||
      msgLower.includes("ওয়ালেট")
    ) {
      return {
        reply: "এই তথ্যটি দেখতে আপনাকে প্রথমে আপনার Bexo BD অ্যাকাউন্টে লগইন করতে হবে।",
        action: {
          action: "OPEN_LOGIN",
          params: { message: "Please log in to view private dashboard data." },
        },
      };
    }

    if (
      msgLower.includes("register") ||
      msgLower.includes("সাইন আপ") ||
      msgLower.includes("খুলব") ||
      msgLower.includes("অ্যাকাউন্ট")
    ) {
      return {
        reply: "Bexo BD-এ ড্রপশিপিং অ্যাকাউন্ট খোলার জন্য রেজিস্টার পেজে নিয়ে যাওয়া হচ্ছে।",
        action: { action: "OPEN_REGISTER", params: {} },
      };
    }

    if (msgLower.includes("login") || msgLower.includes("লগইন")) {
      return {
        reply: "আপনার রিসেলার অ্যাকাউন্টে লগইন করুন।",
        action: { action: "OPEN_LOGIN", params: {} },
      };
    }

    if (
      msgLower.includes("charge") ||
      msgLower.includes("চার্জ") ||
      msgLower.includes("delivery") ||
      msgLower.includes("ডেলিভারি")
    ) {
      return {
        reply: "Bexo BD-এর ডেলিভারি চার্জ:\n• ঢাকা সিটির ভেতরে: ৳৬০\n• ঢাকার বাইরে (সারাদেশ): ৳১২০\nসকল পার্সেল ক্যাশ অন ডেলিভারিতে পাঠানো হয়।",
        action: null,
      };
    }

    if (
      msgLower.includes("product") ||
      msgLower.includes("প্রোডাক্ট") ||
      msgLower.includes("ক্যাটালগ") ||
      msgLower.includes("সামান")
    ) {
      return {
        reply: "আমাদের সকল মানসম্মত ড্রপশিপিং প্রোডাক্টস দেখুন:",
        action: { action: "VIEW_PUBLIC_PRODUCTS", params: {} },
      };
    }

    return {
      reply: "Bexo BD হলো বাংলাদেশের শীর্ষ ড্রপশিপিং রিসেলার সাপ্লায়ার পোর্টাল। এখানে কোনো ইনভেস্টমেন্ট ছাড়াই পণ্য বিক্রি করে আয় করতে পারবেন। রিসেলিং শুরু করতে লগইন বা রেজিস্ট্রেশন করুন।",
      action: null,
    };
  } else {
    // Mode 2: User Panel AI
    if (msgLower.includes("balance") || msgLower.includes("ব্যালেন্স") || msgLower.includes("টাকা")) {
      return {
        reply: `আপনার বর্তমান Bexo BD ওয়ালেট ব্যালেন্স: ৳${context?.balance ?? 0}। বিস্তারিত ব্যালেন্স পেজ থেকে দেখে নিন।`,
        action: null,
      };
    }

    if (msgLower.includes("order") || msgLower.includes("অর্ডার")) {
      const ordersCount = context?.ordersCount || 0;
      const totalDelivered = context?.totalDelivered || 0;
      const totalProfit = context?.totalProfit || 0;
      const recent = context?.recentOrder;
      
      let orderText = `আপনার মোট অর্ডারের সংখ্যা: ${ordersCount} টি।`;
      
      if (recent) {
        // Calculate profit for the last order specifically if it's delivered
        const isRecentDelivered = recent.status === 'Delivered' || recent.status === 'Delivery Completed' || recent.status === 'Completed';
        const recentProfit = isRecentDelivered ? (Number(recent.netProfit) || 0) : 0;
        
        orderText += `\nসর্বশেষ অর্ডার #${recent.id.slice(-6).toUpperCase()} - গ্রাহক: ${recent.customerName || "N/A"}, স্ট্যাটাস: ${recent.status}, নিট লাভ: ৳${recentProfit}`;
      }
      
      orderText += `\n(মোট ডেলিভারি সফল: ${totalDelivered} টি, মোট আয়: ৳${totalProfit})`;

      return {
        reply: orderText,
        action: null,
      };
    }

    if (msgLower.includes("recharge") || msgLower.includes("রিচার্জ")) {
      return {
        reply: "মোবাইল রিচার্জ নিশ্চিত করতে চান?",
        action: {
          action: "REQUIRE_CONFIRMATION",
          params: {
            message: "আপনি কি মোবাইল রিচার্জ পেজে গিয়ে রিচার্জ করতে চান?",
            pendingAction: { action: "NAVIGATE", params: { menu: "recharge" } },
          },
        },
      };
    }

    if (msgLower.includes("withdraw") || msgLower.includes("উত্তোলন") || msgLower.includes("তুলে")) {
      return {
        reply: "ওয়ালেট থেকে টাকা উত্তোলন করার অনুরোধ পাঠাতে চান?",
        action: {
          action: "REQUIRE_CONFIRMATION",
          params: {
            message: "আপনি কি ব্যালেন্স পেজে গিয়ে টাকা তোলার রিকোয়েস্ট দিতে চান?",
            pendingAction: { action: "NAVIGATE", params: { menu: "balance" } },
          },
        },
      };
    }

    if (msgLower.includes("logout") || msgLower.includes("লগআউট")) {
      return {
        reply: "আপনি কি নিশ্চিত যে আপনার রিসেলার অ্যাকাউন্ট থেকে লগআউট করতে চান?",
        action: {
          action: "REQUIRE_CONFIRMATION",
          params: {
            message: "আপনি কি নিশ্চিত লগআউট করতে চান?",
            pendingAction: { action: "LOGOUT", params: {} },
          },
        },
      };
    }

    if (msgLower.includes("product") || msgLower.includes("প্রোডাক্ট") || msgLower.includes("সার্চ")) {
      return {
        reply: `ক্যাটালগে মোট ${context?.productsCount || 0} টি প্রোডাক্ট রয়েছে। প্রোডাক্ট পেজ থেকে সরাসরি অর্ডার বা কপি করতে পারেন।`,
        action: { action: "NAVIGATE", params: { menu: "products" } },
      };
    }

    if (msgLower.includes("profit") || msgLower.includes("sales") || msgLower.includes("বিক্রি") || msgLower.includes("লাভ")) {
      return {
        reply: "আপনার মোট সেলস ও নিট প্রফিট দেখতে সেলস রিপোর্টে নিয়ে যাওয়া হচ্ছে।",
        action: { action: "NAVIGATE", params: { menu: "sales" } },
      };
    }

    return {
      reply: `হ্যালো ${context?.userName || "রিসেলার"}! আমি Bexo BD AI সহকারী। আপনার বর্তমান ব্যালেন্স ৳${context?.balance ?? 0}। আপনি ব্যালেন্স, অর্ডার, প্রফিট, রিচার্জ বা প্রোডাক্ট সার্চ এর জন্য প্রশ্ন করতে পারেন।`,
      action: null,
    };
  }
}

export default async function aiChatHandler(req: Request, res: Response) {
  // CORS & Security headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { message, isLoggedIn, context, imageBase64, history } = req.body || {};

    if (!message && !imageBase64) {
      return res.status(400).json({ error: "Message or image is required" });
    }

    // Robust login detection
    const userIsLoggedIn =
      isLoggedIn === true ||
      isLoggedIn === "true" ||
      (typeof isLoggedIn === "string" && isLoggedIn.toLowerCase() === "true") ||
      Boolean(context?.userEmail) ||
      Boolean(context?.userName) ||
      Boolean(context?.balance !== undefined);

    console.log(`[AI-CHAT] Request from ${userIsLoggedIn ? "Logged-in User" : "Public Visitor"}`);
    if (userIsLoggedIn) {
      console.log(`[AI-CHAT] Context: Name=${context?.userName}, Email=${context?.userEmail}, Balance=${context?.balance}`);
    }

    const mode = userIsLoggedIn ? "USER_PANEL" : "PUBLIC";
    const ai = getGenAI();

    // If Gemini client is not initialized because GEMINI_API_KEY is not set, use smart rule engine
    if (!ai) {
      const fallback = generateRuleBasedFallback(message, userIsLoggedIn, context);
      return res.json({
        success: true,
        mode,
        reply: fallback.reply,
        action: fallback.action,
        note: "Handled by intelligent rule engine (GEMINI_API_KEY environment variable pending)",
      });
    }

    let systemPrompt = "";

    if (mode === "PUBLIC") {
      systemPrompt = `You are "Bexo Public AI Assistant" (Bexo BD-এর পাব্লিক AI সহকারী).
You are assisting a visitor on the PUBLIC HOME PAGE (Before Login).

ABOUT BEXO BD:
- Bexo BD is Bangladesh's top dropshipping & reselling supplier portal.
- Resellers can start an online business with ZERO product investment.
- Bexo BD handles product sourcing, inventory management, packaging, and nationwide Cash on Delivery (COD) delivery.
- Delivery Charge: Inside Dhaka = ৳60, Outside Dhaka = ৳120.
- Reseller Payouts: Weekly / Instant automated withdrawals to bKash, Nagad, Rocket, or Bank Account.
- Registration Process: Click "Sign Up", provide Email & Password, verify email, then log in and set up shop name.

MODE 1 RULES (PUBLIC AI ONLY):
1. Answer general questions about Bexo BD, reseller dropshipping model, free registration, delivery charges, and public product catalog.
2. If the user asks for private data (their balance, their orders, wallet, profile):
   Politely explain that this is the Public AI Assistant and they must log in to view their reseller balance/orders.
   Provide the OPEN_LOGIN action:
   \`\`\`json
   {
     "action": "OPEN_LOGIN",
     "params": { "message": "Please log in to access your reseller dashboard and balance." }
   }
   \`\`\`

Available Public Actions:
- OPEN_LOGIN: { "action": "OPEN_LOGIN", "params": {} }
- OPEN_REGISTER: { "action": "OPEN_REGISTER", "params": {} }
- VIEW_PUBLIC_PRODUCTS: { "action": "VIEW_PUBLIC_PRODUCTS", "params": {} }

Reply politely in natural Bengali or English.
`;
    } else {
      // USER_PANEL MODE
      systemPrompt = `You are "Bexo Reseller AI Assistant" (Bexo BD-এর রিসেলার ইউজার প্যানেল AI সহকারী).
You are integrated inside the authenticated User Panel for resellers.

CRITICAL AUTHENTICATION RULE:
- THE USER IS CURRENTLY LOGGED IN as an authenticated reseller (${context?.userName || "Reseller"}).
- THEIR CURRENT WALLET BALANCE IS ৳${context?.balance ?? 0}.
- YOU MUST NEVER TELL THE USER TO LOG IN OR SAY "আপনাকে লগইন করতে হবে".
- WHEN THEY ASK "আমার ব্যালেন্স দেখাও" OR "আমার ব্যালেন্স কত", IMMEDIATELY TELL THEM THEIR ACTUAL BALANCE (৳${context?.balance ?? 0}) AND OFFER WALLET OPTIONS.
- WHEN THEY ASK ABOUT ORDERS, PROVIDE THEIR ORDER SUMMARY (${context?.ordersCount || 0} TOTAL ORDERS) IMMEDIATELY.

AUTHENTICATED USER CONTEXT:
- Name: ${context?.userName || "Reseller"}
- Email: ${context?.userEmail || "N/A"}
- Role: ${context?.userRole || "reseller"}
- Current Balance: ৳${context?.balance ?? 0}
- Active Screen/View: ${context?.activeView || "dashboard"}
- Total Products in Catalog: ${context?.productsCount || 0}
- Total Orders Count: ${context?.ordersCount || 0}
- Active Orders Count: ${context?.activeOrdersCount || 0}
- Stockout Products Count: ${context?.stockoutCount || 0}
- Recent Orders Summary: ${context?.orders ? JSON.stringify(context?.orders.slice(0, 5)) : "None"}

CAPABILITIES & KNOWLEDGE:
You understand all features of the User Panel in Bangla and English:
- Home / Dashboard (ওয়েবসাইট হোম, ওভারভিউ, সামারি)
- Products & Categories (সকল প্রোডাক্টস, ক্যাটাগরি, ইন-স্টক, স্টকআউট প্রোডাক্ট)
- Image Search & Visual Search (ছবি দিয়ে প্রোডাক্ট সার্চ)
- SKU Search & Text Search (এসকেইউ বা নাম দিয়ে প্রোডাক্ট সার্চ)
- Cart & Favorites (কার্ট লিস্ট, অর্ডার চেকআউট)
- Wallet, Balance, Balance Statement, Cash In (ব্যালেন্স হিসাব, স্টেটমেন্ট)
- Orders (অর্ডার লিস্ট, পেন্ডিং অর্ডার, প্রসেসিং, কমপ্লিট, ক্যান্সেলড, অর্ডার ডিটেইলস, অর্ডার ট্র্যাকিং)
- Invoices (কাস্টমার ইনভয়েস ডাউনলোড বা ভিউ)
- Sales & Profit (মোট বিক্রি, নিট লাভ, সেলস রিপোর্ট)
- Profile & Settings (প্রোফাইল, শপ নেম, পাসওয়ার্ড)
- Notifications & Support Tickets (সহযোগিতা, টিকিট, টেলিগ্রাম, লার্নিং ভিডিও)
- Mobile Recharge (মোবাইল রিচার্জ: জিপি, রবি, বাংলালিংক, এয়ারটেল, টেলিটক - প্রিপেইড/পোস্টপেইড)
- Withdraw & Withdraw History (টাকা উত্তোলন, বিকাশ/নগদ/রকেট/ব্যাংক)
- Logout (লগআউট)
- Admin Panel / User Manager / Financial Transactions (যদি role === 'admin' হয়)

ACTION CONFIRMATION RULES (CRITICAL):
- Reading Information (Balance, Orders list, Product details, Sales, Profile view, Navigation): NO confirmation required. Provide the info immediately.
- Actions requiring explicit user confirmation BEFORE executing:
  1. LOGOUT
  2. MOBILE_RECHARGE
  3. WITHDRAW
  4. DELETE / MARK_STOCKOUT
  5. UPDATE_PROFILE
  6. SUBMIT_REQUEST / PAYMENT
  For these actions, you MUST issue a REQUIRE_CONFIRMATION action format:
  \`\`\`json
  {
    "action": "REQUIRE_CONFIRMATION",
    "params": {
      "message": "আপনি কি নিশ্চিত যে আপনি... করতে চান?",
      "pendingAction": { "action": "ACTUAL_ACTION_NAME", "params": { ... } }
    }
  }
  \`\`\`

Available Actions in User Panel:
1. NAVIGATE: { "action": "NAVIGATE", "params": { "menu": "dashboard|profile|products|orders|cart|sales|balance|support|admin-panel|admin-users|admin-payouts" } }
2. SEARCH_TEXT: { "action": "SEARCH_TEXT", "params": { "query": "shirt or SKU-123", "filter": "available|stockout|all" } }
3. SEARCH_ORDER: { "action": "SEARCH_ORDER", "params": { "query": "order_id or phone" } }
4. SEARCH_IMAGE: { "action": "SEARCH_IMAGE", "params": {} }
5. LOGOUT: { "action": "LOGOUT", "params": {} }
6. MOBILE_RECHARGE: { "action": "MOBILE_RECHARGE", "params": { "number": "017...", "amount": 100, "operator": "GP|Robi|Banglalink|Airtel|Teletalk", "type": "Prepaid|Postpaid" } }
7. WITHDRAW: { "action": "WITHDRAW", "params": { "amount": 500, "method": "bKash|Nagad|Rocket|Bank", "account": "017..." } }
8. UPDATE_PROFILE: { "action": "UPDATE_PROFILE", "params": { "shopName": "..." } }
9. REQUIRE_CONFIRMATION: { "action": "REQUIRE_CONFIRMATION", "params": { "message": "...", "pendingAction": { ... } } }

GENERAL BEHAVIOR:
- When user asks "আমার ব্যালেন্স কত?" or "Show my balance", state their balance directly: ৳${context?.balance || 0} and offer to open Balance Statement.
- When user asks "আমার শেষ অর্ডার" or "Order tracking", list their latest order ID, customer name, status, and profit directly from CONTEXT.
- Answer clearly in natural Bengali or English based on user query language.
- Format action block at the end of response inside a \`\`\`json ... \`\`\` block.
`;
    }

    let contentsPayload: any = [];

    if (Array.isArray(history) && history.length > 0) {
      // Map prior chat turns (max last 10 messages for speed & context efficiency)
      const pastMessages = history.slice(-10);
      for (const msg of pastMessages) {
        if (!msg.text) continue;
        contentsPayload.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    }

    // Append current user message turn
    if (imageBase64) {
      const mimeType = imageBase64.startsWith("data:")
        ? imageBase64.substring(5, imageBase64.indexOf(";"))
        : "image/jpeg";
      const cleanData = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      contentsPayload.push({
        role: "user",
        parts: [
          { inlineData: { mimeType, data: cleanData } },
          { text: message || "এই প্রোডাক্ট বা ছবি সম্পর্কিত তথ্য দিন এবং ক্যাটালগে খুঁজুন।" },
        ],
      });
    } else {
      contentsPayload.push({
        role: "user",
        parts: [{ text: message || "Hello" }],
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contentsPayload,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
        },
      });

      let reply = response.text || "";
      let action = null;

      // Extract JSON action block if present
      const jsonMatch = reply.match(/\`\`\`json\s*(\{[\s\S]*?\})\s*\`\`\`/);
      if (jsonMatch) {
        try {
          action = JSON.parse(jsonMatch[1]);
          reply = reply.replace(jsonMatch[0], "").trim();
        } catch (e) {
          console.error("Failed to parse action JSON:", e);
        }
      }

      return res.json({
        success: true,
        mode,
        reply,
        action,
      });
    } catch (genAiError: any) {
      console.warn("Gemini API call failed, using rule-based engine fallback:", genAiError?.message);
      const fallback = generateRuleBasedFallback(message, userIsLoggedIn, context);
      return res.json({
        success: true,
        mode,
        reply: fallback.reply,
        action: fallback.action,
      });
    }
  } catch (err: any) {
    console.error("AI Assistant API Error:", err);
    return res.status(200).json({
      success: true,
      reply: "আমি Bexo AI Assistant। আপনাকে সহায়তা করার জন্য প্রস্তুত। যেকোনো প্রশ্ন করতে পারেন।",
      action: null,
    });
  }
}


