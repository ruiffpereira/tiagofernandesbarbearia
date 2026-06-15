import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import { useAuth } from "../AuthContext.jsx";
import { useCms } from "../context/CmsContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import {
  useGetBookingServices,
  useGetBookingSlots,
  usePostBookingAppointment,
  getBookingSlotsQueryKey,
  getBookingMyAppointmentsQueryKey,
} from "../servers/booking/index.ts";
import { nextWorkdays, fmtDate, fmtShort, langToLocale } from "../utils.js";
import { Button, Spinner, Label, Textarea } from "./ui.jsx";

// Loaders lazy dos locales do react-day-picker (1 chunk por locale, carregado on-demand).
// Cobre as línguas suportadas pela API; cai para pt se a língua não tiver locale.
const DP_LOADERS = {
  pt: () => import("react-day-picker/locale/pt"),
  br: () => import("react-day-picker/locale/pt-BR"),
  en: () => import("react-day-picker/locale/en-GB"),
  es: () => import("react-day-picker/locale/es"),
  fr: () => import("react-day-picker/locale/fr"),
  de: () => import("react-day-picker/locale/de"),
  it: () => import("react-day-picker/locale/it"),
  nl: () => import("react-day-picker/locale/nl"),
  pl: () => import("react-day-picker/locale/pl"),
  ru: () => import("react-day-picker/locale/ru"),
  uk: () => import("react-day-picker/locale/uk"),
  zh: () => import("react-day-picker/locale/zh-CN"),
  ja: () => import("react-day-picker/locale/ja"),
  ar: () => import("react-day-picker/locale/ar-SA"),
  ro: () => import("react-day-picker/locale/ro"),
  hu: () => import("react-day-picker/locale/hu"),
  cs: () => import("react-day-picker/locale/cs"),
  tr: () => import("react-day-picker/locale/tr"),
  sv: () => import("react-day-picker/locale/sv"),
  da: () => import("react-day-picker/locale/da"),
  fi: () => import("react-day-picker/locale/fi"),
  nb: () => import("react-day-picker/locale/nb"),
};

