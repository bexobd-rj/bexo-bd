import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Reseller Marketplace Workspace</h1>
          <p className="text-slate-600">The React + Vite base has been set up. Waiting for route approval to scaffold the Admin, Collector, and Customer views.</p>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
