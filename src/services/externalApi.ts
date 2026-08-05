// External API Service Layer
// Note: Waiting for exact base URL and auth method confirmation (Header vs Query Param)

const API_BASE_URL = import.meta.env.VITE_EXTERNAL_API_URL || '';
const API_KEY = import.meta.env.VITE_EXTERNAL_API_KEY || '';

async function fetchExternal(endpoint: string, options: RequestInit = {}) {
  if (!API_BASE_URL || !API_KEY) {
    throw new Error('External API credentials are not configured in environment variables.');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  // Assuming Authorization Bearer for now, to be confirmed
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    throw new Error(`External API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export const externalApi = {
  getAllProducts: () => fetchExternal('/products'),
  createOrder: (payload: any) => fetchExternal('/order/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getOrderDetails: (id: string) => fetchExternal(`/order/${id}`),
  deleteOrder: (id: string) => fetchExternal(`/order/${id}`, {
    method: 'DELETE',
  }),
};
