import { useOutletContext } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { useCms } from "../context/CmsContext.jsx";
import BookingWidget from "../components/BookingWidget.jsx";

const PinIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const ClockIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const PhoneIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const SOCIAL_PATHS = {
  Instagram:
    "M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9zm9.25 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  Facebook:
    "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12z",
  WhatsApp:
    "M17.47 14.38c-.25-.13-1.51-.74-1.74-.83-.23-.09-.4-.13-.57.13-.17.25-.66.83-.81 1-.15.17-.3.19-.55.06-.25-.13-1.06-.39-2.02-1.24-.75-.66-1.25-1.49-1.4-1.74-.15-.25-.02-.39.11-.51.11-.11.25-.3.38-.45.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.57-1.36-.78-1.86-.21-.49-.41-.42-.57-.43-.15-.01-.32-.01-.49-.01s-.45.06-.69.32c-.23.25-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.17 1.81 2.77 4.39 3.88.61.26 1.09.42 1.46.54.61.19 1.17.17 1.61.1.49-.07 1.51-.62 1.72-1.21.21-.59.21-1.1.15-1.21-.06-.11-.23-.17-.48-.3zM12 2a10 10 0 0 0-8.6 15.06L2 22l5.04-1.32A10 10 0 1 0 12 2z",
};

