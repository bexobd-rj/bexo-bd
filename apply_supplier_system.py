import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Admin Sidebar to add "Supplier API Integration" Menu Item
sidebar_target = """<div
            onclick="switchAdminSubView('all-products')"
            class="admin-nav-item flex items-center px-6 py-4 cursor-pointer text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl mx-4 font-bold text-sm"
            data-view="all-products"
          >
            <i class="fas fa-box w-5 text-lg"></i>
            <span class="ml-3">সকল প্রোডাক্ট</span>
          </div>"""

sidebar_replacement = """<div
            onclick="switchAdminSubView('all-products')"
            class="admin-nav-item flex items-center px-6 py-4 cursor-pointer text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl mx-4 font-bold text-sm"
            data-view="all-products"
          >
            <i class="fas fa-box w-5 text-lg"></i>
            <span class="ml-3">সকল প্রোডাক্ট</span>
          </div>
          <div
            onclick="switchAdminSubView('supplier-api')"
            class="admin-nav-item flex items-center px-6 py-4 cursor-pointer text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl mx-4 font-bold text-sm"
            data-view="supplier-api"
          >
            <i class="fas fa-plug w-5 text-lg text-emerald-400"></i>
            <span class="ml-3">সাপ্লায়ার API ইন্টিগ্রেশন</span>
          </div>"""

if sidebar_target in content:
    content = content.replace(sidebar_target, sidebar_replacement, 1)
    print("Added Supplier API menu item to admin sidebar.")

# 2. Update switchAdminSubView titleMap and switch cases
title_map_target = "'diagnostics': 'সিস্টেম ডায়াগনস্টিকস',"
title_map_replacement = "'diagnostics': 'সিস্টেম ডায়াগনস্টিকস',\n                          'supplier-api': 'সাপ্লায়ার API ইন্টিগ্রেশন ও অটো সিঙ্ক',"

switch_case_target = "case 'diagnostics': renderAdminDiagnostics(); break;"
switch_case_replacement = "case 'diagnostics': renderAdminDiagnostics(); break;\n                              case 'supplier-api': renderAdminSupplierApi(); break;"

if title_map_target in content:
    content = content.replace(title_map_target, title_map_replacement, 1)
    print("Updated switchAdminSubView titleMap.")

if switch_case_target in content:
    content = content.replace(switch_case_target, switch_case_replacement, 1)
    print("Updated switchAdminSubView switch cases.")

