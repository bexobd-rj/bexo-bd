import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  User, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ShieldCheck, 
  HelpCircle,
  RefreshCw,
  Maximize2,
  Minimize2,
  History,
  Plus,
  Search,
  Edit2,
  Trash2,
  Archive,
  ArchiveRestore,
  MessageSquare,
  Check,
  FolderArchive,
  Menu,
  MoreVertical,
  LogOut
} from "lucide-react";
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  setDoc,
  serverTimestamp,
  getDocs
} from "firebase/firestore";

export interface AIAssistantProps {
  isLoggedIn: boolean;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  balance?: number;
  activeView?: string;
  orders?: any[];
  products?: any[];
  cart?: any[];
  onNavigate?: (menuKey: string) => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  onSearchText?: (query: string) => void;
  onSearchOrder?: (query: string) => void;
  onLogout?: () => void;
  onRechargeAction?: (params: any) => void;
  onWithdrawAction?: (params: any) => void;
}

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  action?: any;
  image?: string;
  pendingConfirmation?: {
    message: string;
    pendingAction: any;
  };
  confirmedState?: "confirmed" | "cancelled" | null;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  archived?: boolean;
}

// Smart Title Generator
function generateSmartTitle(firstQuery: string): string {
  const query = (firstQuery || "").toLowerCase().trim();
  if (query.includes("অর্ডার") || query.includes("order") || query.includes("ট্র্যাক") || query.includes("স্ট্যাটাস")) {
    return "Order Tracking";
  }
  if (query.includes("প্রোডাক্ট") || query.includes("সামান") || query.includes("product") || query.includes("খুঁজে") || query.includes("সার্চ")) {
    return "Product Search";
  }
  if (query.includes("ব্যালেন্স") || query.includes("টাকা") || query.includes("balance") || query.includes("ওয়ালেট")) {
    return "Balance & Wallet";
  }
  if (query.includes("রিচার্জ") || query.includes("recharge")) {
    return "Mobile Recharge";
  }
  if (query.includes("ইনভয়েস") || query.includes("invoice")) {
    return "Invoice Lookup";
  }
  if (query.includes("সেলস") || query.includes("লাভ") || query.includes("profit") || query.includes("sales")) {
    return "Sales & Profit";
  }
  if (query.includes("লগইন") || query.includes("রেজিস্টার") || query.includes("অ্যাকাউন্ট") || query.includes("খুলব")) {
    return "Account Setup";
  }
  if (query.includes("উইথড্র") || query.includes("withdraw") || query.includes("ক্যাশ আউট")) {
    return "Withdrawal Support";
  }
  if (query.length > 0) {
    return firstQuery.length > 22 ? firstQuery.substring(0, 22) + "..." : firstQuery;
  }
  return "New Conversation";
}

