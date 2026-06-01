# Barbearia Tiago Fernandes 💈

Website de marcações online para a Barbearia Tiago Fernandes (Braga).
Construído com **React + Vite + TailwindCSS**.

## ✨ Funcionalidades

- **Página inicial focada na marcação** — layout split-screen (info à esquerda, marcação à direita). Em telemóvel a marcação aparece primeiro.
- **Marcação em 3 passos** — escolher serviço → data/hora → confirmar.
- **Registo / Login** — por email + palavra-passe ou "Continuar com Google" (simulado).
- **Área de cliente** — ver próximas marcações, histórico, editar e cancelar.
- **Páginas** — Início, Trabalhos (galeria), Sobre.
- **Responsivo** — desktop, tablet e telemóvel.

## 🚀 Como correr

Precisas de ter o [Node.js](https://nodejs.org) instalado (versão 18 ou superior).

```bash
# 1. Instalar as dependências
npm install

# 2. Arrancar o servidor de desenvolvimento
npm run dev
```

Abre o endereço que aparece no terminal (normalmente `http://localhost:5173`).

### Outros comandos

```bash
npm run build     # cria a versão de produção na pasta /dist
npm run preview   # pré-visualiza a build de produção
```

## 📁 Estrutura

```
barber-tiago/
├── public/
│   └── logo.png              # logo da barbearia
├── src/
│   ├── components/
│   │   ├── ui.jsx            # botões, modal, inputs reutilizáveis
│   │   ├── Navbar.jsx
│   │   ├── AuthModal.jsx     # registo / login
│   │   ├── BookingWidget.jsx # widget de marcação em 3 passos
│   │   ├── EditModal.jsx     # editar marcação
│   │   └── BookingCard.jsx   # cartão de marcação (dashboard)
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── GalleryPage.jsx
│   │   ├── AboutPage.jsx
│   │   └── DashboardPage.jsx
│   ├── data.js               # serviços, barbeiros, info do negócio
│   ├── storage.js            # persistência (localStorage)
│   ├── utils.js              # geração de horários e datas
│   ├── App.jsx               # componente principal
│   ├── main.jsx              # ponto de entrada
│   └── index.css             # estilos base + Tailwind
├── tailwind.config.js        # paleta de cores (navy + bordô + creme)
├── vite.config.js
└── package.json
```

## 🎨 Cores

A paleta foi derivada do logo:

| Cor | Hex | Uso |
|-----|-----|-----|
| Navy | `#27333f` | cor principal, texto, botões |
| Bordô | `#7a261c` | acento, destaques |
| Creme | `#f4f1ea` | fundo |
| Paper | `#faf8f3` | cartões |

Podes ajustá-las em `tailwind.config.js`.

## 💾 Dados

Os dados (utilizadores e marcações) são guardados no **localStorage** do browser —
ou seja, ficam apenas no dispositivo de quem usa. Para um site a sério, com dados
partilhados na nuvem, o próximo passo é ligar a um backend (ex: **Supabase** ou
**Firebase**) substituindo as funções em `src/storage.js`. As assinaturas das
funções foram mantidas simples precisamente para facilitar essa troca.

## 📝 Personalizar

- **Serviços e preços:** `src/data.js`
- **Morada, telefone, redes sociais, horário:** `src/data.js` (objeto `BUSINESS`)
- **Cores:** `tailwind.config.js`
- **Logo:** substitui `public/logo.png`

---

Feito com ❤️ para a Barbearia Tiago Fernandes.
