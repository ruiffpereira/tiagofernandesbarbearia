import * as Flags from "country-flag-icons/react/3x2";

// Mapa língua → país (ISO 3166). Mantido igual ao do backoffice para consistência visual.
const LANG_TO_COUNTRY = {
  pt: "PT", br: "BR", en: "GB", es: "ES", fr: "FR", de: "DE", it: "IT",
  nl: "NL", pl: "PL", ru: "RU", uk: "UA", zh: "CN", ja: "JP", ar: "SA",
  ro: "RO", hu: "HU", cs: "CZ", tr: "TR", sv: "SE", da: "DK", fi: "FI", nb: "NO",
};

/** Bandeira SVG real para um código de língua. Fallback: iniciais do código. */
export function LangFlag({ code, className = "h-4 w-6 rounded-sm object-cover" }) {
  const countryCode = LANG_TO_COUNTRY[code];
  const Flag = countryCode ? Flags[countryCode] : null;

  if (!Flag) {
    return (
      <span className="inline-flex items-center justify-center rounded-sm bg-line text-[9px] font-bold text-ink-soft w-6 h-4">
        {code.toUpperCase().slice(0, 2)}
      </span>
    );
  }

  return <Flag className={className} />;
}
