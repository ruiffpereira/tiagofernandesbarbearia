import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../AuthContext.jsx";
import { useCms } from "../context/CmsContext.jsx";
import { profileFormSchema, firstZodError } from "../lib/formSchemas.ts";
import {
  useGetBookingMyAppointments,
  getBookingMyAppointmentsQueryKey,
  usePatchBookingAppointmentCancel,
} from "../servers/booking/index.ts";
import BookingCard from "../components/BookingCard.jsx";
import { Button, Spinner, Label, Input } from "../components/ui.jsx";
import { errMsg } from "../lib/errors.js";
import { useNewsletterText } from "../components/NewsletterConsent.jsx";
import {
  useGetWebsitesCustomersNewsletter,
  usePutWebsitesCustomersNewsletter,
  getWebsitesCustomersNewsletterQueryKey,
} from "../servers/customers/index.ts";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function DashboardPage() {
  const { user, logout, updateProfile } = useAuth();
  const { t } = useCms();
  const navigate = useNavigate();
  const qc = useQueryClient();
  // Novidades por email: estado + (re)subscrever / anular
  const nlText = useNewsletterText();
  const { data: nl } = useGetWebsitesCustomersNewsletter({ query: { retry: false } });
  const [nlErr, setNlErr] = useState("");
  const nlM = usePutWebsitesCustomersNewsletter({
    mutation: {
      onSuccess: (data) => {
        setNlErr("");
        qc.setQueryData(getWebsitesCustomersNewsletterQueryKey(), data);
      },
      onError: (e) => setNlErr(errMsg(e, t)),
    },
  });

  const {
    data: upcoming = [],
    isLoading: loadingUp,
    isError: errorUp,
  } = useGetBookingMyAppointments(
    { status: "upcoming" },
    { query: { enabled: !!user, staleTime: 0, refetchOnMount: "always" } },
  );

  const { data: past = [], isLoading: loadingPast } =
    useGetBookingMyAppointments(
      { status: "past" },
      { query: { enabled: !!user, staleTime: 0, refetchOnMount: "always" } },
    );

  const [cancelId, setCancelId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    nif: user.nif || "",
    wantsInvoice: user.wantsInvoice ?? false,
    currentPassword: "",
  });
  // A password actual só é pedida quando o email muda
  const emailChanged =
    editForm.email.trim().toLowerCase() !== (user.email || "").trim().toLowerCase();
  const [editLoading, setEditLoading] = useState(false);
  const [editErr, setEditErr] = useState("");
  const [editOk, setEditOk] = useState(false);

  const cancelDialogRef = useRef(null);
  const cancelTriggerRef = useRef(null);

  // Gestão de foco no modal de cancelamento
  useEffect(() => {
    if (!cancelId) return;
    const el = cancelDialogRef.current;
    if (!el) return;

    const prev = document.activeElement;
    const focusable = el.querySelectorAll(FOCUSABLE);
    if (focusable.length) focusable[0].focus();

    function trapFocus(e) {
      if (e.key === "Escape") {
        setCancelId(null);
        return;
      }
      if (e.key !== "Tab") return;
      const els = Array.from(el.querySelectorAll(FOCUSABLE));
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", trapFocus);
      prev?.focus();
    };
  }, [cancelId]);

  const cancelM = usePatchBookingAppointmentCancel({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: getBookingMyAppointmentsQueryKey({ status: "upcoming" }),
        });
        qc.invalidateQueries({
          queryKey: getBookingMyAppointmentsQueryKey({ status: "past" }),
        });
        setCancelId(null);
      },
      onError: () => alert(t("cancel.erro") || "Erro ao cancelar. Tenta novamente."),
    },
  });

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setEditErr("");
    setEditOk(false);
    const r = profileFormSchema.safeParse({
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      nif: editForm.nif || "",
    });
    if (!r.success) {
      setEditErr(firstZodError(r.error, t));
      return;
    }
    if (emailChanged && !editForm.currentPassword) {
      setEditErr(errMsg({ response: { data: { code: "CURRENT_PASSWORD_REQUIRED" } } }, t));
      return;
    }
    setEditLoading(true);
    try {
      await updateProfile({
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        nif: editForm.nif || null,
        wantsInvoice: editForm.wantsInvoice,
        ...(emailChanged && { currentPassword: editForm.currentPassword }),
      });
      setEditForm((f) => ({ ...f, currentPassword: "" }));
      setEditOk(true);
      setEditing(false);
    } catch (e) {
      setEditErr(errMsg(e, t));
    } finally {
      setEditLoading(false);
    }
  }

  const barberName = t("dashboard.barbeiro") || "Tiago Fernandes";

  const account = [
    [t("ui.nome"), user.name],
    [t("ui.email"), user.email],
    [t("ui.telemovel"), user.phone || "—"],
    [t("ui.nif"), user.nif || "—"],
    [
      t("dashboard.contribuinte.label") || "Fatura com contribuinte",
      user.wantsInvoice ? (t("ui.sim") || "Sim") : (t("ui.nao") || "Não"),
    ],
  ];

  return (
    <main aria-label={t("nav.conta")} className="min-h-[calc(100vh-64px)]">
      <header className="bg-cream-dark border-b border-line px-5 sm:px-10 lg:px-16 py-7">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/")}
            aria-label={t("a11y.voltar_inicio") || "Voltar à página inicial"}
            className="text-ink-faint text-[13px] font-medium mb-3.5 inline-flex items-center gap-1.5"
          >
            <span aria-hidden="true">←</span> {t("ui.voltar")}
          </button>
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <h1 className="text-[clamp(22px,3vw,32px)] font-extrabold text-navy tracking-tight">
                {t("dashboard.ola")}{" "}
                <span className="text-maroon">{user.name.split(" ")[0]}</span>
              </h1>
              <p className="text-ink-faint text-[13px] mt-1">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => navigate("/")}>
                {t("dashboard.nova_marcacao")}
              </Button>
              <Button
                variant="surface"
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
              >
                {t("ui.sair")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 sm:px-10 lg:px-16 py-7 lg:py-10">
        {/* Próximas marcações */}
        <section aria-labelledby="upcoming-heading" className="mb-10">
          <div className="flex items-center gap-2.5 mb-1.5">
            <h2 id="upcoming-heading" className="text-xl font-bold text-navy">
              {t("dashboard.proximas.titulo")}
            </h2>
            {upcoming.length > 0 && (
              <span
                aria-label={`${upcoming.length} ${t("dashboard.proximas.titulo").toLowerCase()}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold
                tracking-wider uppercase bg-emerald-500/15 text-emerald-600"
              >
                {upcoming.length}
              </span>
            )}
          </div>
          <p className="text-ink-faint text-[13px] mb-4" aria-live="polite">
            {upcoming.length === 0 && !loadingUp
              ? t("dashboard.nenhuma")
              : t("dashboard.pode_cancelar")}
          </p>

          {loadingUp ? (
            <div
              className="flex justify-center py-8"
              aria-label={t("dashboard.carregando")}
              role="status"
            >
              <Spinner />
            </div>
          ) : errorUp ? (
            <div
              role="alert"
              className="bg-maroon/[0.08] border border-maroon/25 rounded-[10px] px-3.5 py-2.5 text-maroon text-[13px]"
            >
              {t("dashboard.erro") || "Erro ao carregar."}{" "}
              {t("dashboard.erro.reload") || "Recarrega a página."}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="bg-paper border-[1.5px] border-dashed border-line-strong rounded-xl2 py-10 px-6 text-center">
              <div aria-hidden="true" className="text-3xl mb-2.5 opacity-40">
                📅
              </div>
              <p className="text-ink-faint mb-4 text-sm">{t("dashboard.sem_marcacoes")}</p>
              <Button variant="primary" size="sm" onClick={() => navigate("/")}>
                {t("dashboard.marcar_agora")}
              </Button>
            </div>
          ) : (
            <div
              className="flex flex-col gap-2.5"
              role="list"
              aria-label={t("dashboard.proximas.titulo")}
            >
              {upcoming.map((b) => (
                <BookingCard
                  key={b.appointmentId}
                  booking={normalise(b, barberName)}
                  onCancel={() => {
                    cancelTriggerRef.current = document.activeElement;
                    setCancelId(b.cancelToken);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Histórico */}
        {(past.length > 0 || loadingPast) && (
          <section aria-labelledby="history-heading" className="mb-10">
            <h2
              id="history-heading"
              className="text-xl font-bold text-navy mb-1.5"
            >
              {t("dashboard.historico.titulo")}
            </h2>
            {loadingPast ? (
              <div
                className="flex justify-center py-4"
                aria-label={t("dashboard.historico.carregando")}
                role="status"
              >
                <Spinner />
              </div>
            ) : (
              <>
                <p className="text-ink-faint text-[13px] mb-4">
                  {past.length} {t("dashboard.historico.contagem")}
                </p>
                <div
                  className="flex flex-col gap-2.5"
                  role="list"
                  aria-label={t("dashboard.historico.titulo")}
                >
                  {past.map((b) => (
                    <BookingCard
                      key={b.appointmentId}
                      booking={normalise(b, barberName)}
                      isPast
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* Novidades por email (consentimento RGPD) */}
        <section aria-labelledby="newsletter-heading" className="bg-paper border border-line rounded-xl2 p-6 mb-10">
          <h2 id="newsletter-heading" className="text-[17px] font-bold text-navy mb-2">
            {t("newsletter.perfil.titulo") || "Receber novidades por email"}
          </h2>
          {nl?.blocked ? (
            <p className="text-ink-soft text-[13px]">
              {t("newsletter.perfil.bloqueado") || "Não é possível subscrever este email. Contacta-nos se precisares de ajuda."}
            </p>
          ) : nl ? (
            <>
              <p className="text-ink-soft text-[13px] mb-3" role="status">
                {nl.subscribed
                  ? t("newsletter.perfil.ativo") || "Estás subscrito. Recebes novidades e promoções por email."
                  : nl.status === "unsubscribed" || nl.status === "unsubscribed_by_user"
                    ? t("newsletter.perfil.anulou") || "Anulaste a subscrição. Podes voltar a subscrever quando quiseres."
                    : t("newsletter.perfil.inativo") || "Não estás subscrito."}
              </p>
              {!nl.subscribed && (
                <p className="text-ink-faint text-[12.5px] leading-snug mb-3">
                  {nlText}{" "}
                  <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-navy">
                    {t("newsletter.privacidade") || "Política de Privacidade"}
                  </a>
                </p>
              )}
              {nlErr && <div role="alert" className="text-maroon text-[13px] mb-3">{nlErr}</div>}
              <Button
                variant={nl.subscribed ? "ghost" : "primary"}
                size="sm"
                disabled={nlM.isPending}
                aria-busy={nlM.isPending}
                onClick={() =>
                  nlM.mutate({ data: nl.subscribed ? { subscribed: false } : { subscribed: true, consentText: nlText } })
                }
              >
                {nlM.isPending ? <Spinner /> : nl.subscribed
                  ? t("newsletter.perfil.anular") || "Anular subscrição"
                  : t("newsletter.perfil.subscrever") || "Quero receber novidades"}
              </Button>
            </>
          ) : null}
        </section>

        {/* Dados da conta */}
        <section
          aria-labelledby="account-heading"
          className="bg-paper border border-line rounded-xl2 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              id="account-heading"
              className="text-[17px] font-bold text-navy"
            >
              {t("dashboard.conta.titulo")}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={editing}
              onClick={() => {
                setEditing(!editing);
                setEditErr("");
                setEditOk(false);
              }}
            >
              {editing ? t("ui.cancelar") : t("ui.editar")}
            </Button>
          </div>

          {editOk && !editing && (
            <div
              role="status"
              aria-live="polite"
              className="mb-4 px-3.5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-[10px] text-emerald-400 text-[13px]"
            >
              {t("dashboard.sucesso")}
            </div>
          )}

          {editing ? (
            <form
              onSubmit={handleUpdateProfile}
              className="flex flex-col gap-3.5"
              noValidate
              aria-describedby={editErr ? "edit-error" : undefined}
            >
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-name">{t("ui.nome")}</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, name: e.target.value }))
                    }
                    aria-required="true"
                    autoComplete="name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-email">{t("ui.email")}</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, email: e.target.value }))
                    }
                    aria-required="true"
                    autoComplete="email"
                  />
                </div>
                {emailChanged && (
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="edit-current-password">
                      {t("dashboard.passwordActual.label") || "Password actual"}
                    </Label>
                    <Input
                      id="edit-current-password"
                      type="password"
                      value={editForm.currentPassword}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, currentPassword: e.target.value }))
                      }
                      aria-required="true"
                      autoComplete="current-password"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-phone">{t("ui.telemovel")}</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    placeholder={t("auth.telemovel.placeholder") || "+351 9XX XXX XXX"}
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    aria-required="true"
                    autoComplete="tel"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-nif">{t("ui.nif")}</Label>
                  <Input
                    id="edit-nif"
                    placeholder={t("dashboard.nif.placeholder") || "000000000"}
                    maxLength={9}
                    value={editForm.nif}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        nif: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-line px-3.5 py-3">
                <div>
                  <span className="block text-[14px] font-medium text-navy">
                    {t("dashboard.contribuinte.label") || "Quero fatura com contribuinte"}
                  </span>
                  <span className="block text-[12px] text-ink-soft mt-0.5">
                    {t("dashboard.contribuinte.hint") || "Emitir as faturas com o meu NIF."}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={editForm.wantsInvoice}
                  aria-label={t("dashboard.contribuinte.label") || "Quero fatura com contribuinte"}
                  onClick={() => setEditForm((f) => ({ ...f, wantsInvoice: !f.wantsInvoice }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 ${editForm.wantsInvoice ? "bg-navy" : "bg-line-strong"}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-paper shadow transition-transform ${editForm.wantsInvoice ? "translate-x-[22px]" : "translate-x-0.5"}`}
                  />
                </button>
              </div>
              {editErr && (
                <div
                  id="edit-error"
                  role="alert"
                  aria-live="assertive"
                  className="bg-maroon/[0.08] border border-maroon/25 rounded-[10px] px-3.5 py-2.5 text-maroon text-[13px]"
                >
                  {editErr}
                </div>
              )}
              <Button
                variant="primary"
                type="submit"
                disabled={editLoading}
                aria-disabled={editLoading}
                aria-busy={editLoading}
                className="self-start"
              >
                {editLoading ? (
                  <>
                    <Spinner /> {t("ui.a_guardar")}
                  </>
                ) : (
                  t("ui.guardar")
                )}
              </Button>
            </form>
          ) : (
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5">
              {account.map(([k, v]) => (
                <div
                  key={k}
                  className="bg-paper rounded-[10px] px-3.5 py-3 border border-line"
                >
                  <dt className="text-ink-faint text-[10px] font-bold tracking-wider uppercase mb-1">
                    {k}
                  </dt>
                  <dd className="text-ink text-sm font-medium break-all">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      </div>

      {/* Modal de confirmação de cancelamento */}
      {cancelId && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9000] p-4"
          onClick={() => setCancelId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-dialog-title"
            ref={cancelDialogRef}
            className="bg-paper rounded-2xl p-6 max-w-sm w-full shadow-lift border border-line"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="cancel-dialog-title"
              className="text-lg font-bold text-navy mb-2"
            >
              {t("dashboard.cancelar_dialog.titulo")}
            </h3>
            <p
              className="text-ink-soft text-sm leading-relaxed mb-5"
              id="cancel-dialog-desc"
            >
              {t("dashboard.cancelar_dialog.texto")}
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                className="flex-1"
                disabled={cancelM.isPending}
                aria-disabled={cancelM.isPending}
                aria-busy={cancelM.isPending}
                aria-describedby="cancel-dialog-desc"
                onClick={() => cancelM.mutate({ cancelToken: cancelId })}
              >
                {cancelM.isPending ? (
                  <>
                    <Spinner /> {t("ui.a_cancelar")}
                  </>
                ) : (
                  t("dashboard.cancelar_dialog.sim")
                )}
              </Button>
              <Button
                variant="surface"
                className="flex-1"
                onClick={() => setCancelId(null)}
              >
                {t("dashboard.cancelar_dialog.nao")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function normalise(b, barberName) {
  return {
    id: b.appointmentId,
    // A API devolve serviceName/servicePrice/duration soltos (MyAppointment), não um objecto service.
    serviceName: b.serviceName ?? "—",
    servicePrice: Number(b.servicePrice ?? 0),
    date: b.date,
    time: b.time,
    status: b.status,
    cancelToken: b.cancelToken,
    notes: b.notes,
    // Profissional da marcação quando existir; senão o nome fixo do CMS.
    barberName: b.staff?.name || barberName,
    duration: b.duration ?? undefined,
  };
}