export default function HomePage() {
  const { user } = useAuth();
  const { onRequireLogin } = useOutletContext();
  const { t } = useCms();

  const stats = [
    [t("hero.stat1.valor"), t("hero.stat1.label")],
    [t("hero.stat2.valor"), t("hero.stat2.label")],
    [t("hero.stat3.valor"), t("hero.stat3.label")],
  ];

  const socials = {
    instagram: t("redes.instagram"),
    facebook: t("redes.facebook"),
    whatsapp: t("redes.whatsapp"),
  };

  const morada = [t("contacto.morada1"), t("contacto.morada2")]
    .filter(Boolean)
    .join(", ");
  // URL do mapa preenchido pelo cliente no backoffice (chave contacto.mapa_url)
  const mapsUrl = t("contacto.mapa_url") || null;

  return (
    <main>
      <section
        aria-label="Apresentação e marcação"
        className="grid lg:grid-cols-[1.1fr_1fr] min-h-[calc(100vh-64px)]"
      >
        {/* ESQUERDA */}
        <div className="order-2 justify-center lg:order-1 relative flex flex-col px-6 sm:px-10 lg:px-16 py-10 lg:py-0 bg-cream">
          <div
            aria-hidden="true"
            className="absolute inset-0 dot-grid pointer-events-none"
          />
          <div className="relative max-w-[520px] self-center">
            <p
              aria-label={t("hero.badge")}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-maroon/[0.1] border border-maroon/25 rounded-full text-xs font-semibold text-maroon tracking-wide animate-fadeUp"
            >
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rounded-full bg-maroon"
              />
              {t("hero.badge")}
            </p>

            <div className="flex items-center gap-4 mt-6 mb-4 animate-fadeUp [animation-delay:.05s]">
              <img
                src={t("hero.logo")}
                alt={`${t("hero.titulo")} — logótipo`}
                width="80"
                height="80"
                loading="eager"
                decoding="async"
                fetchpriority="high"
                className="h-20 w-20 object-contain shrink-0"
              />
              <h1 className="text-[clamp(30px,4.5vw,52px)] font-extrabold leading-[1.02] tracking-tight text-navy">
                {t("hero.titulo").split(" ").slice(0, 1).join(" ")}
                <br />
                <span className="text-maroon italic font-bold">
                  {t("hero.titulo").split(" ").slice(1).join(" ")}
                </span>
              </h1>
            </div>

            <p className="text-[clamp(15px,1.6vw,17px)] text-ink-soft leading-relaxed max-w-[440px] mb-8 animate-fadeUp [animation-delay:.15s]">
              {t("hero.tagline")}
            </p>

            {/* Cartão contacto / horário */}
            <address className="not-italic bg-paper border border-line rounded-xl2 p-5 shadow-soft animate-fadeUp [animation-delay:.25s]">
              <div className="flex items-center gap-2 mb-3.5">
                <span
                  aria-hidden="true"
                  className="inline-block w-8 h-0.5 bg-navy rounded-full"
                />
                <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-navy">
                  {t("home.contacto.titulo")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3.5 mb-4">
                <div>
                  <div
                    aria-hidden="true"
                    className="flex items-center gap-1.5 text-ink-faint text-[11px] font-semibold tracking-wider uppercase mb-1"
                  >
                    <PinIcon /> {t("home.contacto.morada.label")}
                  </div>
                  {mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir ${morada} no Google Maps`}
                      className="text-sm text-ink font-medium leading-snug hover:text-navy transition-colors"
                    >
                      {t("contacto.morada1")}
                      <br />
                      {t("contacto.morada2")}
                    </a>
                  ) : (
                    <p className="text-sm text-ink font-medium leading-snug">
                      {t("contacto.morada1")}
                      <br />
                      {t("contacto.morada2")}
                    </p>
                  )}
                </div>
                <div>
                  <div
                    aria-hidden="true"
                    className="flex items-center gap-1.5 text-ink-faint text-[11px] font-semibold tracking-wider uppercase mb-1"
                  >
                    <ClockIcon /> {t("home.contacto.horario.label")}
                  </div>
                  <p className="text-sm text-ink font-medium leading-snug">
                    <time>{t("contacto.horario.dias")}</time>
                    <br />
                    <time>{t("contacto.horario.manha")}</time> ·{" "}
                    <time>{t("contacto.horario.tarde")}</time>
                  </p>
                </div>
              </div>
              <div aria-hidden="true" className="h-px bg-line mb-4" />
              <div className="flex items-center justify-between flex-wrap gap-3">
                <a
                  href={`tel:${t("contacto.telefone.href")}`}
                  aria-label={`Ligar para ${t("contacto.telefone")}`}
                  className="flex items-center gap-1.5 text-navy font-semibold text-sm"
                >
                  <PhoneIcon /> {t("contacto.telefone")}
                </a>
                <div
                  className="flex gap-1.5"
                  role="list"
                  aria-label="Redes sociais"
                >
                  {Object.entries(SOCIAL_PATHS).map(([name, d]) => (
                    <a
                      key={name}
                      role="listitem"
                      href={socials[name.toLowerCase()]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${name} da ${t("hero.titulo")}`}
                      className="w-8 h-8 rounded-lg bg-cream-dark text-navy flex items-center justify-center transition-colors hover:bg-navy hover:text-cream"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d={d} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </address>

            {/* Stats */}
            <dl className="flex gap-8 mt-8 animate-fadeUp [animation-delay:.35s]">
              {stats.map(([n, l], i) => (
                <div key={i}>
                  <dt className="sr-only">{l}</dt>
                  <dd
                    className="text-2xl font-extrabold text-navy tracking-tight"
                    aria-label={`${n} ${l}`}
                  >
                    {n}
                    <span
                      aria-hidden="true"
                      className="block text-[11px] text-ink-faint font-semibold tracking-wider uppercase mt-0.5"
                    >
                      {l.split(" ")[0]}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* DIREITA — widget de marcação */}
        <div className="order-1 lg:order-2 flex flex-col justify-center bg-cream-dark px-5 sm:px-10 lg:px-12 py-7 lg:py-12">
          <div className="w-full max-w-[480px] mx-auto bg-paper border border-line rounded-xl2 p-6 sm:p-7 shadow-lift animate-fadeUp [animation-delay:.1s]">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  aria-hidden="true"
                  className="inline-block w-8 h-0.5 bg-maroon rounded-full"
                />
                <span
                  aria-hidden="true"
                  className="text-[11px] font-bold tracking-[0.1em] uppercase text-maroon"
                >
                  {t("home.booking.eyebrow")}
                </span>
              </div>
              <h2 className="text-[22px] font-extrabold text-navy tracking-tight leading-tight">
                {t("home.booking.titulo")}
                <br />
                {t("home.booking.subtitulo")}
              </h2>
            </div>
            <BookingWidget
              user={user}
              onRequireLogin={onRequireLogin}
              onBooked={() => {}}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