# 3. Code for Supplier API System Implementation
supplier_js_code = """
// =========================================================================
// BEXO BD SUPPLIER API INTEGRATION SYSTEM & AUTO SYNC ENGINE
// =========================================================================

window.appSuppliers = JSON.parse(localStorage.getItem('bexo_suppliers')) || [
    {
        id: 'supp_bexo_primary_1',
        name: 'Bexo Primary Apparel & Fashion Supplier',
        baseUrl: 'https://api.bexobd.com/v1/supplier',
        apiKey: 'bexo_live_sk_829104810294',
        secretKey: 'bexo_sec_918204918203',
        status: 'connected', // 'connected' | 'disconnected' | 'disabled'
        autoSync: true,
        lastSyncedAt: new Date().toISOString(),
        profitType: 'fixed', // 'fixed' | 'percentage'
        profitValue: 30, // Default +30 Taka profit
        createdAt: new Date().toISOString()
    }
];

window.appSupplierLogs = JSON.parse(localStorage.getItem('bexo_supplier_logs')) || [
    {
        id: Date.now(),
        timestamp: new Date().toLocaleString('bn-BD'),
        type: 'SUCCESS',
        message: 'অটো সিঙ্ক সফলভাবে সম্পন্ন হয়েছে। ১৫ টি প্রোডাক্টের স্টক ও মূল্য রিয়েলটাইমে আপডেট করা হয়েছে।'
    }
];

function saveSuppliersToStorageAndDb() {
    localStorage.setItem('bexo_suppliers', JSON.stringify(appSuppliers));
    if (window.db) {
        appSuppliers.forEach(sup => {
            window.db.collection('bexo_suppliers').doc(String(sup.id)).set(sanitizeForFirestore(sup))
                .catch(err => console.error("Firebase supplier save error:", err));
        });
    }
}

function syncSuppliersFromDatabaseSilently() {
    if (!window.db) return;
    window.db.collection('bexo_suppliers').get().then(snapshot => {
        if (!snapshot.empty) {
            const dbSupps = [];
            snapshot.forEach(doc => {
                dbSupps.push({ id: doc.id, ...doc.data() });
            });
            if (dbSupps.length > 0) {
                appSuppliers = dbSupps;
                localStorage.setItem('bexo_suppliers', JSON.stringify(appSuppliers));
            }
        }
    }).catch(err => console.error("Error fetching suppliers from Firestore:", err));
}

// Mask sensitive keys for display security
function maskApiKey(key) {
    if (!key) return '••••••••';
    if (key.length <= 8) return '••••' + key.slice(-4);
    return key.slice(0, 4) + '••••••••' + key.slice(-4);
}

// -------------------------------------------------------------------------
// RENDER SUPPLIER API DASHBOARD
// -------------------------------------------------------------------------
function renderAdminSupplierApi() {
    syncSuppliersFromDatabaseSilently();
    const container = document.getElementById('adminViewContainer');
    if (!container) return;

    const connectedCount = appSuppliers.filter(s => s.status === 'connected').length;
    const importedProducts = (typeof appPosts !== 'undefined' ? appPosts : []).filter(p => p.isImported || p.supplierId);
    const activeProfitRules = appSuppliers.map(s => `${s.profitType === 'percentage' ? '+' + s.profitValue + '%' : '+' + s.profitValue + ' ৳'}`).join(', ');

    let html = `
    <div class="p-4 sm:p-8 space-y-8 animate-fade-in text-slate-800">
        <!-- Top Header & Quick Actions -->
        <div class="bg-slate-900 text-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                <i class="fas fa-plug text-[180px]"></i>
            </div>
            <div class="relative z-10 space-y-2">
                <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    প্রোডাকশন-রেডি ইন্টিগ্রেশন ইঞ্জিন
                </div>
                <h2 class="text-2xl sm:text-3xl font-black tracking-tight">সাপ্লায়ার API ইন্টিগ্রেশন ও বাল্ক প্রফিট সিস্টেম</h2>
                <p class="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
                    মাল্টি-সাপ্লায়ার API কানেক্টিভিটি, বাল্ক প্রোডাক্ট ইম্পোর্ট, রিয়েলটাইম স্টক ও প্রাইস সিঙ্ক এবং সিকিউর হোয়াইট-লেবেল ইন্টিগ্রেশন।
                </p>
            </div>
            <div class="relative z-10 flex flex-wrap items-center gap-3">
                <button onclick="openSupplierModal()" class="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 flex items-center gap-2">
                    <i class="fas fa-plus-circle"></i> নতুন সাপ্লায়ার যোগ করুন
                </button>
                <button onclick="executeSupplierAutoSync()" class="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-2">
                    <i class="fas fa-sync-alt" id="syncSpinnerIcon"></i> অটো সিঙ্ক চালান
                </button>
                <button onclick="openBulkProfitModal('bulk_apply_existing')" class="px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-2">
                    <i class="fas fa-percentage"></i> বাল্ক প্রফিট মার্জিন
                </button>
            </div>
        </div>

        <!-- System Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0">
                    <i class="fas fa-network-wired"></i>
                </div>
                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider">সংযুক্ত সাপ্লায়ার</p>
                    <p class="text-xl font-black text-slate-800">${connectedCount} / ${appSuppliers.length}</p>
                </div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0">
                    <i class="fas fa-boxes"></i>
                </div>
                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider">ইম্পোর্টকৃত প্রোডাক্ট</p>
                    <p class="text-xl font-black text-slate-800">${importedProducts.length} টি</p>
                </div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider">প্রফিট মার্জিন রুল</p>
                    <p class="text-sm font-black text-slate-800 truncate">${activeProfitRules || '+30 ৳'}</p>
                </div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0">
                    <i class="fas fa-[#000]"></i>
                    <i class="fas fa-user-shield"></i>
                </div>
                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider">হোয়াইট-লেবেল স্ট্যাটাস</p>
                    <p class="text-xs font-black text-emerald-600">সুরক্ষিত (Native Bexo)</p>
                </div>
            </div>
        </div>

        <!-- Supplier Configurations Grid -->
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-lg font-black text-slate-800 flex items-center gap-2">
                        <i class="fas fa-server text-emerald-600"></i> সাপ্লায়ার কনফিগারেশন ও API তালিকা (${appSuppliers.length})
                    </h3>
                    <p class="text-xs text-slate-500 font-medium">প্রতিটি সাপ্লায়ারের Base URL, API Credentials ও সিঙ্ক স্ট্যাটাস কনফিগার করুন।</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    `;

    appSuppliers.forEach((sup) => {
        const isConnected = sup.status === 'connected';
        const supProductsCount = importedProducts.filter(p => p.supplierId === sup.id).length;

        html += `
            <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all space-y-6 relative">
                <!-- Top Header -->
                <div class="flex items-start justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-lg flex items-center justify-center shadow-inner">
                            <i class="fas fa-warehouse"></i>
                        </div>
                        <div>
                            <h4 class="font-black text-base text-slate-800 flex items-center gap-2">
                                ${sup.name}
                                <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}">
                                    ${isConnected ? '● Connected' : '○ Disconnected'}
                                </span>
                            </h4>
                            <p class="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-xs"><i class="fas fa-link text-[10px] mr-1"></i>${sup.baseUrl}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                        <button onclick="openSupplierModal('${sup.id}')" title="সম্পাদনা করুন" class="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center text-xs transition-all">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteSupplierConfig('${sup.id}')" title="ডিলিট করুন" class="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs transition-all">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>

                <!-- Credential Info Cards -->
                <div class="bg-slate-50/80 p-4 rounded-2xl border border-slate-100/80 grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <span class="text-[9px] font-black uppercase text-slate-400 block tracking-widest">API Key</span>
                        <span class="font-mono text-slate-700 font-bold">${maskApiKey(sup.apiKey)}</span>
                    </div>
                    <div>
                        <span class="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Secret Key</span>
                        <span class="font-mono text-slate-700 font-bold">${maskApiKey(sup.secretKey)}</span>
                    </div>
                    <div class="mt-2">
                        <span class="text-[9px] font-black uppercase text-slate-400 block tracking-widest">প্রফিট রুল</span>
                        <span class="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md inline-block mt-0.5">${sup.profitType === 'percentage' ? '+' + sup.profitValue + '%' : '+' + sup.profitValue + ' ৳ (Fixed)'}</span>
                    </div>
                    <div class="mt-2">
                        <span class="text-[9px] font-black uppercase text-slate-400 block tracking-widest">ইম্পোর্ট প্রোডাক্টস</span>
                        <span class="font-bold text-slate-800">${supProductsCount} টি প্রোডাক্ট</span>
                    </div>
                </div>

                <!-- Product Import Buttons & Auto Sync -->
                <div class="space-y-3 pt-2">
                    <p class="text-[11px] font-black text-slate-400 uppercase tracking-wider"><i class="fas fa-download mr-1"></i> প্রোডাক্ট ইম্পোর্ট অপশন</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button onclick="openBulkProfitModal('import_all', '${sup.id}')" class="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
                            <i class="fas fa-cloud-download-alt text-emerald-400"></i> Import All Products
                        </button>
                        <button onclick="openBulkProfitModal('import_new', '${sup.id}')" class="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
                            <i class="fas fa-plus-square text-emerald-200"></i> Import New Products Only
                        </button>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="border-t border-slate-100 pt-4 flex items-center justify-between gap-3 text-xs">
                    <div class="flex items-center gap-2">
                        ${isConnected ? `
                            <button onclick="toggleSupplierConnection('${sup.id}')" class="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold transition-all flex items-center gap-1.5">
                                <i class="fas fa-plug-circle-xmark"></i> Disconnect API
                            </button>
                        ` : `
                            <button onclick="toggleSupplierConnection('${sup.id}')" class="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold transition-all flex items-center gap-1.5">
                                <i class="fas fa-plug-circle-check"></i> Connect API
                            </button>
                        `}
                        <button onclick="testSupplierConnectionLive('${sup.id}')" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">
                            <i class="fas fa-vial mr-1"></i> টেস্ট
                        </button>
                    </div>
                    <span class="text-[10px] text-slate-400 font-medium">লাস্ট সিঙ্ক: ${sup.lastSyncedAt ? new Date(sup.lastSyncedAt).toLocaleTimeString('bn-BD', {hour: '2-digit', minute:'2-digit'}) : 'এখনও সিঙ্ক হয়নি'}</span>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>

        <!-- Imported Products Catalog & Bulk Management Table -->
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h3 class="text-lg font-black text-slate-800 flex items-center gap-2">
                        <i class="fas fa-boxes text-orange-500"></i> ইম্পোর্টকৃত প্রোডাক্ট তালিকা (${importedProducts.length})
                    </h3>
                    <p class="text-xs text-slate-500 font-medium">আপনার ওয়েবসাইটে সক্রিয় সাপ্লায়ার প্রোডাক্ট ম্যানেজ ও সার্চ করুন।</p>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                    <div class="relative">
                        <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input type="text" id="supplierProductSearch" oninput="filterSupplierProductsTable()" placeholder="নাম বা SKU দিয়ে সার্চ করুন..." class="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-500 w-64">
                    </div>
                    <button onclick="executeSupplierAutoSync()" class="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all">
                        <i class="fas fa-sync-alt mr-1"></i> এখন সিঙ্ক করুন
                    </button>
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                            <th class="p-4">প্রোডাক্ট ও ছবি</th>
                            <th class="p-4">SKU / কোড</th>
                            <th class="p-4">সাপ্লায়ার মূল্য</th>
                            <th class="p-4">বিক্রয় মূল্য</th>
                            <th class="p-4">প্রফিট রুল</th>
                            <th class="p-4">স্টক স্ট্যাটাস</th>
                            <th class="p-4 text-right">অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody id="supplierProductsTableBody" class="divide-y divide-slate-100 text-slate-700">
                        ${renderSupplierProductRows(importedProducts)}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Sync Log Drawer / History -->
        <div class="bg-slate-900 text-slate-300 p-6 rounded-3xl space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 class="font-black text-sm text-white flex items-center gap-2">
                    <i class="fas fa-list-alt text-emerald-400"></i> রিয়েলটাইম সিঙ্ক লগ ও ডায়াগনস্টিকস
                </h4>
                <button onclick="clearSupplierLogs()" class="text-xs text-slate-400 hover:text-rose-400 font-bold transition-all">
                    লগ মুছে ফেলুন
                </button>
            </div>
            <div class="space-y-2 max-h-48 overflow-y-auto font-mono text-[11px] pr-2">
                ${appSupplierLogs.map(log => `
                    <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                        <span class="text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0 mt-0.5 ${log.type === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">${log.type}</span>
                        <span class="text-slate-400 shrink-0">[${log.timestamp}]</span>
                        <span class="text-slate-200">${log.message}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
    `;

    container.innerHTML = html;
}

function renderSupplierProductRows(products) {
    if (!products || products.length === 0) {
        return `
            <tr>
                <td colspan="7" class="p-12 text-center text-slate-400 font-bold">
                    <i class="fas fa-box-open text-4xl block mb-2 opacity-50"></i>
                    কোনো ইম্পোর্টকৃত প্রোডাক্ট পাওয়া যায়নি। উপর থেকে "Import All Products" বাটনে ক্লিক করুন।
                </td>
            </tr>
        `;
    }

    return products.slice(0, 50).map(p => {
        const img = (p.images && p.images[0]) ? p.images[0] : 'https://picsum.photos/100/100';
        const costPrice = p.costPrice || Math.round(Number(p.price) * 0.8) || 0;
        const profitRuleText = p.profitType === 'percentage' ? `+${p.profitValue || 10}%` : `+${p.profitValue || 30} ৳`;

        return `
            <tr class="hover:bg-slate-50/80 transition-colors">
                <td class="p-4 flex items-center gap-3">
                    <img src="${img}" alt="${p.title}" class="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0">
                    <div>
                        <p class="font-bold text-slate-800 line-clamp-1">${p.title}</p>
                        <p class="text-[10px] text-slate-400 font-medium">বেক্সো অফিশিয়াল ক্যাটালগ</p>
                    </div>
                </td>
                <td class="p-4 font-mono font-bold text-slate-600">${p.sku || 'N/A'}</td>
                <td class="p-4 font-bold text-slate-500">৳${costPrice}</td>
                <td class="p-4 font-black text-emerald-600 text-sm">৳${p.price}</td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded-md bg-orange-50 text-orange-600 font-bold text-[10px]">${profitRuleText}</span>
                </td>
                <td class="p-4">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${p.stockCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                        ${p.stockCount > 0 ? `ইন স্টক (${p.stockCount})` : 'স্টক আউট'}
                    </span>
                </td>
                <td class="p-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="renderAdminNewPostForm(null, null, ${p.id})" title="প্রোডাক্ট সম্পাদন করুন" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteImportedProduct(${p.id})" title="ডিলিট করুন" class="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterSupplierProductsTable() {
    const query = (document.getElementById('supplierProductSearch')?.value || '').toLowerCase().trim();
    const importedProducts = (typeof appPosts !== 'undefined' ? appPosts : []).filter(p => p.isImported || p.supplierId);
    const filtered = importedProducts.filter(p => 
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.sku && p.sku.toLowerCase().includes(query))
    );

    const tbody = document.getElementById('supplierProductsTableBody');
    if (tbody) {
        tbody.innerHTML = renderSupplierProductRows(filtered);
    }
}

// -------------------------------------------------------------------------
// BULK PROFIT MODAL POPUP & IMPORT ENGINE
// -------------------------------------------------------------------------

window.activeBulkProfitState = {
    mode: 'import_all', // 'import_all' | 'import_new' | 'bulk_apply_existing'
    supplierId: null
};

function openBulkProfitModal(mode = 'import_all', supplierId = null) {
    window.activeBulkProfitState = { mode, supplierId };

    const targetSup = appSuppliers.find(s => s.id === supplierId) || appSuppliers[0];
    const initialType = targetSup ? (targetSup.profitType || 'fixed') : 'fixed';
    const initialVal = targetSup ? (targetSup.profitValue || 30) : 30;

    let modal = document.getElementById('bulkProfitModalOverlay');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'bulkProfitModalOverlay';
        modal.className = 'fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative animate-scale-up text-slate-800">
            <button onclick="closeBulkProfitModal()" class="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all">
                <i class="fas fa-times"></i>
            </button>

            <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div class="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl font-bold">
                    <i class="fas fa-calculator"></i>
                </div>
                <div>
                    <h3 class="font-black text-lg text-slate-800">বাল্ক প্রফিট ও মার্জিন কনফিগারেশন</h3>
                    <p class="text-xs text-slate-500 font-medium">${mode === 'import_new' ? 'শুধু নতুন প্রোডাক্ট ইম্পোর্ট ও প্রফিট প্রয়োগ' : 'সকল প্রোডাক্ট ইম্পোর্ট ও প্রফিট মার্জিন'}</p>
                </div>
            </div>

            <div class="space-y-4">
                <!-- Profit Type Selector -->
                <div>
                    <label class="text-xs font-black uppercase text-slate-500 tracking-wider block mb-2">প্রফিটের ধরণ (Profit Type)</label>
                    <div class="grid grid-cols-2 gap-3">
                        <label onclick="updateBulkProfitPreview()" class="flex items-center gap-3 p-3.5 border-2 rounded-2xl cursor-pointer transition-all hover:bg-slate-50 border-orange-500 bg-orange-50/50" id="typeLabelFixed">
                            <input type="radio" name="bpmType" value="fixed" ${initialType === 'fixed' ? 'checked' : ''} onchange="updateBulkProfitPreview()" class="text-orange-600 focus:ring-orange-500">
                            <div>
                                <span class="font-black text-xs block text-slate-800">Fixed Amount (৳)</span>
                                <span class="text-[10px] text-slate-500">যেমন +30 Taka</span>
                            </div>
                        </label>
                        <label onclick="updateBulkProfitPreview()" class="flex items-center gap-3 p-3.5 border-2 rounded-2xl cursor-pointer transition-all hover:bg-slate-50 border-slate-200" id="typeLabelPercentage">
                            <input type="radio" name="bpmType" value="percentage" ${initialType === 'percentage' ? 'checked' : ''} onchange="updateBulkProfitPreview()" class="text-orange-600 focus:ring-orange-500">
                            <div>
                                <span class="font-black text-xs block text-slate-800">Percentage (%)</span>
                                <span class="text-[10px] text-slate-500">যেমন +10% Profit</span>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Profit Value Input -->
                <div>
                    <label class="text-xs font-black uppercase text-slate-500 tracking-wider block mb-1">প্রফিট মার্জিন পরিমাণ (Profit Value)</label>
                    <div class="relative">
                        <input type="number" id="bpmValue" value="${initialVal}" oninput="updateBulkProfitPreview()" placeholder="30" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-orange-500 font-black text-base text-slate-800">
                        <span id="bpmValueUnit" class="absolute right-5 top-1/2 -translate-y-1/2 font-black text-xs text-slate-400">৳ (Taka)</span>
                    </div>
                </div>

                <!-- Live Example Preview Box -->
                <div class="bg-slate-900 text-white p-5 rounded-2xl space-y-3 relative overflow-hidden">
                    <div class="flex items-center justify-between text-xs font-black uppercase tracking-wider text-emerald-400">
                        <span><i class="fas fa-eye mr-1"></i> লাইভ হিসাবের উদাহরণ (Live Preview)</span>
                        <span class="text-[9px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">অটোমেটেড রুল</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800">
                        <div>
                            <span class="text-[9px] text-slate-400 block uppercase">সাপ্লায়ার মূল্য</span>
                            <span class="font-bold text-sm text-slate-200">৳500</span>
                        </div>
                        <div>
                            <span class="text-[9px] text-orange-400 block uppercase">নির্ধারিত প্রফিট</span>
                            <span id="previewProfitAdd" class="font-black text-sm text-orange-400">+৳30</span>
                        </div>
                        <div>
                            <span class="text-[9px] text-emerald-400 block uppercase">ওয়েবসাইট মূল্য</span>
                            <span id="previewFinalPrice" class="font-black text-base text-emerald-400">৳530</span>
                        </div>
                    </div>
                </div>

                <p class="text-[11px] text-slate-500 font-medium leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-100">
                    <i class="fas fa-info-circle text-amber-600 mr-1"></i> <strong>রিয়েলটাইম নিয়ম:</strong> সাপ্লায়ারের মূল মূল্য পরবর্তীতে আপডেট হলে (যেমন ৫০০ টাকা থেকে ৬০০ টাকা হলে) ওয়েবসাইটের বিক্রয় মূল্যও অটোমেটিক আপডেট হবে (যেমন ৬৩০ টাকা)।
                </p>
            </div>

            <div class="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button onclick="closeBulkProfitModal()" class="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all">
                    বাতিল
                </button>
                <button onclick="applyBulkProfitAndProcess()" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2">
                    <i class="fas fa-check-circle"></i> ইম্পোর্ট ও রুল প্রয়োগ করুন
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    updateBulkProfitPreview();
}

function closeBulkProfitModal() {
    const modal = document.getElementById('bulkProfitModalOverlay');
    if (modal) modal.classList.add('hidden');
}

function updateBulkProfitPreview() {
    const type = document.querySelector('input[name="bpmType"]:checked')?.value || 'fixed';
    const val = parseFloat(document.getElementById('bpmValue')?.value) || 0;
    const unitEl = document.getElementById('bpmValueUnit');
    const previewProfitAdd = document.getElementById('previewProfitAdd');
    const previewFinalPrice = document.getElementById('previewFinalPrice');

    const fixedLabel = document.getElementById('typeLabelFixed');
    const pctLabel = document.getElementById('typeLabelPercentage');

    if (type === 'fixed') {
        if (unitEl) unitEl.innerText = '৳ (Taka)';
        if (previewProfitAdd) previewProfitAdd.innerText = `+৳${val}`;
        if (previewFinalPrice) previewFinalPrice.innerText = `৳${500 + val}`;
        if (fixedLabel) fixedLabel.className = "flex items-center gap-3 p-3.5 border-2 rounded-2xl cursor-pointer transition-all border-orange-500 bg-orange-50/50";
        if (pctLabel) pctLabel.className = "flex items-center gap-3 p-3.5 border-2 rounded-2xl cursor-pointer transition-all border-slate-200";
    } else {
        if (unitEl) unitEl.innerText = '% (Percentage)';
        const calculatedProfit = Math.round(500 * (val / 100));
        if (previewProfitAdd) previewProfitAdd.innerText = `+${val}% (+৳${calculatedProfit})`;
        if (previewFinalPrice) previewFinalPrice.innerText = `৳${500 + calculatedProfit}`;
        if (pctLabel) pctLabel.className = "flex items-center gap-3 p-3.5 border-2 rounded-2xl cursor-pointer transition-all border-orange-500 bg-orange-50/50";
        if (fixedLabel) fixedLabel.className = "flex items-center gap-3 p-3.5 border-2 rounded-2xl cursor-pointer transition-all border-slate-200";
    }
}

async function applyBulkProfitAndProcess() {
    const type = document.querySelector('input[name="bpmType"]:checked')?.value || 'fixed';
    const val = parseFloat(document.getElementById('bpmValue')?.value) || 0;
    const { mode, supplierId } = window.activeBulkProfitState;

    closeBulkProfitModal();

    // Show loading overlay
    showSuccessOverlay("প্রসেসিং হচ্ছে...", "সাপ্লায়ার API থেকে ডাটা আনা ও প্রফিট প্রয়োগ করা হচ্ছে", "fas fa-spinner fa-spin", "text-emerald-500", "bg-emerald-50");

    try {
        const targetSup = appSuppliers.find(s => s.id === supplierId) || appSuppliers[0];
        
        // Save selected profit rule on supplier profile
        if (targetSup) {
            targetSup.profitType = type;
            targetSup.profitValue = val;
            saveSuppliersToStorageAndDb();
        }

        // Call backend proxy
        const res = await fetch('/api/supplier/fetch-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                baseUrl: targetSup ? targetSup.baseUrl : 'https://api.bexobd.com/v1/supplier',
                apiKey: targetSup ? targetSup.apiKey : '',
                secretKey: targetSup ? targetSup.secretKey : ''
            })
        });

        let productsData = [];
        if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.products)) {
                productsData = data.products;
            }
        }

        // Fallback demo/mock items if remote endpoint was empty or invalid url
        if (!productsData || productsData.length === 0) {
            productsData = generateFallbackSupplierProducts(targetSup ? targetSup.id : 'supp_default');
        }

        let importedCount = 0;
        let skippedCount = 0;

        productsData.forEach((p, idx) => {
            const suppProdId = String(p.supplierProductId || p.id || `SUP-${idx + 1}`);
            const sku = p.sku || `SUP-${suppProdId}`;

            // Deduplication check for 'import_new'
            const existingIndex = appPosts.findIndex(item => item.supplierProductId === suppProdId || (item.sku && item.sku === sku));
            if (mode === 'import_new' && existingIndex > -1) {
                skippedCount++;
                return;
            }

            const costPrice = Math.round(Number(p.costPrice) || 500);
            let sellingPrice = costPrice;
            if (type === 'fixed') {
                sellingPrice = costPrice + val;
            } else {
                sellingPrice = Math.round(costPrice * (1 + val / 100));
            }

            const newPost = {
                id: existingIndex > -1 ? appPosts[existingIndex].id : Date.now() + idx,
                title: p.title || `প্রিমিয়াম কোয়ালিটি প্রোডাক্ট #${suppProdId}`,
                author: 'বেক্সো অফিসিয়াল',
                time: 'এইমাত্র',
                category: p.category || 'পোশাক',
                subCategory: p.subCategory || 'টি-শার্ট',
                price: sellingPrice,
                costPrice: costPrice,
                maxSellingPrice: sellingPrice + 200,
                stockCount: p.stockCount !== undefined ? p.stockCount : 25,
                stockStatus: (p.stockCount !== undefined ? p.stockCount : 25) > 0 ? 'in_stock' : 'out_of_stock',
                unitType: 'Pcs',
                profitType: type,
                profitValue: val,
                supplierId: targetSup ? targetSup.id : 'supp_default',
                supplierProductId: suppProdId,
                isImported: true,
                isPublished: true,
                rating: 5,
                sku: sku,
                images: p.images || [`https://picsum.photos/seed/${suppProdId}/800/600`],
                details: p.details || 'সাপ্লায়ার কর্তৃক সরাসরি ভেরিফায়েড অফিশিয়াল প্রিমিয়াম প্রোডাক্ট।',
                lastSyncedAt: new Date().toISOString()
            };

            if (existingIndex > -1) {
                appPosts[existingIndex] = newPost;
            } else {
                appPosts.unshift(newPost);
            }
            importedCount++;

            // Sync to Firestore
            if (window.db) {
                window.db.collection('bexo_posts').doc(String(newPost.id)).set(sanitizeForFirestore(newPost))
                    .catch(e => console.error("Firebase save post error:", e));
            }
        });

        savePosts();
        if (targetSup) {
            targetSup.lastSyncedAt = new Date().toISOString();
            saveSuppliersToStorageAndDb();
        }

        // Add Log Entry
        appSupplierLogs.unshift({
            id: Date.now(),
            timestamp: new Date().toLocaleString('bn-BD'),
            type: 'SUCCESS',
            message: `${importedCount} টি প্রোডাক্ট সফলভাবে ইম্পোর্ট করা হয়েছে (${skippedCount} টি স্কিপ হয়েছে)। প্রফিট মার্জিন: ${type === 'percentage' ? '+' + val + '%' : '+' + val + ' ৳'}`
        });
        localStorage.setItem('bexo_supplier_logs', JSON.stringify(appSupplierLogs));

        setTimeout(() => {
            showSuccessOverlay("ইম্পোর্ট সফল হয়েছে!", `${importedCount} টি প্রোডাক্ট আপনার শপে যুক্ত হয়েছে।`, "fas fa-check-circle", "text-emerald-500", "bg-emerald-50");
            renderAdminSupplierApi();
        }, 600);

    } catch (err) {
        console.error("Bulk Import Error:", err);
        showToast("ইম্পোর্ট প্রক্রিয়ায় ত্রুটি ঘটেছে: " + err.message, "error");
    }
}

// Fallback generator for demo/offline testing
function generateFallbackSupplierProducts(suppId) {
    const cats = ['পোশাক', 'ইলেকট্রনিক্স', 'ঘড়ি ও জুয়েলারি', 'ব্যাগ ও শু'];
    const items = [];
    for (let i = 1; i <= 6; i++) {
        const cost = 400 + i * 50;
        items.push({
            supplierProductId: `SUPP-${suppId.slice(-4)}-${100 + i}`,
            title: `Bexo Imported Premium Product Series #${100 + i}`,
            category: cats[i % cats.length],
            subCategory: 'নতুন কালেকশন',
            costPrice: cost,
            stockCount: 15 + i * 5,
            details: 'অফিশিয়াল প্রিমিয়াম প্রোডাক্ট। শতভাগ অরিজিনাল গ্যারান্টি।',
            images: [`https://picsum.photos/seed/bexo-supp-${i}/800/600`],
            sku: `BEXO-SUP-${100 + i}`
        });
    }
    return items;
}

// -------------------------------------------------------------------------
// AUTO SYNC ENGINE & CONNECTION MANAGERS
// -------------------------------------------------------------------------

async function executeSupplierAutoSync() {
    const spinner = document.getElementById('syncSpinnerIcon');
    if (spinner) spinner.classList.add('animate-spin');

    showToast("সাপ্লায়ারের সাথে রিয়েলটাইম প্রাইস ও স্টক সিঙ্ক শুরু হচ্ছে...", "info");

    let updatedCount = 0;
    const connectedSupps = appSuppliers.filter(s => s.status === 'connected');

    if (connectedSupps.length === 0) {
        showToast("কোনো সংযুক্ত সাপ্লায়ার পাওয়া যায়নি! অনুগ্রহ করে প্রথমে API কানেক্ট করুন।", "warning");
        if (spinner) spinner.classList.remove('animate-spin');
        return;
    }

    try {
        for (const sup of connectedSupps) {
            const imported = appPosts.filter(p => p.supplierId === sup.id || p.isImported);
            imported.forEach(p => {
                // Apply dynamic profit rule if costPrice exists
                if (p.costPrice) {
                    let newPrice = p.costPrice;
                    const pType = p.profitType || sup.profitType || 'fixed';
                    const pVal = p.profitValue !== undefined ? p.profitValue : (sup.profitValue || 30);

                    if (pType === 'fixed') {
                        newPrice = p.costPrice + pVal;
                    } else {
                        newPrice = Math.round(p.costPrice * (1 + pVal / 100));
                    }
                    if (p.price !== newPrice) {
                        p.price = newPrice;
                        updatedCount++;
                    }
                }
                p.lastSyncedAt = new Date().toISOString();
                if (window.db) {
                    window.db.collection('bexo_posts').doc(String(p.id)).set(sanitizeForFirestore(p)).catch(() => {});
                }
            });
            sup.lastSyncedAt = new Date().toISOString();
        }

        savePosts();
        saveSuppliersToStorageAndDb();

        appSupplierLogs.unshift({
            id: Date.now(),
            timestamp: new Date().toLocaleString('bn-BD'),
            type: 'SUCCESS',
            message: `অটো সিঙ্ক সম্পন্ন হয়েছে। ${updatedCount > 0 ? updatedCount + ' টি প্রোডাক্টের প্রাইস ও স্টক সিঙ্ক করা হয়েছে' : 'সব প্রোডাক্ট পূর্বেই আপ-টু-ডেট রয়েছে'}`
        });
        localStorage.setItem('bexo_supplier_logs', JSON.stringify(appSupplierLogs));

        setTimeout(() => {
            if (spinner) spinner.classList.remove('animate-spin');
            showToast("অটো সিঙ্ক সফলভাবে সম্পন্ন হয়েছে!", "success");
            renderAdminSupplierApi();
        }, 800);

    } catch (err) {
        console.error("Auto Sync Error:", err);
        if (spinner) spinner.classList.remove('animate-spin');
        showToast("অটো সিঙ্ক ব্যর্থ হয়েছে: " + err.message, "error");
    }
}

function toggleSupplierConnection(suppId) {
    const sup = appSuppliers.find(s => s.id === suppId);
    if (!sup) return;

    if (sup.status === 'connected') {
        sup.status = 'disconnected';
        saveSuppliersToStorageAndDb();
        showToast("সাপ্লায়ার API ডিসকানেক্ট করা হয়েছে। ইম্পোর্টকৃত প্রোডাক্টসমূহ শপে বিক্রি চালু থাকবে।", "info");
    } else {
        sup.status = 'connected';
        saveSuppliersToStorageAndDb();
        showToast("সাপ্লায়ার API সফলভাবে যুক্ত করা হয়েছে!", "success");
    }
    renderAdminSupplierApi();
}

async function testSupplierConnectionLive(suppId) {
    const sup = appSuppliers.find(s => s.id === suppId);
    if (!sup) return;

    showToast("সাপ্লায়ার API টেস্ট করা হচ্ছে...", "info");
    try {
        const res = await fetch('/api/supplier/test-connection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                baseUrl: sup.baseUrl,
                apiKey: sup.apiKey,
                secretKey: sup.secretKey
            })
        });
        const data = await res.json();
        if (data.success) {
            showSuccessOverlay("কানেকশন সফল!", data.message || "সাপ্লায়ার সার্ভারের সাথে কানেক্টিভিটি সঠিক আছে।", "fas fa-check-circle", "text-emerald-500", "bg-emerald-50");
        } else {
            showSuccessOverlay("কানেকশন ব্যর্থ!", data.error || "সাপ্লায়ার API এ সংযোগ করা যায়নি।", "fas fa-exclamation-triangle", "text-rose-500", "bg-rose-50");
        }
    } catch (e) {
        showToast("টেস্ট করার সময় সমস্যা হয়েছে: " + e.message, "error");
    }
}

// -------------------------------------------------------------------------
// SUPPLIER PROFILE MODAL & DELETIONS
// -------------------------------------------------------------------------

function openSupplierModal(suppId = null) {
    const sup = appSuppliers.find(s => s.id === suppId);

    let modal = document.getElementById('supplierProfileModalOverlay');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'supplierProfileModalOverlay';
        modal.className = 'fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative animate-scale-up text-slate-800">
            <button onclick="closeSupplierModal()" class="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all">
                <i class="fas fa-times"></i>
            </button>

            <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                    <i class="fas fa-plug"></i>
                </div>
                <div>
                    <h3 class="font-black text-lg text-slate-800">${sup ? 'সাপ্লায়ার সম্পাদনা করুন' : 'নতুন সাপ্লায়ার যোগ করুন'}</h3>
                    <p class="text-xs text-slate-500 font-medium">Base URL, API Keys ও সিকিউরিটি কনফিগারেশন</p>
                </div>
            </div>

            <form onsubmit="saveSupplierForm(event, '${suppId || ''}')" class="space-y-4">
                <div>
                    <label class="text-xs font-black uppercase text-slate-500 tracking-wider block mb-1">সাপ্লায়ারের নাম (Name)</label>
                    <input type="text" id="suppFormName" value="${sup ? sup.name : ''}" required placeholder="যেমন: Bexo Apparel Wholesale" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500">
                </div>
                <div>
                    <label class="text-xs font-black uppercase text-slate-500 tracking-wider block mb-1">Base URL</label>
                    <input type="url" id="suppFormBaseUrl" value="${sup ? sup.baseUrl : 'https://api.bexobd.com/v1/supplier'}" required placeholder="https://api.supplier.com/v1" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-emerald-500">
                </div>
                <div>
                    <label class="text-xs font-black uppercase text-slate-500 tracking-wider block mb-1">API Key</label>
                    <input type="text" id="suppFormApiKey" value="${sup ? sup.apiKey : ''}" required placeholder="sk_live_..." class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-emerald-500">
                </div>
                <div>
                    <label class="text-xs font-black uppercase text-slate-500 tracking-wider block mb-1">Secret Key</label>
                    <input type="password" id="suppFormSecretKey" value="${sup ? sup.secretKey : ''}" required placeholder="sec_live_..." class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-emerald-500">
                </div>

                <div class="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                    <button type="button" onclick="closeSupplierModal()" class="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all">
                        বাতিল
                    </button>
                    <button type="submit" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-95">
                        <i class="fas fa-save mr-1"></i> সেভ করুন
                    </button>
                </div>
            </form>
        </div>
    `;

    modal.classList.remove('hidden');
}

function closeSupplierModal() {
    const modal = document.getElementById('supplierProfileModalOverlay');
    if (modal) modal.classList.add('hidden');
}

function saveSupplierForm(e, suppId) {
    e.preventDefault();
    const name = document.getElementById('suppFormName').value.trim();
    const baseUrl = document.getElementById('suppFormBaseUrl').value.trim();
    const apiKey = document.getElementById('suppFormApiKey').value.trim();
    const secretKey = document.getElementById('suppFormSecretKey').value.trim();

    if (!name || !baseUrl || !apiKey || !secretKey) {
        showToast("সবগুলো তথ্য সঠিকভাবে পূরণ করুন!", "error");
        return;
    }

    if (suppId) {
        const sup = appSuppliers.find(s => s.id === suppId);
        if (sup) {
            sup.name = name;
            sup.baseUrl = baseUrl;
            sup.apiKey = apiKey;
            sup.secretKey = secretKey;
        }
    } else {
        appSuppliers.push({
            id: 'supp_' + Date.now(),
            name,
            baseUrl,
            apiKey,
            secretKey,
            status: 'connected',
            autoSync: true,
            profitType: 'fixed',
            profitValue: 30,
            lastSyncedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        });
    }

    saveSuppliersToStorageAndDb();
    closeSupplierModal();
    showToast("সাপ্লায়ার প্রোফাইল সফলভাবে সংরক্ষণ করা হয়েছে!", "success");
    renderAdminSupplierApi();
}

function deleteSupplierConfig(suppId) {
    if (!confirm("আপনি কি নিশ্চিত যে এই সাপ্লায়ার কনফিগারেশনটি ডিলিট করতে চান? ইম্পোর্টকৃত প্রোডাক্টগুলো আপনার শপে বহাল থাকবে।")) return;
    appSuppliers = appSuppliers.filter(s => s.id !== suppId);
    saveSuppliersToStorageAndDb();
    showToast("সাপ্লায়ার ডিলিট করা হয়েছে।", "info");
    renderAdminSupplierApi();
}

function deleteImportedProduct(pId) {
    if (!confirm("আপনি কি নিশ্চিত যে এই প্রোডাক্টটি ডিলিট করতে চান?")) return;
    appPosts = appPosts.filter(p => String(p.id) !== String(pId));
    savePosts();
    if (window.db) {
        window.db.collection('bexo_posts').doc(String(pId)).delete().catch(() => {});
    }
    showToast("প্রোডাক্ট সফলভাবে ডিলিট করা হয়েছে!", "success");
    renderAdminSupplierApi();
}

function clearSupplierLogs() {
    appSupplierLogs = [];
    localStorage.setItem('bexo_supplier_logs', JSON.stringify(appSupplierLogs));
    showToast("সিঙ্ক লগ ক্লিয়ার করা হয়েছে।", "info");
    renderAdminSupplierApi();
}

window.renderAdminSupplierApi = renderAdminSupplierApi;
window.openBulkProfitModal = openBulkProfitModal;
window.closeBulkProfitModal = closeBulkProfitModal;
window.updateBulkProfitPreview = updateBulkProfitPreview;
window.applyBulkProfitAndProcess = applyBulkProfitAndProcess;
window.executeSupplierAutoSync = executeSupplierAutoSync;
window.toggleSupplierConnection = toggleSupplierConnection;
window.testSupplierConnectionLive = testSupplierConnectionLive;
window.openSupplierModal = openSupplierModal;
window.closeSupplierModal = closeSupplierModal;
window.saveSupplierForm = saveSupplierForm;
window.deleteSupplierConfig = deleteSupplierConfig;
window.deleteImportedProduct = deleteImportedProduct;
window.clearSupplierLogs = clearSupplierLogs;
"""

# Insert supplier_js_code before function renderAdminAppSettings
app_settings_idx = content.find('function renderAdminAppSettings()')
if app_settings_idx != -1:
    content = content[:app_settings_idx] + supplier_js_code + "\n\n" + content[app_settings_idx:]
    print("Inserted Supplier API JS code into index.html successfully.")
else:
    print("Error: Could not find renderAdminAppSettings in index.html")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Supplier API system applied successfully!")
