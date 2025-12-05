
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Marcar from "./Marcar";
import Login from "./Login";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <header className="flex justify-between items-center px-6 py-4 bg-slate-800 shadow-lg">
          <h1 className="text-xl font-bold text-white tracking-tight">Barbearia Tiago</h1>
          <Link to="/login" className="px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-all">Login</Link>
        </header>
        <main className="grow flex">
          <Routes>
            <Route path="/" element={<Marcar />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
