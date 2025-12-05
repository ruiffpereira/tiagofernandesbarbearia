import React, { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login com credenciais:", { email, password });
  };

  const handleGoogleLogin = () => {
    console.log("Login com Google");
  };

  const handleFacebookLogin = () => {
    console.log("Login com Facebook");
  };

  return (
    <div className="flex w-full items-center justify-center bg-slate-800 py-8 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✂️</div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Barbearia Tiago</h1>
          <p className="text-slate-400 text-sm">Faça login para gerir as suas marcações</p>
        </div>

        <div className="bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-slate-600/50">
          {/* Botões de login social */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>

            <button
              onClick={handleFacebookLogin}
              className="w-full py-3 px-4 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continuar com Facebook
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-700/50 text-slate-400 font-medium">ou</span>
            </div>
          </div>

          {/* Formulário de login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-slate-600 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-800 text-white transition-all shadow-inner hover:border-slate-500"
                placeholder="exemplo@email.com"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                Palavra-passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-slate-600 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-800 text-white transition-all shadow-inner hover:border-slate-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-2" />
                <span>Lembrar-me</span>
              </label>
              <a href="#" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Esqueci a palavra-passe
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold text-base hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/50 hover:scale-[1.02]"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Não tem conta?{" "}
              <a href="#" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                Registar
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
