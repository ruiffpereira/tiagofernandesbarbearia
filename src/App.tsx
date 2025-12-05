
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Marcar from "./Marcar";
import Login from "./Login";

export default function App() {
  return (
    <Router>
      <div className="h-full flex flex-col">
        <header className="flex justify-between items-center px-6 py-4 bg-slate-800 shadow-lg ">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="text-3xl group-hover:scale-110 transition-transform duration-200">💈</div>
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 tracking-tight">
                Barbearia Tiago
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide">Estilo & Tradição</p>
            </div>
          </Link>
          <Link to="/login" className="px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-all">Login</Link>
        </header>
        <main className="grow flex">
          <Routes>
            <Route path="/" element={<Marcar />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
