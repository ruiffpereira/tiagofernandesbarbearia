import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Marcar from "./Marcar";
import Login from "./Login";

export default function App() {
  return (
    <Router>
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <h1 className="text-xl font-bold">Barbearia Tiago</h1>
        <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Login</Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Marcar />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </Router>
  );
}
