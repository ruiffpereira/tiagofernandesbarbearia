import React, { useState } from "react";

const services = [
  { id: 1, name: "Corte de Cabelo", price: "R$ 30" },
  { id: 2, name: "Barba", price: "R$ 20" },
  { id: 3, name: "Corte + Barba", price: "R$ 45" },
];

export default function Marcar() {
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSuccess(true);
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 py-10">
      <h1 className="text-3xl font-bold mb-8">Agende seu Corte</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-6">
        <div>
          <label className="block mb-2 font-medium">Escolha o serviço</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selected || ""}
            onChange={e => setSelected(e.target.value)}
            required
          >
            <option value="" disabled>Selecione...</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.price})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 font-medium">Data e Hora</label>
          <input
            type="datetime-local"
            className="w-full border rounded px-3 py-2"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Agendar</button>
        {success && <div className="text-green-600 text-center font-medium">Agendamento realizado!</div>}
      </form>
    </div>
  );
}
