const fs = require('fs');

let content = fs.readFileSync('src/components/InvoiceViewer.tsx', 'utf-8');

// 1. Add fetching logic inside InvoiceViewer
content = content.replace(
  `export function InvoiceViewer({ order, profile, currentUser }: InvoiceViewerProps) {`,
  `export function InvoiceViewer({ order: initialOrder, profile, currentUser }: InvoiceViewerProps) {\n  const [order, setOrder] = useState<any>(initialOrder);\n\n  useEffect(() => {\n    if (initialOrder?.id) {\n      import('../firebase').then(({ db }) => {\n        import('firebase/firestore').then(({ doc, getDoc }) => {\n          getDoc(doc(db, 'orders', initialOrder.id)).then(snap => {\n            if (snap.exists()) {\n              setOrder({ id: snap.id, ...snap.data() });\n            }\n          }).catch(err => console.error("Error fetching latest order:", err));\n        });\n      });\n    }\n  }, [initialOrder?.id]);`
);

// 2. Fix order.id references in the props destructuring?
// initialOrder is only used in useState and useEffect. Inside the component we use `order` state.

// 3. Fix order-meta-container styling for PDF export
content = content.replace(
  /onclone: \(clonedDoc\) => {[\s\S]*?}/,
  `onclone: (clonedDoc) => {\n             // No hacks needed, CSS is fixed\n          }`
);

// Fix text colors in the meta container to be md:text-white explicitly
content = content.replace(
  /<span className="text-slate-700 font-bold shrink-0">📄 Invoice No<\/span>/g,
  `<span className="text-slate-700 md:text-blue-100 font-bold shrink-0">📄 Invoice No</span>`
);
content = content.replace(
  /<span className="font-mono tracking-tight font-extrabold text-slate-800 break-all text-right">\{generateInvoiceNo\(\) \|\| 'N\/A'\}<\/span>/g,
  `<span className="font-mono tracking-tight font-extrabold text-slate-800 md:text-white break-all text-right">{generateInvoiceNo() || 'N/A'}</span>`
);

content = content.replace(
  /<span className="text-slate-700 font-bold shrink-0">🆔 Order ID<\/span>/g,
  `<span className="text-slate-700 md:text-blue-100 font-bold shrink-0">🆔 Order ID</span>`
);
content = content.replace(
  /<span className="font-mono tracking-tight font-extrabold text-slate-800 break-all text-right">#\{\(order as any\)\.orderNo \|\| order\.id \|\| 'N\/A'\}<\/span>/g,
  `<span className="font-mono tracking-tight font-extrabold text-slate-800 md:text-white break-all text-right">#{(order as any).orderNo || order.id || 'N/A'}</span>`
);

content = content.replace(
  /<span className="text-slate-700 font-bold shrink-0">📅 Order Date<\/span>/g,
  `<span className="text-slate-700 md:text-blue-100 font-bold shrink-0">📅 Order Date</span>`
);
content = content.replace(
  /<span className="font-sans font-extrabold text-slate-800 break-all text-right">\{order\.date \? formatDate\(order\.date\) : 'N\/A'\}<\/span>/g,
  `<span className="font-sans font-extrabold text-slate-800 md:text-white break-all text-right">{order.date ? formatDate(order.date) : 'N/A'}</span>`
);

content = content.replace(
  /<span className="text-slate-700 font-bold shrink-0">💳 Payment Method<\/span>/g,
  `<span className="text-slate-700 md:text-blue-100 font-bold shrink-0">💳 Payment Method</span>`
);
content = content.replace(
  /<span className="font-sans font-extrabold text-slate-800 break-words text-right">\{\(order as any\)\.paymentMethod \|\| 'Cash on Delivery \(COD\)'\}<\/span>/g,
  `<span className="font-sans font-extrabold text-slate-800 md:text-white break-words text-right">{(order as any).paymentMethod || 'Cash on Delivery (COD)'}</span>`
);

// We need to also fix the "INVOICE" text and stamp because if they are white, html2canvas might not render them if background is missing.
// The blue background is: `<div className="absolute top-0 right-0 bottom-0 w-1/2 bg-[#0E46A3]" />`
// This might fail in html2canvas. Let's make it a solid block by adding html2canvas data-attributes if necessary, or just rely on it.
// Actually, `html2canvas` usually renders absolute divs just fine if z-index is correct.

fs.writeFileSync('src/components/InvoiceViewer.tsx', content);
console.log('Fixed InvoiceViewer.tsx');