function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "এইমাত্র";
    if (diffMins < 60) return `${diffMins} মি আগে`;
    if (diffHours < 24) return `${diffHours} ঘ আগে`;
    if (diffDays === 1) return "গতকাল";
    if (diffDays < 7) return `${diffDays} দিন আগে`;

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch (e) {
    return "পূর্বে";
  }
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  isLoggedIn,
  userId = "",
  userName = "Reseller",
  userEmail = "",
  userRole = "reseller",
  balance = 0,
  activeView = "dashboard",
  orders = [],
  products = [],
  cart = [],
  onNavigate,
  onOpenLogin,
  onOpenRegister,
  onSearchText,
  onSearchOrder,
  onLogout,
  onRechargeAction,
  onWithdrawAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState<"recent" | "archived">("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState("");

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = isLoggedIn ? (userId || userEmail || userName || "reseller_user") : "public_user";
  const getStorageKey = (uid: string) => `bexo_ai_chat_sessions_${uid}`;

  // Initial default welcome messages
  const createWelcomeMessages = (): Message[] => [
    {
      id: "welcome-1",
      sender: "ai",
      text: isLoggedIn
        ? `স্বাগতম ${userName}! 👋\nআপনার বর্তমান ওয়ালেট ব্যালেন্স: ৳${balance}।\nআমি আপনার রিসেলার AI সহকারী। আপনার ওয়ালেট ব্যালেন্স, সর্বশেষ অর্ডার স্ট্যাটাস, মোবাইল রিচার্জ বা প্রোডাক্ট সার্চে কীভাবে সাহায্য করতে পারি?`
        : `স্বাগতম Bexo BD-এ! 🚀\nআমি Bexo Public AI Assistant। আমাদের ড্রপশিপিং প্ল্যাটফর্ম, ফ্রি অ্যাকাউন্ট খোলার নিয়ম, সার্ভিস ও ডেলিভারি চার্জ সম্পর্কে প্রশ্ন করতে পারেন।`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ];

  const createDefaultSession = (uid: string): ChatSession => ({
    id: `chat_${Date.now()}`,
    userId: uid,
    title: "New Conversation",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: createWelcomeMessages(),
    archived: false,
  });

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize or load sessions
  useEffect(() => {
    // Force LocalStorage for all users to resolve quota issues
    try {
      const stored = localStorage.getItem(getStorageKey(currentUserId));
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChatSessions(parsed);
          const active = parsed.find((s) => !s.archived) || parsed[0];
          setActiveChatId(active.id);
          setMessages(active.messages || createWelcomeMessages());
          return;
        }
      }
    } catch (e) {}
    
    const newSession = createDefaultSession(currentUserId);
    setChatSessions([newSession]);
    setActiveChatId(newSession.id);
    setMessages(newSession.messages);
  }, [currentUserId]);

  // Handle Logout / Separation
  useEffect(() => {
    if (!isLoggedIn) {
      setChatSessions([]);
      setActiveChatId("");
      setMessages([]);
      setIsHistoryOpen(false);
      setIsMenuOpen(false);
    }
  }, [isLoggedIn]);

    // Sync state to Storage (LocalStorage for all users to resolve quota issues)
  const saveSessionsToStorage = async (updatedSessions: ChatSession[]) => {
    setChatSessions(updatedSessions);
    try {
      localStorage.setItem(getStorageKey(currentUserId), JSON.stringify(updatedSessions));
    } catch (e) {
      console.error("Error saving chat sessions to localStorage:", e);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen && !isHistoryOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading, isHistoryOpen]);

  const executeAction = (action: any) => {
    if (!action || !action.action) return;

    const actionName = action.action;
    const params = action.params || {};

    switch (actionName) {
      case "NAVIGATE":
        if (params.menu && onNavigate) {
          onNavigate(params.menu);
        }
        break;
      case "OPEN_LOGIN":
        if (onOpenLogin) onOpenLogin();
        break;
      case "OPEN_REGISTER":
        if (onOpenRegister) onOpenRegister();
        break;
      case "SEARCH_TEXT":
        if (params.query && onSearchText) {
          onSearchText(params.query);
        } else if (onNavigate) {
          onNavigate("products");
        }
        break;
      case "SEARCH_ORDER":
        if (params.query && onSearchOrder) {
          onSearchOrder(params.query);
        } else if (onNavigate) {
          onNavigate("orders");
        }
        break;
      case "LOGOUT":
        if (onLogout) onLogout();
        break;
      case "MOBILE_RECHARGE":
        if (onRechargeAction) {
          onRechargeAction(params);
        } else if (onNavigate) {
          onNavigate("recharge");
        }
        break;
      case "WITHDRAW":
        if (onWithdrawAction) {
          onWithdrawAction(params);
        } else if (onNavigate) {
          onNavigate("balance");
        }
        break;
      case "VIEW_PUBLIC_PRODUCTS":
        if (onNavigate) onNavigate("products");
        break;
      default:
        console.log("Unhandled AI action:", action);
    }
  };

  // 1. Create New Chat
  const handleCreateNewChat = async () => {
    const newSession = createDefaultSession(currentUserId);
    const updated = [newSession, ...chatSessions];
    saveSessionsToStorage(updated);
    setActiveChatId(newSession.id);
    setMessages(newSession.messages);
    
    setIsHistoryOpen(false);
    setIsMenuOpen(false);
  };

  // 2. Select Chat
  const handleSelectChat = (chatId: string) => {
    const selected = chatSessions.find((s) => s.id === chatId);
    if (selected) {
      setActiveChatId(selected.id);
      setMessages(selected.messages || createWelcomeMessages());
      setIsHistoryOpen(false);
      setIsMenuOpen(false);
    }
  };

  // 3. Rename Chat
  const handleStartRename = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingChatId(session.id);
    setEditingTitleText(session.title);
  };

  const handleSaveRename = async (chatId: string) => {
    if (!editingTitleText.trim()) {
      setEditingChatId(null);
      return;
    }
    
    const updated = chatSessions.map((s) =>
      s.id === chatId ? { ...s, title: editingTitleText.trim(), updatedAt: new Date().toISOString() } : s
    );
    saveSessionsToStorage(updated);
    
    setEditingChatId(null);
  };

  // 4. Archive / Unarchive Chat
  const handleToggleArchive = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    const session = chatSessions.find(s => s.id === chatId);
    if (!session) return;

    const updated = chatSessions.map((s) =>
      s.id === chatId ? { ...s, archived: !s.archived, updatedAt: new Date().toISOString() } : s
    );
    saveSessionsToStorage(updated);
  };

  // 5. Delete Chat
  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!window.confirm("আপনি কি এই চ্যাট হিস্ট্রিটি মুছে ফেলতে চান?")) return;

    const remaining = chatSessions.filter((s) => s.id !== chatId);
    if (remaining.length === 0) {
      const fresh = createDefaultSession(currentUserId);
      saveSessionsToStorage([fresh]);
      setActiveChatId(fresh.id);
      setMessages(fresh.messages);
    } else {
      saveSessionsToStorage(remaining);
      if (activeChatId === chatId) {
        const nextActive = remaining[0];
        setActiveChatId(nextActive.id);
        setMessages(nextActive.messages);
      }
    }
  };

  // 6. Clear All Chats
  const handleClearAllChats = async () => {
    if (!window.confirm("আপনার সকল চ্যাট হিস্ট্রি মুছে ফেলা হবে। আপনি কি নিশ্চিত?")) return;
    
    const fresh = createDefaultSession(currentUserId);
    saveSessionsToStorage([fresh]);
    setActiveChatId(fresh.id);
    setMessages(fresh.messages);
    setIsHistoryOpen(false);
  };

  // 7. Send Message & Smart AI Memory
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text && !selectedImage) return;

    setErrorMessage(null);
    const userMsgId = `user-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMessageObj: Message = {
      id: userMsgId,
      sender: "user",
      text: text || "uploaded image",
      image: selectedImage || undefined,
      timestamp: timeStr,
    };

    const updatedMessages = [...messages, userMessageObj];
    setMessages(updatedMessages);
    setInputMessage("");
    const imagePayload = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    // Auto Smart Title Generation on first query
    const currentSession = chatSessions.find((s) => s.id === activeChatId);
    let updatedTitle = currentSession?.title || "New Conversation";
    if (!currentSession || currentSession.title === "New Conversation" || currentSession.title === "নতুন কথোপকথন") {
      updatedTitle = generateSmartTitle(text);
    }

    // Update active session locally
    const intermediateSessions = chatSessions.map((s) =>
      s.id === activeChatId
        ? {
            ...s,
            title: updatedTitle,
            updatedAt: new Date().toISOString(),
            messages: updatedMessages,
          }
        : s
    );
    saveSessionsToStorage(intermediateSessions);

    try {
      const activeOrdersCount = orders.filter((o) => o.status === "pending" || o.status === "processing").length;
      const stockoutCount = products.filter((p) => p.stockStatus === "out_of_stock" || p.stock === 0).length;

      // Extract conversation history turns for AI Memory
      const historyPayload = messages
        .filter((m) => m.text)
        .slice(-10)
        .map((m) => ({
          sender: m.sender,
          text: m.text,
        }));

      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          isLoggedIn,
          imageBase64: imagePayload,
          history: historyPayload,
          context: {
            userName,
            userEmail,
            userRole,
            balance,
            activeView,
            ordersCount: orders.length,
            activeOrdersCount,
            productsCount: products.length,
            stockoutCount,
            totalDelivered: orders.filter(o => o.status === 'Delivered' || o.status === 'Delivery Completed' || o.status === 'Completed').length,
            totalProfit: orders.filter(o => o.status === 'Delivered' || o.status === 'Delivery Completed' || o.status === 'Completed').reduce((sum, o) => sum + (Number(o.netProfit) || 0), 0),
            recentOrder: orders.length > 0 ? {
              id: orders[0].id,
              customerName: orders[0].customerName,
              status: orders[0].status,
              netProfit: orders[0].netProfit,
            } : null,
          },
        }),
      });

      setIsLoading(false);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server response status ${res.status}`);
      }

      const data = await res.json();
      let aiMsg: Message;

      if (data.action && data.action.action === "REQUIRE_CONFIRMATION") {
        aiMsg = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: data.reply || "নিচের অ্যাকশনটি সম্পন্ন করতে আপনার কনফার্মেশন প্রয়োজন:",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          pendingConfirmation: {
            message: data.action.params?.message || "আপনি কি নিশ্চিত?",
            pendingAction: data.action.params?.pendingAction,
          },
        };
      } else {
        aiMsg = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: data.reply || "ধন্যবাদ! আর কোনো প্রশ্ন আছে?",
          action: data.action,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        if (data.action && data.action.action !== "REQUIRE_CONFIRMATION") {
          executeAction(data.action);
        }
      }

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);

      // Save complete session with AI response
      const finalSessions = chatSessions.map((s) =>
        s.id === activeChatId
          ? {
              ...s,
              title: updatedTitle,
              updatedAt: new Date().toISOString(),
              messages: finalMessages,
            }
          : s
      );
      saveSessionsToStorage(finalSessions);

    } catch (err: any) {
      setIsLoading(false);
      console.error("Error communicating with AI Assistant:", err);
      setErrorMessage(err.message || "সংযোগ স্থাপন সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
      const errAiMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: "ai",
        text: `দুঃখিত, কোনো একটি নেটওয়ার্ক বা সার্ভার সমস্যা হয়েছে (${err.message || "Network Error"})। আবার চেষ্টা করুন।`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      const finalMessages = [...updatedMessages, errAiMsg];
      setMessages(finalMessages);

      const finalSessions = chatSessions.map((s) =>
        s.id === activeChatId ? { ...s, updatedAt: new Date().toISOString(), messages: finalMessages } : s
      );
      saveSessionsToStorage(finalSessions);
    }
  };

  const handleConfirmation = (msgId: string, isConfirmed: boolean, pendingAction: any) => {
    const updatedMsgs = messages.map((msg) =>
      msg.id === msgId
        ? {
            ...msg,
            confirmedState: (isConfirmed ? "confirmed" : "cancelled") as "confirmed" | "cancelled",
          }
        : msg
    );

    let nextMsgs = [...updatedMsgs];

    if (isConfirmed && pendingAction) {
      executeAction(pendingAction);
      nextMsgs.push({
        id: `ai-conf-${Date.now()}`,
        sender: "ai",
        text: "✅ আপনার অনুরোধটি সফলভাবে সম্পন্ন করা হয়েছে।",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    } else {
      nextMsgs.push({
        id: `ai-canc-${Date.now()}`,
        sender: "ai",
        text: "❌ অ্যাকশনটি বাতিল করা হলো।",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }

    setMessages(nextMsgs);

    const updatedSessions = chatSessions.map((s) =>
      s.id === activeChatId ? { ...s, updatedAt: new Date().toISOString(), messages: nextMsgs } : s
    );
    saveSessionsToStorage(updatedSessions);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setSelectedImage(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const isActuallyLoggedIn = isLoggedIn === true && userId !== "public_user";
  const suggestionChips = isActuallyLoggedIn
    ? [
        "💰 ব্যালেন্স কত?",
        "📦 আমার শেষ অর্ডার",
        "📱 মোবাইল রিচার্জ",
        "📊 সেলস ও লাভ",
        "🔍 টি-শার্ট খুঁজুন",
      ]
    : [
        "❓ Bexo BD কি?",
        "🚀 কিভাবে ইনকাম করব?",
        "🚚 ডেলিভারি চার্জ কত?",
        "🔐 লগইন করতে চাই",
        "📝 অ্যাকাউন্ট খুলব",
      ];
  
  console.log("DEBUG: AIAssistant - isLoggedIn:", isLoggedIn, "userId:", userId, "isActuallyLoggedIn:", isActuallyLoggedIn, "suggestionChips:", suggestionChips);

  const currentSessionObj = chatSessions.find((s) => s.id === activeChatId);

  const filteredSessions = chatSessions.filter((session) => {
    const matchesTab = historyTab === "archived" ? Boolean(session.archived) : !session.archived;
    if (!matchesTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = session.title.toLowerCase().includes(q);
    const msgMatch = session.messages.some((m) => m.text.toLowerCase().includes(q));
    return titleMatch || msgMatch;
  });

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          id="ai-assistant-trigger"
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-primary text-white px-5 py-3.5 rounded-full shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer border border-white/20"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
            <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-black tracking-wide leading-none">Bexo AI</p>
            <p className="text-[10px] text-blue-100 font-bold leading-tight mt-0.5">
              {isLoggedIn ? "সহকারী রেডি" : "পাবলিক হেল্প"}
            </p>
          </div>
        </button>
      )}

      {/* Main AI Assistant Dialog Window */}
      {isOpen && (
        <div
          id="ai-assistant-modal"
          className={`fixed z-[105] transition-all duration-300 font-sans flex flex-col bg-white border border-slate-200 shadow-2xl overflow-hidden ${
            isMinimized
              ? "bottom-6 right-6 w-80 h-16 rounded-2xl"
              : "bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[440px] h-[100vh] sm:h-[640px] sm:rounded-3xl"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white shadow-md relative z-20 select-none shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600/50 border border-indigo-400/30 shrink-0">
                <Bot size={18} className="text-white" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate">
                  <h3 className="font-extrabold text-xs sm:text-sm tracking-tight text-white truncate">
                    {isLoggedIn ? "Bexo Reseller AI" : "Bexo Public AI"}
                  </h3>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider shrink-0 ${
                    isLoggedIn ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  }`}>
                    {isLoggedIn ? "Reseller" : "Public"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 truncate font-medium">
                  {currentSessionObj?.title && currentSessionObj.title !== "New Conversation" && currentSessionObj.title !== "নতুন কথোপকথন"
                    ? currentSessionObj.title
                    : isLoggedIn
                    ? `ব্যালেন্স: ৳${balance}`
                    : "পাবলিক হেল্প সেন্টারে আছেন"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 relative">
              {/* New Chat Quick Button */}
              <button
                type="button"
                onClick={handleCreateNewChat}
                className="p-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg transition-all cursor-pointer flex items-center justify-center shadow-sm"
                title="নতুন চ্যাট শুরু করুন (New Chat)"
              >
                <Plus size={16} />
              </button>

              {/* Quick History Button */}
              <button
                type="button"
                onClick={() => {
                  setIsHistoryOpen(!isHistoryOpen);
                  setIsMenuOpen(false);
                }}
                className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center text-xs font-bold ${
                  isHistoryOpen
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white/10 hover:bg-white/20 text-slate-200"
                }`}
                title="চ্যাট হিস্ট্রি খুলুন (Chat History)"
              >
                <History size={16} />
              </button>

              {/* Three Dots (⋮ More Options) Menu Button */}
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center text-slate-200 ${
                  isMenuOpen ? "bg-white/25 text-white" : "hover:bg-white/10"
                }`}
                title="আরও অপশন (More Options & History)"
              >
                <MoreVertical size={18} />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsMenuOpen(false);
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Close AI Assistant"
              >
                <X size={18} />
              </button>

              {/* Three-Dots Floating Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute top-10 right-0 w-56 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-100 text-xs py-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>চ্যাট অপশনস (Options)</span>
                    <span className="text-indigo-400">{isLoggedIn ? "User Panel" : "Public"}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateNewChat}
                    className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/30 flex items-center gap-2.5 transition-colors cursor-pointer text-emerald-300 font-semibold"
                  >
                    <Plus size={15} />
                    <span>✨ নতুন চ্যাট শুরু করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsHistoryOpen(true);
                      setHistoryTab("recent");
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/30 flex items-center gap-2.5 transition-colors cursor-pointer text-slate-200"
                  >
                    <History size={15} className="text-indigo-400" />
                    <span>📜 চ্যাট হিস্ট্রি (History)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsHistoryOpen(true);
                      setHistoryTab("archived");
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/30 flex items-center gap-2.5 transition-colors cursor-pointer text-slate-200"
                  >
                    <FolderArchive size={15} className="text-amber-400" />
                    <span>📁 আর্কাইভড চ্যাট (Archived)</span>
                  </button>

                  <div className="my-1 border-t border-slate-800"></div>

                  <button
                    type="button"
                    onClick={handleClearAllChats}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-600/20 text-rose-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                    <span>🗑️ সকল ইতিহাস মুছুন</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {!isMinimized && (
            <div className="flex-1 relative overflow-hidden flex flex-col bg-slate-50">
              {/* CHAT HISTORY MANAGEMENT DRAWER / OVERLAY */}
              {isHistoryOpen && (
                <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-30 text-white flex flex-col p-4 animate-in fade-in slide-in-from-top-4 duration-200">
                  {/* History Drawer Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-indigo-400" />
                      <h4 className="font-black text-sm tracking-tight">চ্যাট হিস্ট্রি প্রসেসর</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsHistoryOpen(false)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Start New Chat Action Card */}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleCreateNewChat}
                      className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:opacity-95 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                      <Plus size={16} /> নতুন চ্যাট শুরু করুন (New Chat)
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="পূর্বের কথোপকথন খুঁজুন..."
                      className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Tabs: Recent vs Archived */}
                  <div className="flex border-b border-slate-800 mt-3 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setHistoryTab("recent")}
                      className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer ${
                        historyTab === "recent"
                          ? "border-indigo-500 text-indigo-400"
                          : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      সাম্প্রতিক চ্যাট ({chatSessions.filter((s) => !s.archived).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryTab("archived")}
                      className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer ${
                        historyTab === "archived"
                          ? "border-indigo-500 text-indigo-400"
                          : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      আর্কাইভড ({chatSessions.filter((s) => s.archived).length})
                    </button>
                  </div>

                  {/* Sessions List */}
                  <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1 custom-scrollbar">
                    {filteredSessions.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 text-xs">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        কোনো সংরক্ষিত চ্যাট পাওয়া যায়নি
                      </div>
                    ) : (
                      filteredSessions.map((session) => {
                        const isActive = session.id === activeChatId;
                        const lastMsg = session.messages[session.messages.length - 1];
                        const isEditingThis = editingChatId === session.id;

                        return (
                          <div
                            key={session.id}
                            onClick={() => handleSelectChat(session.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer group relative ${
                              isActive
                                ? "bg-indigo-950/80 border-indigo-500 shadow-md"
                                : "bg-slate-800/50 hover:bg-slate-800 border-slate-700/60"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <MessageSquare
                                  className={`w-4 h-4 shrink-0 ${
                                    isActive ? "text-indigo-400" : "text-slate-400"
                                  }`}
                                />

                                {isEditingThis ? (
                                  <div
                                    className="flex items-center gap-1 flex-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="text"
                                      value={editingTitleText}
                                      onChange={(e) => setEditingTitleText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveRename(session.id);
                                      }}
                                      autoFocus
                                      className="bg-slate-900 border border-indigo-500 rounded px-2 py-0.5 text-xs text-white flex-1 focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveRename(session.id)}
                                      className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                                    >
                                      <Check size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <h5 className="font-bold text-xs text-slate-100 truncate flex-1">
                                    {session.title}
                                  </h5>
                                )}
                              </div>

                              {/* Relative Date Tag */}
                              <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                {formatRelativeTime(session.updatedAt)}
                              </span>
                            </div>

                            {/* Message Snippet */}
                            <p className="text-[11px] text-slate-400 truncate mt-1 pl-6">
                              {lastMsg ? lastMsg.text : "খালি চ্যাট"}
                            </p>

                            {/* Hover Quick Actions */}
                            {!isEditingThis && (
                              <div className="flex items-center gap-1.5 mt-2 justify-end opacity-80 group-hover:opacity-100 transition-opacity pt-1 border-t border-slate-700/40">
                                <button
                                  type="button"
                                  onClick={(e) => handleStartRename(e, session)}
                                  className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors"
                                  title="নাম পরিবর্তন করুন (Rename)"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleArchive(e, session.id)}
                                  className="p-1 hover:bg-slate-700 text-slate-400 hover:text-indigo-300 rounded transition-colors"
                                  title={session.archived ? "আনআর্কাইভ করুন" : "আর্কাইভ করুন (Archive)"}
                                >
                                  {session.archived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteChat(e, session.id)}
                                  className="p-1 hover:bg-red-950/50 text-slate-400 hover:text-red-400 rounded transition-colors"
                                  title="মুছে ফেলুন (Delete)"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Clear All Footer */}
                  <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      মোট сохранен চ্যাট: {chatSessions.length} টি
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAllChats}
                      className="text-red-400 hover:text-red-300 font-bold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 size={12} /> সকল চ্যাট মুছুন
                    </button>
                  </div>
                </div>
              )}

              {/* Message List Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 custom-scrollbar relative">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-start gap-2.5`}
                  >
                    {msg.sender === "ai" && (
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 mt-1 shadow-sm">
                        <Bot size={14} />
                      </div>
                    )}

                    <div
                      className={`max-w-[82%] rounded-2xl p-3.5 shadow-sm text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                      }`}
                    >
                      {msg.image && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-slate-200">
                          <img src={msg.image} alt="User attachment" className="w-full max-h-40 object-cover" />
                        </div>
                      )}

                      <p className="whitespace-pre-wrap font-medium">{msg.text}</p>

                      {/* Confirmation Block */}
                      {msg.pendingConfirmation && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 bg-orange-50/80 p-3 rounded-xl border border-orange-200">
                          <p className="font-bold text-slate-800 text-[11px] mb-2 flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4 text-orange-600 shrink-0" />
                            {msg.pendingConfirmation.message}
                          </p>

                          {msg.confirmedState === "confirmed" ? (
                            <p className="text-emerald-700 font-extrabold text-[11px] flex items-center gap-1">
                              <CheckCircle2 size={14} /> কনফার্ম করা হয়েছে
                            </p>
                          ) : msg.confirmedState === "cancelled" ? (
                            <p className="text-slate-500 font-extrabold text-[11px] flex items-center gap-1">
                              <XCircle size={14} /> বাতিল করা হয়েছে
                            </p>
                          ) : (
                            <div className="flex gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleConfirmation(msg.id, true, msg.pendingConfirmation?.pendingAction)
                                }
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-[11px] transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1"
                              >
                                <CheckCircle2 size={13} /> হ্যাঁ, নিশ্চিত করুন
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleConfirmation(msg.id, false, msg.pendingConfirmation?.pendingAction)
                                }
                                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1.5 px-3 rounded-lg text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                              >
                                <XCircle size={13} /> বাতিল
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <span
                        className={`block text-[9px] mt-1 text-right font-medium ${
                          msg.sender === "user" ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.sender === "user" && (
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs shrink-0 mt-1">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading Bubble */}
                {isLoading && (
                  <div className="flex justify-start items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-xs shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-[11px] text-slate-500 font-bold ml-1.5">উত্তর চিন্তা করা হচ্ছে...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestion Quick Chips */}
              <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-1" />
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    className="whitespace-nowrap px-3 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-600 text-[11px] font-extrabold rounded-full transition-all shadow-xs cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Form Bar */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                {selectedImage && (
                  <div className="mb-2 relative inline-block border rounded-xl overflow-hidden bg-slate-100 p-1">
                    <img src={selectedImage} alt="Attachment" className="h-14 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <label
                    htmlFor="ai-file-input"
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full cursor-pointer transition-colors shrink-0"
                    title="প্রোডাক্ট ফটো যোগ করুন (Visual Search)"
                  >
                    <ImageIcon size={18} />
                    <input
                      id="ai-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      isActuallyLoggedIn
                        ? "আপনার প্রশ্ন অথবা কি করতে চান লিখুন..."
                        : "Bexo BD সম্পর্কিত আপনার প্রশ্ন লিখুন..."
                    }
                    className="flex-1 bg-slate-100 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-full px-4 py-2.5 text-xs text-slate-800 focus:outline-none transition-all placeholder-slate-400 font-medium"
                  />

                  <button
                    type="submit"
                    disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
                    className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 transition-transform active:scale-95 disabled:opacity-40 disabled:scale-100 shadow-md cursor-pointer shrink-0"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AIAssistant;
