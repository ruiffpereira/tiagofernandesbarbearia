import { useState, useEffect, useRef, useCallback } from "react";
import { useCms } from "../context/CmsContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { Spinner } from "./ui.jsx";
import {
  openMyConversation,
  getMyConversationMessages,
  getMyUnreadMessages,
  sendMyMessage,
  readMyConversation,
  uploadMyMessageImage,
  uploadMyMessagePdf,
} from "../servers/customers/index.ts";

const MAX_BODY = 2000;
const MAX_ATTACH = 5;
const UNREAD_POLL_MS = 60_000;
const THREAD_POLL_MS = 5_000;
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Só links http(s): nunca javascript:/data: vindos de uma mensagem.
function safeUrl(u) {
  try {
    const p = new URL(u, window.location.origin).protocol;
    return p === "http:" || p === "https:" ? u : null;
  } catch {
    return null;
  }
}

// Junta por messageId e ordena por data (o polling pode repetir mensagens).
function merge(prev, next) {
  const map = new Map(prev.map((m) => [m.messageId, m]));
  next.forEach((m) => map.set(m.messageId, m));
  return [...map.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

const isVisible = () => document.visibilityState === "visible";

export default function ChatWidget({ user, open, onOpen, onClose, onRequireLogin }) {
  const { t } = useCms();
  const { currentLang } = useLanguage();
  const tt = (k, fb) => t(k) || fb;

  const [unread, setUnread] = useState(0);
  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]); // anexos já carregados
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const panelRef = useRef(null);
  const listRef = useRef(null);
  const fileRef = useRef(null);
  const stick = useRef(true); // colar ao fundo quando chegam mensagens
  const lastAt = useRef(null);
  const triggerRef = useRef(null);

  const errText = useCallback(
    (e, kind) => {
      const s = e?.response?.status;
      const code = e?.response?.data?.code;
      if (s === 429) return t("chat.erro.limite") || "Demasiadas mensagens. Espera um momento e tenta de novo.";
      if (s === 503) return t("chat.erro.indisponivel") || "Serviço indisponível de momento. Tenta mais tarde.";
      if (s === 400 && kind === "upload") return t("chat.erro.anexo") || "Anexo inválido. Usa uma foto (JPG, PNG, WebP) ou um PDF.";
      if (s === 400 && code === "MESSAGE_INVALID") return t("chat.erro.longa") || "A mensagem é demasiado longa.";
      if (s === 400) return t("chat.erro.mensagem") || "Não foi possível enviar a mensagem. Verifica o texto e os anexos.";
      return t("chat.erro.generico") || "Ocorreu um erro. Tenta novamente.";
    },
    [t],
  );

  // Contador de não lidas (polling leve, só com a página visível).
  useEffect(() => {
    if (!user || open) return;
    let stop = false;
    const pull = () => {
      if (!isVisible()) return;
      getMyUnreadMessages()
        .then((r) => !stop && setUnread(r?.unread ?? 0))
        .catch(() => {});
    };
    pull();
    const id = setInterval(pull, UNREAD_POLL_MS);
    document.addEventListener("visibilitychange", pull);
    return () => {
      stop = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", pull);
    };
  }, [user, open]);

  // Sem conta: limpa tudo.
  useEffect(() => {
    if (!user) {
      setUnread(0);
      setConvId(null);
      setMessages([]);
      setFiles([]);
      setText("");
      lastAt.current = null;
    }
  }, [user]);

  const markRead = useCallback((id) => {
    readMyConversation(id).then(() => setUnread(0)).catch(() => {});
  }, []);

  // Abrir: obtém a conversa, carrega o fio, marca lida.
  useEffect(() => {
    if (!open || !user) return;
    let stop = false;
    setErr("");
    setLoading(true);
    (async () => {
      try {
        const conv = await openMyConversation();
        if (stop) return;
        setConvId(conv.conversationId);
        const th = await getMyConversationMessages(conv.conversationId);
        if (stop) return;
        stick.current = true;
        setMessages(merge([], th.messages ?? []));
        setHasMore(!!th.hasMore);
        if ((th.unread ?? 0) > 0 || conv.unread > 0) markRead(conv.conversationId);
        else setUnread(0);
      } catch (e) {
        if (!stop) setErr(errText(e));
      } finally {
        if (!stop) setLoading(false);
      }
    })();
    return () => {
      stop = true;
    };
  }, [open, user, markRead, errText]);

  useEffect(() => {
    lastAt.current = messages.length ? messages[messages.length - 1].createdAt : null;
  }, [messages]);

  // Polling do fio: só com o painel aberto e a página visível.
  useEffect(() => {
    if (!open || !user || !convId) return;
    let busy = false;
    const tick = async () => {
      if (!isVisible() || busy) return;
      busy = true;
      try {
        const th = await getMyConversationMessages(
          convId,
          lastAt.current ? { after: lastAt.current } : undefined,
        );
        const fresh = th.messages ?? [];
        if (fresh.length) {
          setMessages((p) => merge(p, fresh));
          if (fresh.some((m) => m.senderRole === "business")) markRead(convId);
        }
      } catch {
        /* falha de rede: tenta no próximo ciclo */
      } finally {
        busy = false;
      }
    };
    const id = setInterval(tick, THREAD_POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [open, user, convId, markRead]);

  // Cola ao fundo quando entram mensagens novas.
  useEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  // Foco preso, Esc fecha, devolve o foco ao botão.
  useEffect(() => {
    if (!open) return;
    const el = panelRef.current;
    const prev = document.activeElement;
    el?.querySelector("textarea")?.focus();
    const lockScroll = window.matchMedia("(max-width: 1023px)").matches;
    const prevOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = "hidden";
    function onKey(e) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !el) return;
      const els = Array.from(el.querySelectorAll(FOCUSABLE));
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, [open, onClose]);

  async function loadMore() {
    if (!convId || !messages.length || loadingMore) return;
    const el = listRef.current;
    const prevH = el?.scrollHeight ?? 0;
    setLoadingMore(true);
    try {
      const th = await getMyConversationMessages(convId, { before: messages[0].createdAt });
      stick.current = false;
      setMessages((p) => merge(p, th.messages ?? []));
      setHasMore(!!th.hasMore);
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - prevH;
      });
    } catch (e) {
      setErr(errText(e));
    } finally {
      setLoadingMore(false);
    }
  }

  async function pickFiles(e) {
    const chosen = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!chosen.length) return;
    setErr("");
    const room = MAX_ATTACH - files.length;
    if (room <= 0) { setErr(t("chat.erro.max_anexos") || "Máximo de 5 anexos por mensagem."); return; }
    setUploading(true);
    try {
      for (const f of chosen.slice(0, room)) {
        const isPdf = f.type === "application/pdf";
        const isImg = /^image\/(jpeg|png|webp)$/.test(f.type);
        if (!isPdf && !isImg) { setErr(t("chat.erro.anexo") || "Anexo inválido. Usa uma foto (JPG, PNG, WebP) ou um PDF."); continue; }
        if (f.size > (isPdf ? 20 : 10) * 1024 * 1024) {
          setErr(t("chat.erro.tamanho") || "Ficheiro demasiado grande (foto até 10 MB, PDF até 20 MB).");
          continue;
        }
        try {
          const att = isPdf ? await uploadMyMessagePdf({ file: f }) : await uploadMyMessageImage({ file: f });
          setFiles((p) => (p.length < MAX_ATTACH ? [...p, att] : p));
        } catch (er) {
          setErr(errText(er, "upload"));
        }
      }
    } finally {
      setUploading(false);
    }
  }

  async function send(e) {
    e?.preventDefault();
    const body = text.trim();
    if ((!body && !files.length) || sending || uploading || !convId) return;
    setSending(true);
    setErr("");
    try {
      const msg = await sendMyMessage(convId, {
        ...(body && { body }),
        ...(files.length && { attachments: files }),
      });
      stick.current = true;
      setMessages((p) => merge(p, [msg]));
      setText("");
      setFiles([]);
    } catch (er) {
      setErr(errText(er));
    } finally {
      setSending(false);
    }
  }

  function onScroll() {
    const el = listRef.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  const fmt = (iso) =>
    new Date(iso).toLocaleString(currentLang === "en" ? "en-GB" : "pt-PT", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });

  const label = user
    ? unread > 0
      ? `${tt("chat.abrir", "Abrir chat")} — ${unread} ${tt("chat.nao_lidas", "mensagens não lidas")}`
      : tt("chat.abrir", "Abrir chat")
    : tt("chat.entrar_cta", "Entra para falares connosco");

  return (
    <>
      {!open && (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => (user ? onOpen() : onRequireLogin())}
          aria-label={label}
          className="fixed right-4 z-[890] bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-6
            h-14 w-14 rounded-full bg-maroon text-white shadow-lift flex items-center justify-center
            hover:bg-maroon-light transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {user && unread > 0 && (
            <span aria-hidden="true" className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-electric text-white text-[11px] font-bold flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      )}

      {open && user && (
        <>
          <div className="fixed inset-0 z-[999] bg-black/60 lg:hidden" onClick={onClose} aria-hidden="true" />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={tt("chat.titulo", "Mensagens")}
            className="fixed z-[1000] inset-x-0 bottom-0 h-[85dvh] rounded-t-xl2
              lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-[380px] lg:h-[560px] lg:rounded-xl2
              bg-paper border border-line shadow-lift flex flex-col animate-fadeUp"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <h2 className="text-[16px] font-bold text-navy tracking-tight">{tt("chat.titulo", "Mensagens")}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={tt("ui.fechar", "Fechar")}
                className="w-8 h-8 rounded-full border border-line bg-paper text-ink-soft flex items-center justify-center hover:bg-cream-dark"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            <div
              ref={listRef}
              onScroll={onScroll}
              className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2"
              aria-live="polite"
            >
              {loading ? (
                <div className="m-auto"><Spinner dark /></div>
              ) : (
                <>
                  {hasMore && (
                    <button type="button" onClick={loadMore} disabled={loadingMore}
                      className="self-center text-xs font-semibold text-electric underline mb-1 disabled:opacity-50">
                      {tt("chat.mais_antigas", "Carregar mensagens anteriores")}
                    </button>
                  )}
                  {!messages.length && !err && (
                    <p className="m-auto text-sm text-ink-soft text-center px-4">
                      {tt("chat.vazio", "Escreve-nos a tua mensagem. Respondemos assim que possível.")}
                    </p>
                  )}
                  {messages.map((m) => {
                    const mine = m.senderRole === "customer";
                    return (
                      <div key={m.messageId} className={`max-w-[85%] ${mine ? "self-end" : "self-start"}`}>
                        <div className={`rounded-2xl px-3 py-2 text-sm break-words ${mine ? "bg-maroon text-white rounded-br-sm" : "bg-cream-dark text-ink rounded-bl-sm"}`}>
                          {m.body && <p className="whitespace-pre-wrap">{m.body}</p>}
                          {(m.attachments ?? []).map((a, i) => {
                            const url = safeUrl(a.url);
                            if (!url) return null;
                            const isImg = a.mime?.startsWith("image/");
                            return isImg ? (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block mt-1">
                                <img src={url} alt={a.name || tt("chat.foto", "Foto anexada")} loading="lazy"
                                  className="rounded-lg max-h-48 w-auto" />
                              </a>
                            ) : (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block mt-1 underline font-semibold">
                                {a.name || tt("chat.pdf", "Abrir PDF")}
                              </a>
                            );
                          })}
                        </div>
                        <p className={`text-[10px] text-ink-faint mt-0.5 ${mine ? "text-right" : ""}`}>{fmt(m.createdAt)}</p>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {err && <p role="alert" className="px-4 pb-1 text-xs text-maroon font-medium">{err}</p>}

            {files.length > 0 && (
              <ul className="px-4 pb-1 flex flex-wrap gap-1">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center gap-1 text-[11px] bg-cream-dark rounded-full pl-2 pr-1 py-0.5 max-w-[160px]">
                    <span className="truncate">{f.name || (f.mime === "application/pdf" ? "PDF" : tt("chat.foto", "Foto anexada"))}</span>
                    <button type="button" aria-label={tt("chat.remover_anexo", "Remover anexo")}
                      onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                      className="w-5 h-5 rounded-full hover:bg-black/10"><span aria-hidden="true">✕</span></button>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={send} className="border-t border-line p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-end gap-2">
              <input ref={fileRef} type="file" className="hidden" multiple
                accept="image/jpeg,image/png,image/webp,application/pdf" onChange={pickFiles} />
              <button type="button" onClick={() => fileRef.current?.click()}
                disabled={uploading || files.length >= MAX_ATTACH || !convId}
                aria-label={tt("chat.anexar", "Anexar foto ou PDF")}
                className="w-10 h-10 shrink-0 rounded-full border border-line text-ink-soft flex items-center justify-center hover:bg-cream-dark disabled:opacity-40">
                {uploading ? <Spinner dark /> : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                )}
              </button>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_BODY))}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) send(e); }}
                maxLength={MAX_BODY}
                rows={1}
                aria-label={tt("chat.escrever", "Escreve uma mensagem")}
                placeholder={tt("chat.escrever", "Escreve uma mensagem")}
                className="flex-1 resize-none max-h-28 rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-line-strong"
              />
              <button type="submit" disabled={sending || uploading || !convId || (!text.trim() && !files.length)}
                className="h-10 px-4 shrink-0 rounded-full bg-maroon text-white text-sm font-semibold disabled:opacity-40">
                {sending ? <Spinner /> : tt("chat.enviar", "Enviar")}
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}
