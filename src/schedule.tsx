import React, { useState } from 'react';

type Service = {
	id: number;
	name: string;
	price: string;
	duration: string;
};

const services: Service[] = [
	{ id: 1, name: 'Corte de Cabelo', price: '15€', duration: '30 min' },
	{ id: 2, name: 'Barba', price: '10€', duration: '15 min' },
	{ id: 3, name: 'Corte + Barba', price: '20€', duration: '45 min' },
];

const horarios = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const Marcar: React.FC = () => {
	const [selected, setSelected] = useState<number | null>(null);
	const [date, setDate] = useState<string>('');
	const [hora, setHora] = useState<string>('');
	const [success, setSuccess] = useState<boolean>(false);
	const [showBooking, setShowBooking] = useState<boolean>(false);
	const [confirmedData, setConfirmedData] = useState<{
		service: string;
		price: string;
		duration: string;
		date: string;
		hora: string;
	} | null>(null);

	// Simulação de horários ocupados (exemplo)
	const horariosOcupados = ['12:00', '15:00'];
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
				hora: hora,
			});
		}
		setSuccess(true);
	}

	function handleNewBooking() {
		setSuccess(false);
		setConfirmedData(null);
		setSelected(null);
		setDate('');
		setHora('');
	}

	// Página inicial de apresentação
	if (!showBooking) {
		return (
			<div className="flex grow flex-col items-center justify-center bg-slate-800 px-4 py-8">
				<div className="mx-auto flex w-full max-w-md flex-col items-center gap-8">
					{/* Foto redonda - substituir src pela tua foto */}
					<div className="relative h-64 w-64 overflow-hidden rounded-full border-4 border-amber-500 shadow-2xl shadow-amber-500/20">
						<img
							src="https://scontent.cdninstagram.com/v/t51.82787-15/557358984_17955054897007944_1508951254029729992_n.jpg?stp=dst-jpg_e35_p1080x1080_tt6&_nc_cat=109&ig_cache_key=MzczMTczNDk5NTA3ODUzMTk0Mw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=fyEDD565ZWgQ7kNvwGze3sc&_nc_oc=Adn1nkFPrqxr2onuW_NTPhqque_DJcqSu4UShAgraDOW8S6-o1Grx6caDQoDeLwKHu1BcSG_vb-UtA1yftrWp676&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=qFE_hhm5gLomYoZYcs_ddQ&oh=00_Afmxvn2Bs3Vljg7F28PunQszdcOwcxdp_YytDkhqCy22gw&oe=69392E6D"
							alt="Tiago - Barbeiro"
							className="h-full w-full scale-125 object-cover object-top"
						/>
					</div>

					{/* Texto de apresentação */}
					<div className="space-y-4 text-center">
						<h1 className="bg-linear-to-r from-amber-400 to-amber-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-4xl">
							Barbearia Tiago
						</h1>
						<p className="px-4 text-base leading-relaxed text-slate-300 md:text-lg">
							Bem-vindo! Reserve o seu horário de forma rápida e simples.
						</p>
					</div>

					{/* Botão para marcar */}
					<button
						onClick={() => setShowBooking(true)}
						className="w-full rounded-xl bg-linear-to-r from-amber-500 to-amber-600 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-500/30 transition-all duration-200 hover:scale-[1.02] hover:from-amber-600 hover:to-amber-700 hover:shadow-xl hover:shadow-amber-500/50 md:text-xl"
					>
						Marcar Horário
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex grow flex-col items-center justify-center bg-slate-800 px-4 py-8">
			<div className="mx-auto flex w-full max-w-md flex-col gap-6 lg:-mt-24">
				<div className="space-y-3 text-center">
					<div className="mb-4 text-4xl md:text-5xl">✂️</div>
					<h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
						Marca o teu Corte
					</h1>
					<p className="text-sm text-slate-400 md:text-base">
						Escolha o serviço e horário ideal para si
					</p>
				</div>
				<div className="overflow-auto rounded-2xl border border-slate-600/50 bg-slate-700/50 p-6 shadow-2xl backdrop-blur-sm">
					{!success ? (
						<form onSubmit={handleSubmit} className="flex flex-col gap-4">
							{/* Serviço */}
							<div className="flex flex-col gap-2">
								<label className="flex items-center gap-2 text-sm font-semibold tracking-wide text-amber-400 uppercase">
									✂️ Serviço
								</label>
								{selected ? (
									<button
										type="button"
										onClick={() => {
											setSelected(null);
											setDate('');
											setHora('');
										}}
										className="group flex cursor-pointer items-center justify-between rounded-xl border-2 border-amber-500/50 bg-slate-800 px-4 py-3 text-left"
									>
										<div>
											<p className="font-semibold text-white">
												{services.find(s => s.id === selected)?.name}
											</p>
											<p className="text-sm text-slate-400">
												{services.find(s => s.id === selected)?.duration} •{' '}
												{services.find(s => s.id === selected)?.price}
											</p>
										</div>
										<div className="text-sm font-medium text-amber-400 hover:text-amber-300">
											Alterar
										</div>
									</button>
								) : (
									<select
										className="w-full rounded-xl border-2 border-slate-600 bg-slate-800 px-4 py-3.5 text-base text-white shadow-inner transition-all hover:border-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
										value={selected ?? ''}
										onChange={e => setSelected(Number(e.target.value))}
										required
									>
										<option value="" disabled>
											Selecione...
										</option>
										{services.map(s => (
											<option key={s.id} value={s.id}>
												{s.name} ({s.duration}) - {s.price}
											</option>
										))}
									</select>
								)}
							</div>

							{/* Data */}
							{selected && (
								<div className="animate-fadeIn flex flex-col gap-2">
									<label className="flex items-center gap-2 text-sm font-semibold tracking-wide text-amber-400 uppercase">
										📅 Data
									</label>
									{date ? (
										<button
											type="button"
											onClick={() => {
												setDate('');
												setHora('');
											}}
											className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-amber-500/50 bg-slate-800 px-4 py-3"
										>
											<p className="font-semibold text-white">
												{new Date(date + 'T00:00:00').toLocaleDateString('pt-PT', {
													weekday: 'short',
													day: 'numeric',
													month: 'short',
													year: 'numeric',
												})}
											</p>
											<div className="text-sm font-medium text-amber-400 hover:text-amber-300">
												Alterar
											</div>
										</button>
									) : (
										<input
											type="date"
											className="w-full rounded-xl border-2 border-slate-600 bg-slate-800 px-4 py-3.5 text-base text-white shadow-inner transition-all hover:border-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
											value={date}
											onChange={e => setDate(e.target.value)}
											required
										/>
									)}
								</div>
							)}

							{/* Horário */}
							{selected && date && (
								<div className="animate-fadeIn flex flex-col gap-2">
									<label className="flex items-center gap-2 text-sm font-semibold tracking-wide text-amber-400 uppercase">
										🕐 Horário
									</label>
									{hora ? (
										<button
											type="button"
											onClick={() => setHora('')}
											className="flex items-center justify-between rounded-xl border-2 border-amber-500/50 bg-slate-800 px-4 py-3"
										>
											<p className="text-lg font-semibold text-white">{hora}</p>
											<div className="text-sm font-medium text-amber-400 hover:text-amber-300">
												Alterar
											</div>
										</button>
									) : (
										<div className="grid grid-cols-3 gap-2">
											{horariosDisponiveis.map(h => (
												<button
													type="button"
													key={h}
													className="rounded-xl border-2 border-slate-600 bg-slate-800 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-amber-500 hover:bg-amber-500 hover:shadow-md"
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
									className="animate-fadeIn mt-4 w-full rounded-xl bg-linear-to-r from-amber-500 to-amber-600 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-500/30 transition-all duration-200 hover:scale-[1.02] hover:from-amber-600 hover:to-amber-700 hover:shadow-xl hover:shadow-amber-500/50 md:text-lg"
								>
									Confirmar Marcação
								</button>
							)}
						</form>
					) : (
						<div className="animate-fadeIn flex flex-col gap-6">
							<div className="flex gap-4 text-center">
								<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-500">
									<span className="text-2xl md:text-3xl">✓</span>
								</div>
								<div className="flex grow flex-col self-center text-left">
									<h2 className="text-xl font-bold text-white md:text-2xl">Marcação Confirmada!</h2>
									<p className="text-sm text-slate-400">O seu horário foi reservado com sucesso</p>
								</div>
							</div>{' '}
							{confirmedData && (
								<div className="space-y-4 rounded-xl border-2 border-amber-500/30 bg-slate-800 p-5">
									<div className="flex items-start gap-3">
										<span className="text-xl md:text-2xl">✂️</span>
										<div className="flex-1">
											<p className="text-xs font-semibold tracking-wide text-amber-400 uppercase">
												Serviço
											</p>
											<p className="text-base font-semibold text-white md:text-lg">
												{confirmedData.service}
											</p>
											<p className="text-sm text-slate-400">
												{confirmedData.duration} • {confirmedData.price}
											</p>
										</div>
									</div>{' '}
									<div className="flex items-start gap-3">
										<span className="text-xl md:text-2xl">📅</span>
										<div className="flex-1">
											<p className="text-xs font-semibold tracking-wide text-amber-400 uppercase">
												Data
											</p>
											<p className="text-base font-semibold text-white md:text-lg">
												{new Date(confirmedData.date + 'T00:00:00').toLocaleDateString('pt-PT', {
													weekday: 'long',
													year: 'numeric',
													month: 'long',
													day: 'numeric',
												})}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<span className="text-xl md:text-2xl">🕐</span>
										<div className="flex-1">
											<p className="text-xs font-semibold tracking-wide text-amber-400 uppercase">
												Horário
											</p>
											<p className="text-base font-semibold text-white md:text-lg">
												{confirmedData.hora}
											</p>
										</div>
									</div>
								</div>
							)}
							<button
								onClick={handleNewBooking}
								className="w-full rounded-xl bg-linear-to-r from-amber-500 to-amber-600 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-500/30 transition-all duration-200 hover:scale-[1.02] hover:from-amber-600 hover:to-amber-700 hover:shadow-xl hover:shadow-amber-500/50 md:text-lg"
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
