import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Schedule from './Schedule';
import Login from './Login';

export default function App() {
	return (
		<Router>
			<div className="flex h-full flex-col">
				<header className="flex items-center justify-between bg-slate-800 px-6 py-4 shadow-lg">
					<Link to="/" className="group flex items-center gap-3">
						<div className="text-3xl transition-transform duration-200 group-hover:scale-110">
							💈
						</div>
						<div>
							<h1 className="bg-linear-to-r from-amber-400 to-amber-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
								Barbearia Tiago
							</h1>
							<p className="text-xs font-medium tracking-wide text-slate-400">Estilo & Tradição</p>
						</div>
					</Link>
					<Link
						to="/login"
						className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-white transition-all hover:bg-amber-600"
					>
						Login
					</Link>
				</header>
				<main className="flex grow">
					<Routes>
						<Route path="/" element={<Schedule />} />
						<Route path="/login" element={<Login />} />
					</Routes>
				</main>
			</div>
		</Router>
	);
}
