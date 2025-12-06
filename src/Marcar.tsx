
import React, { useState } from "react";

type Service = {
	id: number;
	name: string;
	price: string;
	duration: string;
};

const services: Service[] = [
	{ id: 1, name: "Corte de Cabelo", price: "15€", duration: "30 min" },
	{ id: 2, name: "Barba", price: "10€", duration: "15 min" },
	{ id: 3, name: "Corte + Barba", price: "20€", duration: "45 min" },
];

const horarios = [
	"09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
];


const Marcar: React.FC = () => {
	const [selected, setSelected] = useState<number | null>(null);
	const [date, setDate] = useState<string>("");
	const [hora, setHora] = useState<string>("");
	const [success, setSuccess] = useState<boolean>(false);
	const [confirmedData, setConfirmedData] = useState<{service: string, price: string, duration: string, date: string, hora: string} | null>(null);

	// Simulação de horários ocupados (exemplo)
	const horariosOcupados = ["12:00", "15:00"];
	const horariosDisponiveis = horarios.filter(h => !horariosOcupados.includes(h));

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const selectedService = services.find(s => s.id === selected);
		if (selectedService) {
			setConfirmedData({
				service: selectedService.name,
				price: selectedService.price,
				duration: selectedService.duration,
				date: date,
				hora: hora
			});
		}
		setSuccess(true);
	}

	function handleNewBooking() {
		setSuccess(false);
		setConfirmedData(null);
		setSelected(null);
		setDate("");
		setHora("");
	}

	return (
		<div className="flex flex-col grow items-center justify-center bg-slate-800 py-8 px-4">
			<div className="w-full max-w-md mx-auto flex flex-col gap-6 lg:-mt-24">
				<div className="text-center space-y-3 ">
					<div className="text-5xl mb-4">✂️</div>
					<h1 className="text-3xl font-bold text-white tracking-tight">Marca o teu Corte</h1>
					<p className="text-slate-400 text-base">Escolha o serviço e horário ideal para si</p>
				</div>
				<div className="bg-slate-700/50 backdrop-blur-sm rounded-2xl overflow-auto p-6 shadow-2xl border border-slate-600/50">
					{!success ? (
						<form onSubmit={handleSubmit} className="flex flex-col gap-4">
							{/* Serviço */}
							<div className="flex flex-col gap-2">
								<label className="text-sm  font-semibold text-amber-400 uppercase tracking-wide flex items-center gap-2">
									✂️ Serviço
								</label>
								{selected ? (
									<button type="button"
											onClick={() => {
												setSelected(null);
												setDate("");
												setHora("");
											}}
											className="bg-slate-800 cursor-pointer rounded-xl px-4 py-3 border-2 border-amber-500/50 flex items-center justify-between group">
										<div>
											<p className="text-white font-semibold">{services.find(s => s.id === selected)?.name}</p>
											<p className="text-slate-400 text-sm">
												{services.find(s => s.id === selected)?.duration} • {services.find(s => s.id === selected)?.price}
											</p>
										</div>
										<div
											
											className="text-amber-400 hover:text-amber-300 text-sm font-medium"
										>
											Alterar
										</div>
									</button>
								) : (
									<select
										className="w-full border-2 border-slate-600 rounded-xl px-4 py-3.5 text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-800 text-white transition-all shadow-inner hover:border-slate-500"
										value={selected ?? ""}
										onChange={e => setSelected(Number(e.target.value))}
										required
									>
										<option value="" disabled>Selecione...</option>
										{services.map(s => (
											<option key={s.id} value={s.id}>{s.name} ({s.duration}) - {s.price}</option>
										))}
									</select>
								)}
							</div>

							{/* Data */}
							{selected && (
								<div className="flex flex-col gap-2 animate-fadeIn">
									<label className="text-sm font-semibold text-amber-400 uppercase tracking-wide flex items-center gap-2">
										📅 Data
									</label>
									{date ? (
										<button
										type="button"
												onClick={() => {
													setDate("");
													setHora("");
												}}
												 className="bg-slate-800 rounded-xl cursor-pointer px-4 py-3 border-2 border-amber-500/50 flex items-center justify-between">
											<p className="text-white font-semibold">
												{new Date(date + 'T00:00:00').toLocaleDateString('pt-PT', { 
													weekday: 'short', 
													day: 'numeric', 
													month: 'short',
													year: 'numeric'
												})}
											</p>
											<div
												
												className="text-amber-400 hover:text-amber-300 text-sm font-medium"
											>
												Alterar
											</div>
										</button>
									) : (
										<input
											type="date"
											className="w-full border-2 border-slate-600 rounded-xl px-4 py-3.5 text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-800 text-white transition-all shadow-inner hover:border-slate-500"
											value={date}
											onChange={e => setDate(e.target.value)}
											required
										/>
									)}
								</div>
							)}

							{/* Horário */}
							{selected && date && (
								<div className="flex flex-col gap-2 animate-fadeIn">
									<label className="text-sm font-semibold text-amber-400 uppercase tracking-wide flex items-center gap-2">
										🕐 Horário
									</label>
									{hora ? (
										<button type="button"
												onClick={() => setHora("")}
												 className="bg-slate-800 rounded-xl px-4 py-3 border-2 border-amber-500/50 flex items-center justify-between">
											<p className="text-white font-semibold text-lg">{hora}</p>
											<div
												
												className="text-amber-400 hover:text-amber-300 text-sm font-medium"
											>
												Alterar
											</div>
										</button>
									) : (
										<div className="grid grid-cols-3 gap-2">
											{horariosDisponiveis.map(h => (
												<button
													type="button"
													key={h}
													className="py-3 rounded-xl font-semibold text-sm transition-all duration-200 border-2 bg-slate-800 text-white hover:bg-amber-500 hover:shadow-md border-slate-600 hover:border-amber-500"
													onClick={() => setHora(h)}
												>
													{h}
												</button>
											))}
										</div>
									)}
								</div>
							)}

							{selected && date && hora && (
								<button
									type="submit"
									className="w-full mt-4 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold text-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/50 hover:scale-[1.02] animate-fadeIn"
								>
									Confirmar Marcação
								</button>
							)}
						</form>
					) : (
						<div className="flex flex-col gap-6 animate-fadeIn">
						<div className="text-center">
							<div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-3xl">✓</span>
							</div>
							<h2 className="text-2xl font-bold text-white mb-2">Marcação Confirmada!</h2>
							<p className="text-slate-400 text-sm">O seu horário foi reservado com sucesso</p>
						</div>							{confirmedData && (
								<div className="bg-slate-800 rounded-xl p-5 space-y-4 border-2 border-amber-500/30">
							<div className="flex items-start gap-3">
								<span className="text-2xl">✂️</span>
								<div className="flex-1">
									<p className="text-xs text-amber-400 uppercase font-semibold tracking-wide">Serviço</p>
									<p className="text-white font-semibold text-lg">{confirmedData.service}</p>
									<p className="text-slate-400 text-sm">{confirmedData.duration} • {confirmedData.price}</p>
								</div>
							</div>									<div className="flex items-start gap-3">
										<span className="text-2xl">📅</span>
										<div className="flex-1">
											<p className="text-xs text-amber-400 uppercase font-semibold tracking-wide">Data</p>
											<p className="text-white font-semibold text-lg">
												{new Date(confirmedData.date + 'T00:00:00').toLocaleDateString('pt-PT', { 
													weekday: 'long', 
													year: 'numeric', 
													month: 'long', 
													day: 'numeric' 
												})}
											</p>
										</div>
									</div>
									
									<div className="flex items-start gap-3">
										<span className="text-2xl">🕐</span>
										<div className="flex-1">
											<p className="text-xs text-amber-400 uppercase font-semibold tracking-wide">Horário</p>
											<p className="text-white font-semibold text-lg">{confirmedData.hora}</p>
										</div>
									</div>
								</div>
							)}

							<button
								onClick={handleNewBooking}
								className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold text-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/50 hover:scale-[1.02]"
							>
								Nova Marcação
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Marcar;
