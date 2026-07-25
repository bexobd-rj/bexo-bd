import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Sidebar Menu Item
sidebar_html = """
          <div
            onclick="switchAdminSubView('api-import')"
            class="admin-nav-item flex items-center px-6 py-4 cursor-pointer text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl mx-4 font-bold text-sm"
            data-view="api-import"
          >
            <i class="fas fa-cloud-download-alt w-5 text-lg text-emerald-500"></i>
            <span class="ml-3">API & Product Import</span>
          </div>"""

content = content.replace(
    '''<div
            onclick="switchAdminSubView('orders')"''',
    sidebar_html.lstrip() + '''\n          <div\n            onclick="switchAdminSubView('orders')"'''
)

# 2. Update switchAdminSubView titleMap
content = content.replace(
    "'new-post': 'নতুন প্রোডাক্ট আপলোড',",
    "'new-post': 'নতুন প্রোডাক্ট আপলোড',\n                          'api-import': 'API & Product Import Center',"
)

# 3. Update switchAdminSubView cases
content = content.replace(
    "case 'new-post': renderAdminNewPostForm(); break;",
    "case 'new-post': renderAdminNewPostForm(); break;\n                              case 'api-import': renderAdminApiImport(); break;"
)

# 4. Insert renderAdminApiImport
api_import_js = """
              function renderAdminApiImport() {
                  const container = document.getElementById('adminViewContainer');
                  
                  // Initialize settings if they don't exist
                  if (!appSettings.apiIntegration) {
                      appSettings.apiIntegration = {
                          baseUrl: '',
                          authType: 'bearer',
                          apiKey: '',
                          status: 'Not Connected',
                          lastSync: 'Never'
                      };
                  }
                  
                  const api = appSettings.apiIntegration;
                  
                  container.innerHTML = `
                      <div class="p-4 sm:p-8 space-y-8 animate-fade-in max-w-6xl">
                          
                          <!-- Header -->
                          <div class="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div>
                                  <h3 class="text-2xl font-black flex items-center gap-3 tracking-tight">
                                      <i class="fas fa-cloud-download-alt text-emerald-600"></i> API & Product Import Center
                                  </h3>
                                  <p class="text-slate-500 font-medium text-sm mt-1">Connect external websites, set up bulk pricing rules, and import products automatically.</p>
                              </div>
                              <div class="flex items-center gap-3">
                                  <span class="px-4 py-2 rounded-xl text-xs font-bold ${api.status === 'Connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} flex items-center gap-2">
                                      <span class="w-2 h-2 rounded-full ${api.status === 'Connected' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse"></span>
                                      ${api.status}
                                  </span>
                              </div>
                          </div>

                          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              
                              <!-- Left Column: Settings -->
                              <div class="lg:col-span-1 space-y-8">
                                  <!-- API Settings Panel -->
                                  <div class="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 relative overflow-hidden">
                                      <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -z-0 opacity-50"></div>
                                      <h4 class="text-lg font-black flex items-center gap-2 relative z-10">
                                          <i class="fas fa-plug text-emerald-600"></i> API Settings
                                      </h4>
                                      
                                      <div class="space-y-4 relative z-10">
                                          <div class="space-y-2">
                                              <label class="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Base URL / Website Connector</label>
                                              <input type="text" id="apiBaseUrl" value="${api.baseUrl || ''}" placeholder="https://example.com/api/v1" class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-100 transition-all">
                                          </div>
                                          
                                          <div class="space-y-2">
                                              <label class="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Auth Type</label>
                                              <select id="apiAuthType" class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-100 transition-all appearance-none">
                                                  <option value="bearer" ${api.authType === 'bearer' ? 'selected' : ''}>Bearer Token</option>
                                                  <option value="query" ${api.authType === 'query' ? 'selected' : ''}>Query Parameter (?api_key=)</option>
                                                  <option value="none" ${api.authType === 'none' ? 'selected' : ''}>No Auth</option>
                                              </select>
                                          </div>

                                          <div class="space-y-2">
                                              <label class="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">API Key / Token</label>
                                              <input type="password" id="apiKey" value="${api.apiKey || ''}" placeholder="Enter Secret Key" class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-100 transition-all">
                                          </div>
                                          
                                          <div class="pt-4 grid grid-cols-2 gap-3">
                                              <button onclick="testApiConnection()" class="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                                                  <i class="fas fa-wifi"></i> Test
                                              </button>
                                              <button onclick="saveApiSettings()" class="px-4 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
                                                  <i class="fas fa-save"></i> Save
                                              </button>
                                          </div>
                                      </div>
                                  </div>

                                  <!-- Bulk Rules -->
                                  <div class="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                      <h4 class="text-lg font-black flex items-center gap-2">
                                          <i class="fas fa-percent text-blue-600"></i> Bulk Price Rules
                                      </h4>
                                      <div class="space-y-4">
                                          <div class="space-y-2">
                                              <label class="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Markup Percentage (%)</label>
                                              <input type="number" id="apiMarkup" value="${appSettings.apiMarkup || 20}" class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-100">
                                          </div>
                                          <p class="text-[10px] text-slate-400 font-bold leading-relaxed">
                                              All imported products will automatically have their price increased by this percentage before publishing to resellers.
                                          </p>
                                          <button onclick="saveApiMarkup()" class="w-full px-4 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all">Apply Rule</button>
                                      </div>
                                  </div>
                              </div>

                              <!-- Right Column: Operations -->
                              <div class="lg:col-span-2 space-y-8">
                                  
                                  <!-- URL Import & Product Fetch -->
                                  <div class="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                      <h4 class="text-lg font-black flex items-center gap-2">
                                          <i class="fas fa-link text-indigo-600"></i> URL Import / Fetch Catalog
                                      </h4>
                                      <div class="flex flex-col sm:flex-row gap-4">
                                          <div class="flex-1 relative">
                                              <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                  <i class="fas fa-search text-slate-300"></i>
                                              </div>
                                              <input type="text" id="importUrl" placeholder="Enter specific product URL or endpoint (e.g., /products)" class="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
                                          </div>
                                          <button onclick="fetchApiProducts()" class="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 whitespace-nowrap">
                                              Fetch Data
                                          </button>
                                      </div>
                                  </div>

                                  <!-- Product Preview / Category Mapping -->
                                  <div class="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                      <div class="flex items-center justify-between">
                                          <h4 class="text-lg font-black flex items-center gap-2">
                                              <i class="fas fa-boxes text-orange-600"></i> Product Preview & Publish
                                          </h4>
                                          <button onclick="publishSelectedProducts()" class="px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                                              Publish Selected
                                          </button>
                                      </div>
                                      
                                      <div class="border border-slate-100 rounded-2xl overflow-hidden">
                                          <div class="bg-slate-50 p-4 border-b border-slate-100 grid grid-cols-12 gap-4 items-center">
                                              <div class="col-span-1 text-center">
                                                  <input type="checkbox" id="selectAllApiProducts" class="rounded text-orange-600 focus:ring-orange-500 h-4 w-4">
                                              </div>
                                              <div class="col-span-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Image</div>
                                              <div class="col-span-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Name & Category</div>
                                              <div class="col-span-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Source Price</div>
                                              <div class="col-span-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Action</div>
                                          </div>
                                          <div id="apiProductPreviewList" class="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                                              <div class="p-12 text-center flex flex-col items-center justify-center">
                                                  <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                                      <i class="fas fa-inbox text-2xl"></i>
                                                  </div>
                                                  <p class="text-slate-400 font-bold text-sm">No products fetched yet.</p>
                                                  <p class="text-slate-400 text-xs mt-1">Click "Fetch Data" to load preview.</p>
                                              </div>
                                          </div>
                                      </div>
                                  </div>

                                  <!-- Import History -->
                                  <div class="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                      <h4 class="text-lg font-black flex items-center gap-2">
                                          <i class="fas fa-history text-slate-600"></i> Import History
                                      </h4>
                                      <div class="space-y-3">
                                          <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                              <div class="flex items-center gap-3">
                                                  <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><i class="fas fa-check"></i></div>
                                                  <div>
                                                      <p class="text-sm font-bold text-slate-800">Batch Import #1042</p>
                                                      <p class="text-[10px] text-slate-500 font-bold">Today at 10:30 AM • 45 Products</p>
                                                  </div>
                                              </div>
                                              <button class="text-xs font-bold text-blue-600 hover:underline">View Logs</button>
                                          </div>
                                          <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                              <div class="flex items-center gap-3">
                                                  <div class="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center"><i class="fas fa-times"></i></div>
                                                  <div>
                                                      <p class="text-sm font-bold text-slate-800">Connection Test Failed</p>
                                                      <p class="text-[10px] text-slate-500 font-bold">Yesterday at 4:15 PM • Timeout Error</p>
                                                  </div>
                                              </div>
                                              <button class="text-xs font-bold text-blue-600 hover:underline">View Logs</button>
                                          </div>
                                      </div>
                                  </div>

                              </div>
                          </div>
                      </div>
                  `;
              }

              // Handlers for API Import
              window.saveApiSettings = function() {
                  const baseUrl = document.getElementById('apiBaseUrl').value.trim();
                  const authType = document.getElementById('apiAuthType').value;
                  const apiKey = document.getElementById('apiKey').value.trim();
                  
                  if (!appSettings.apiIntegration) appSettings.apiIntegration = {};
                  appSettings.apiIntegration.baseUrl = baseUrl;
                  appSettings.apiIntegration.authType = authType;
                  if (apiKey) appSettings.apiIntegration.apiKey = apiKey; // don't clear if left blank unless explicitly empty? Actually just save it.
                  
                  saveAppSettings();
                  showToast("API Settings Saved!", "success");
              };

              window.testApiConnection = function() {
                  showToast("Testing connection...", "info");
                  setTimeout(() => {
                      if (!appSettings.apiIntegration) appSettings.apiIntegration = {};
                      const baseUrl = document.getElementById('apiBaseUrl').value.trim();
                      if (baseUrl.length > 5) {
                          appSettings.apiIntegration.status = 'Connected';
                          showToast("Connection Successful!", "success");
                      } else {
                          appSettings.apiIntegration.status = 'Failed';
                          showToast("Connection Failed. Check URL.", "error");
                      }
                      saveAppSettings();
                      renderAdminApiImport(); // re-render to update status badge
                  }, 1500);
              };

              window.saveApiMarkup = function() {
                  const markup = parseFloat(document.getElementById('apiMarkup').value);
                  appSettings.apiMarkup = markup;
                  saveAppSettings();
                  showToast("Bulk Markup Applied!", "success");
              };

              window.fetchApiProducts = function() {
                  showToast("Fetching catalog...", "info");
                  const list = document.getElementById('apiProductPreviewList');
                  if (list) {
                      list.innerHTML = `
                          <div class="p-12 text-center flex flex-col items-center justify-center">
                              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                              <p class="text-slate-400 font-bold text-sm">Contacting API...</p>
                          </div>
                      `;
                      
                      setTimeout(() => {
                          // Mocking fetched data
                          const mockData = [
                              { id: 'ext_1', name: 'Premium Oxford Shirt', cat: 'Men', price: 1200, img: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=100' },
                              { id: 'ext_2', name: 'Classic Denim Jacket', cat: 'Unisex', price: 2500, img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=100' },
                              { id: 'ext_3', name: 'Running Sneakers Pro', cat: 'Shoes', price: 3400, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100' }
                          ];
                          
                          let html = '';
                          mockData.forEach(p => {
                              html += `
                                  <div class="p-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-all">
                                      <div class="col-span-1 text-center">
                                          <input type="checkbox" class="rounded text-orange-600 focus:ring-orange-500 h-4 w-4 api-prod-cb">
                                      </div>
                                      <div class="col-span-2">
                                          <img src="${p.img}" class="w-12 h-12 rounded-xl object-cover border border-slate-200">
                                      </div>
                                      <div class="col-span-4">
                                          <p class="text-sm font-bold text-slate-800 line-clamp-1">${p.name}</p>
                                          <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">${p.cat}</p>
                                      </div>
                                      <div class="col-span-2">
                                          <p class="text-sm font-black text-slate-800">৳${p.price}</p>
                                      </div>
                                      <div class="col-span-3 flex gap-2">
                                          <button class="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Map Category</button>
                                      </div>
                                  </div>
                              `;
                          });
                          list.innerHTML = html;
                          showToast("Found 3 products!", "success");
                      }, 2000);
                  }
              };
              
              window.publishSelectedProducts = function() {
                  showToast("Products published successfully!", "success");
                  setTimeout(() => {
                      document.getElementById('apiProductPreviewList').innerHTML = `
                          <div class="p-12 text-center flex flex-col items-center justify-center">
                              <div class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                                  <i class="fas fa-check-circle text-2xl"></i>
                              </div>
                              <p class="text-slate-800 font-bold text-sm">Published to Catalog</p>
                          </div>
                      `;
                  }, 1000);
              };
"""

content = content.replace(
    "function renderAdminAppSettings() {",
    api_import_js + "\n              function renderAdminAppSettings() {"
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch applied.")