export default function BookingWidget({ onRequireLogin, onBooked }) {
  const { user } = useAuth();
  const { t } = useCms();
  const { currentLang } = useLanguage();
  const dateLocale = langToLocale(currentLang);
  const [dpLocale, setDpLocale] = useState(undefined);
  useEffect(() => {
    let cancelled = false;
    const load = DP_LOADERS[currentLang] ?? DP_LOADERS.pt;
    load()
      .then((mod) => {
        if (!cancelled) setDpLocale(Object.values(mod)[0]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [currentLang]);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [svc, setSvc] = useState(null);
  const [date, setDate] = useState(() => nextWorkdays(1)[0]);
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(null);
  const [err, setErr] = useState("");

  const { data: services = [], isLoading: loadingServices } =
    useGetBookingServices(
      { locale: currentLang },
      { query: { staleTime: 5 * 60 * 1000 } },
    );

  const { data: slotsData, isLoading: loadingSlots } = useGetBookingSlots(
    { date, serviceId: svc?.serviceId ?? "" },
    { query: { enabled: !!date && !!svc?.serviceId && !!user } },
  );

  const confirmM = usePostBookingAppointment({
    mutation: {
      onSuccess: (result) => {
        setDone({ ...result, serviceName: svc.name });
        qc.invalidateQueries({
          queryKey: getBookingSlotsQueryKey({ date, serviceId: svc.serviceId }),
        });
        qc.invalidateQueries({ queryKey: getBookingMyAppointmentsQueryKey({ status: 'upcoming' }) });
        onBooked?.();
      },
      onError: (e) => {
        setErr(e.message || t("auth.erro.generico"));
      },
    },
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [calMobile, setCalMobile] = useState(false);
  const calendarRef = useRef(null);
  const prevUserRef = useRef(user);

  useEffect(() => {
    if (!prevUserRef.current && user && step === 1 && svc) {
      setStep(2);
    }
    prevUserRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!showCalendar) return;
    document.body.style.overflow = "hidden";
    function onMousedown(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", onMousedown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", onMousedown);
    };
  }, [showCalendar]);

  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const quickDays = useMemo(() => nextWorkdays(3), []);
  const selectedDateObj = date ? new Date(date + "T12:00:00") : undefined;
  const dateIsQuick = quickDays.includes(date);

  function pickDate(d) {
    setDate(d);
    setSlot("");
    setShowCalendar(false);
    if (svc?.serviceId) {
      qc.invalidateQueries({
        queryKey: getBookingSlotsQueryKey({ date: d, serviceId: svc.serviceId }),
      });
    }
  }

  function handleCalendarSelect(d) {
    if (!d) return;
    pickDate(d.toISOString().split("T")[0]);
  }

  const free = Array.isArray(slotsData) ? slotsData : [];

  function next() {
    if (step === 1) {
      if (!svc) return;
      if (!user) {
        onRequireLogin?.();
        return;
      }
    }
    if (step === 2 && (!date || !slot)) return;
    setStep((s) => s + 1);
  }

  const back = () => {
    setStep((s) => Math.max(1, s - 1));
    setErr("");
  };

  function handleConfirm() {
    setErr("");
    confirmM.mutate({
      data: {
        serviceId: svc.serviceId,
        date,
        time: slot,
        notes: notes || undefined,
        clientName: user.name,
        clientEmail: user.email,
        clientPhone: user.phone,
      },
    });
  }

  function reset() {
    setStep(1);
    setSvc(null);
    setDate("");
    setSlot("");
    setNotes("");
    setDone(null);
    setErr("");
  }

  if (done) {
    return (
      <div className="text-center py-3 px-1 animate-fadeUp">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-emerald-500/10 border border-emerald-500/30
          flex items-center justify-center text-3xl text-emerald-600"
        >
          ✓
        </div>
        <h3 className="text-xl font-bold text-navy mb-2 tracking-tight">
          {t("booking.sucesso.titulo")}
        </h3>
        <p className="text-ink-soft text-sm mb-1">{done.serviceName}</p>
        <p className="text-ink-soft text-sm mb-2">
          {fmtDate(done.date, dateLocale)} · {done.time}
        </p>
        <p className="text-[12px] text-ink-faint mb-5">
          {t("booking.sucesso.mensagem")}
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
            {t("booking.sucesso.ver")}
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}>
            {t("booking.sucesso.nova")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Indicador de passos */}
      <div className="flex gap-1.5 mb-4 items-center">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all
              ${step >= n ? "bg-electric text-white" : "bg-paper text-ink-faint border-[1.5px] border-line"}`}
            >
              {n}
            </div>
            {n < 3 && (
              <div
                className={`w-6 h-0.5 transition-colors ${step > n ? "bg-electric" : "bg-line"}`}
              />
            )}
          </div>
        ))}
        <span className="ml-2.5 text-xs text-ink-faint font-medium">
          {step === 1 && t("booking.passo.1")}
          {step === 2 && t("booking.passo.2")}
          {step === 3 && t("booking.passo.3")}
        </span>
      </div>

      {/* Passo 1 — serviço */}
      {step === 1 && (
        <div className="animate-fadeUp">
          {loadingServices ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[calc(100dvh-26rem)] overflow-y-auto pr-1">
              {services
                .filter((s) => s.active !== false)
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((s) => {
                  const active = svc?.serviceId === s.serviceId;
                  return (
                    <button
                      key={s.serviceId}
                      onClick={() => {
                        setSvc(s);
                        if (!user) {
                          onRequireLogin?.();
                        } else {
                          setStep(2);
                        }
                      }}
                      className={`flex items-center gap-3 p-3 rounded-[10px] border-[1.5px] text-left w-full transition-all
                      ${active ? "bg-electric border-electric" : "bg-paper border-line hover:border-line-strong hover:bg-cream-dark"}`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${active ? "bg-white/70" : "bg-cream-dark"}`}
                      >
                        ✂️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-semibold text-sm ${active ? "text-white" : "text-ink"}`}
                        >
                          {s.name}
                        </div>
                        <div
                          className={`text-xs mt-0.5 ${active ? "text-white/70" : "text-ink-faint"}`}
                        >
                          {s.duration} min
                        </div>
                      </div>
                      <div
                        className={`font-bold text-[15px] shrink-0 ${active ? "text-white" : "text-navy"}`}
                      >
                        €{s.price}
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
          <Button
            variant="primary"
            disabled={!svc}
            onClick={next}
            className="w-full mt-4"
          >
            {t("ui.continuar")}
          </Button>
        </div>
      )}

      {/* Passo 2 — data e hora */}
      {step === 2 && (
        <div className="animate-fadeUp">
          <Label>{t("ui.data")}</Label>

          {/* Linha de atalhos + botão calendário */}
          <div className="relative mt-2 mb-1">
            <div className="flex gap-1.5">
              {quickDays.map((d) => {
                const f = fmtShort(d, dateLocale);
                const active = date === d;
                return (
                  <button
                    key={d}
                    onClick={() => pickDate(d)}
                    className={`flex-1 py-2 rounded-[10px] border-[1.5px] flex flex-col items-center gap-px transition-all
                      ${active ? "bg-electric border-electric text-white" : "bg-paper border-line text-ink hover:border-line-strong"}`}
                  >
                    <span className="text-[9px] font-semibold opacity-70 uppercase">
                      {f.day}
                    </span>
                    <span className="text-base font-bold leading-none">
                      {f.num}
                    </span>
                    <span className="text-[9px] font-semibold opacity-70 uppercase">
                      {f.mon}
                    </span>
                  </button>
                );
              })}

              {/* Botão calendário */}
              <button
                onClick={() => {
                  setCalMobile(window.innerWidth < 1024);
                  setShowCalendar((c) => !c);
                }}
                title={t("booking.data.outra")}
                className={`w-10 shrink-0 rounded-[10px] border-[1.5px] flex items-center justify-center transition-all
                  ${
                    showCalendar || (!dateIsQuick && date)
                      ? "bg-electric border-electric text-white"
                      : "bg-paper border-line text-ink-soft hover:border-line-strong hover:text-navy"
                  }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>
            </div>

            {/* Data seleccionada fora dos atalhos */}
            {date && !dateIsQuick && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[12px] font-medium text-electric">
                  {fmtDate(date, dateLocale)}
                </span>
                <button
                  onClick={() => {
                    setDate("");
                    setSlot("");
                  }}
                  className="text-ink-faint hover:text-navy text-[11px]"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Calendário */}
            {showCalendar &&
              (calMobile ? (
                /* Mobile/tablet — modal via portal (evita conflito com transforms) */
                createPortal(
                  <>
                    <div
                      className="fixed inset-0 z-[950] bg-black/70 animate-fadeIn"
                      onClick={() => setShowCalendar(false)}
                    />
                    <div
                      ref={calendarRef}
                      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[960]
                        bg-paper border border-line rounded-xl2 shadow-lift p-3 animate-fadeIn"
                    >
                      <DayPicker
                        mode="single"
                        locale={dpLocale}
                        selected={selectedDateObj}
                        onSelect={handleCalendarSelect}
                        fromDate={tomorrow}
                        disabled={[{ before: tomorrow }, { dayOfWeek: [0, 1] }]}
                      />
                    </div>
                  </>,
                  document.body,
                )
              ) : (
                /* Desktop — dropdown absoluto */
                <div
                  ref={calendarRef}
                  className="absolute top-full right-0 z-20 mt-1.5
                    rounded-[10px] border border-line bg-paper shadow-lift p-2"
                >
                  <DayPicker
                    mode="single"
                    locale={pt}
                    selected={selectedDateObj}
                    onSelect={handleCalendarSelect}
                    fromDate={tomorrow}
                    disabled={[{ before: tomorrow }, { dayOfWeek: [0, 1] }]}
                  />
                </div>
              ))}
          </div>

          {/* Horas disponíveis — altura fixa para não saltar ao trocar datas */}
          <div className="mt-3">
            <Label>{t("ui.hora")}</Label>
            <div className="mt-2 max-h-[calc(100dvh-34rem)] overflow-y-auto md:h-[148px] md:max-h-none">
              {!date ? (
                <p className="text-ink-faint text-[13px] p-3.5 text-center">
                  {t("booking.sem_data")}
                </p>
              ) : loadingSlots ? (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              ) : free.length === 0 ? (
                <p className="text-ink-faint text-[13px] p-3.5 text-center bg-paper rounded-[10px]">
                  {t("booking.sem_horarios")}
                </p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(68px,1fr))] gap-1.5 pr-0.5">
                  {free.map((sl) => (
                    <button
                      key={sl}
                      onClick={() => {
                        setSlot(sl);
                        setStep(3);
                      }}
                      className={`py-2.5 px-1 rounded-[10px] border-[1.5px] text-[13px] font-medium transition-all
                        ${slot === sl ? "bg-electric border-electric text-white" : "bg-paper border-line text-ink hover:border-line-strong"}`}
                    >
                      {sl}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="ghost" onClick={back}>
              {t("ui.voltar")}
            </Button>
            <Button
              variant="primary"
              disabled={!date || !slot}
              onClick={next}
              className="flex-1"
            >
              {t("ui.continuar")}
            </Button>
          </div>
        </div>
      )}

      {/* Passo 3 — confirmar */}
      {step === 3 && (
        <div className="animate-fadeUp">
          <div className="bg-paper rounded-[10px] p-4 border border-line mb-3.5">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[11px] text-ink-faint font-semibold tracking-wider uppercase">
                {t("booking.resumo.titulo")}
              </span>
              <span className="text-lg font-bold text-navy">€{svc.price}</span>
            </div>
            <div className="flex flex-col gap-1.5 text-[13.5px]">
              <div>
                <span className="text-ink-faint">{t("booking.resumo.servico")}</span>{" "}
                <span className="text-ink font-medium">{svc.name}</span>
              </div>
              <div>
                <span className="text-ink-faint">{t("booking.resumo.data")}</span>{" "}
                <span className="text-ink font-medium">{fmtDate(date, dateLocale)}</span>
              </div>
              <div>
                <span className="text-ink-faint">{t("booking.resumo.hora")}</span>{" "}
                <span className="text-ink font-medium">{slot}</span>
              </div>
              <div>
                <span className="text-ink-faint">{t("booking.resumo.cliente")}</span>{" "}
                <span className="text-ink font-medium">{user.name}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-3.5">
            <Label>{t("ui.notas_opcional")}</Label>
            <Textarea
              placeholder={t("ui.notas.placeholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {err && (
            <div className="bg-maroon/[0.08] border border-maroon/25 rounded-[10px] px-3.5 py-2.5 text-maroon text-[13px] mb-3">
              {err}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="ghost" onClick={back}>
              {t("ui.voltar")}
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={confirmM.isPending}
              className="flex-1"
            >
              {confirmM.isPending ? <Spinner /> : t("booking.confirmar")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
