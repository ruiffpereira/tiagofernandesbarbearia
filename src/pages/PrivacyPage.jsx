import { useCms } from "../context/CmsContext.jsx";

/**
 * Página "Política de Privacidade" (/privacidade) — RGPD.
 *
 * O conteúdo é editável no CMS e multilíngua:
 *  - `privacy.title`   → título (fallback PT);
 *  - `privacy.content` → corpo; se o tenant o preencher, é esse que aparece
 *    (na língua atual, fallback PT do CMS).
 * Se o tenant ainda NÃO tiver `privacy.content`, mostramos o texto-base RGPD, em que
 * cada título/parágrafo/item é uma chave `privacy.*` (texto simples, na língua atual)
 * com `{{negocio}}` e `{{contacto}}` interpolados. A estrutura (h2, ul, b) fica aqui;
 * só o texto vem do CMS. O fallback PT está em `PT` (nunca fica vazia).
 */
const PT = {
  "privacy.title": "Política de Privacidade",
  "privacy.updated_label": "Última atualização",
  "privacy.updated": "junho de 2026",
  "privacy.negocio_fallback": "o estabelecimento",
  "privacy.contacto.com_email": "através de {{email}}",
  "privacy.contacto.sem_email": "através dos contactos disponíveis neste site",
  "privacy.intro":
    "A sua privacidade é importante para {{negocio}}. Esta política explica que dados pessoais recolhemos quando usa este site para marcar serviços ou gerir a sua conta, para que os usamos e quais os seus direitos ao abrigo do Regulamento Geral sobre a Proteção de Dados (RGPD).",
  "privacy.s1.titulo": "1. Responsável pelo tratamento",
  "privacy.s1.texto":
    "{{negocio}} é o responsável pelo tratamento dos seus dados pessoais. Pode contactar-nos {{contacto}} para qualquer questão relacionada com privacidade.",
  "privacy.s2.titulo": "2. Que dados recolhemos",
  "privacy.s2.item1.label": "Identificação e contacto:",
  "privacy.s2.item1.texto": "nome, email e telemóvel que indica ao marcar ou ao criar conta.",
  "privacy.s2.item2.label": "Marcações:",
  "privacy.s2.item2.texto": "serviço, data, hora e notas das suas marcações.",
  "privacy.s2.item3.label": "Conta:",
  "privacy.s2.item3.texto": "palavra-passe (guardada de forma cifrada) e preferências.",
  "privacy.s2.item4.label": "Estatísticas de utilização:",
  "privacy.s2.item4.texto": "dados agregados e anónimos de visita ao site (ver secção Cookies).",
  "privacy.s3.titulo": "3. Para que usamos os dados",
  "privacy.s3.item1": "Gerir e confirmar as suas marcações;",
  "privacy.s3.item2": "Enviar confirmações, alterações e lembretes por email;",
  "privacy.s3.item3": "Gerir a sua conta e o histórico de serviços;",
  "privacy.s3.item4": "Melhorar o site através de estatísticas agregadas.",
  "privacy.s4.titulo": "4. Base legal",
  "privacy.s4.texto":
    "Tratamos os seus dados para a execução do contrato (a marcação que solicita), com base no seu consentimento (cookies não essenciais e comunicações opcionais) e no nosso interesse legítimo em manter o serviço seguro e funcional.",
  "privacy.s5.titulo": "5. Cookies e estatísticas",
  "privacy.s5.texto":
    "Usamos apenas cookies essenciais ao funcionamento do site. Para estatísticas usamos uma ferramenta sem cookies e anónima (Umami, auto-hospedado), que não rastreia os visitantes entre sites nem cria perfis individuais. Pode gerir as suas preferências no banner de cookies.",
  "privacy.s6.titulo": "6. Adicionar marcações ao calendário",
  "privacy.s6.texto":
    "Se optar por subscrever as suas marcações no calendário do telemóvel, geramos um link privado (.ics) com as suas próximas marcações. O link é pessoal — não o partilhe. Pode deixar de o usar a qualquer momento removendo a subscrição no seu calendário.",
  "privacy.s7.titulo": "7. Conservação dos dados",
  "privacy.s7.texto":
    "Conservamos os seus dados enquanto a sua conta existir ou enquanto forem necessários para as finalidades acima. Pode pedir a eliminação a qualquer momento (ver os seus direitos).",
  "privacy.s8.titulo": "8. Os seus direitos",
  "privacy.s8.texto":
    "Tem direito a aceder, retificar, eliminar e exportar (portabilidade) os seus dados, bem como a opor-se ou limitar o seu tratamento. Para exercer estes direitos, contacte-nos {{contacto}}. Tem ainda o direito de apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD).",
  "privacy.s9.titulo": "9. Subcontratantes",
  "privacy.s9.texto":
    "Para prestar o serviço recorremos a fornecedores que tratam dados em nosso nome (alojamento da aplicação e envio de emails), sujeitos a obrigações de confidencialidade e segurança. Os dados não são vendidos a terceiros.",
  "privacy.s10.titulo": "10. Alterações a esta política",
  "privacy.s10.texto":
    "Podemos atualizar esta política. A data da última atualização é indicada no topo desta página.",
};

/** Substitui {{chave}} pelos valores dados. */
function fill(text, vars = {}) {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.split(`{{${k}}}`).join(v),
    text,
  );
}

export default function PrivacyPage() {
  const { t } = useCms();
  const tx = (key, vars) => fill(t(key) || PT[key] || "", vars);

  const negocio = t("hero.titulo") || tx("privacy.negocio_fallback");
  const email = t("contacto.email") || t("contact.email") || "";
  const updated = tx("privacy.updated");
  const custom = t("privacy.content"); // override do tenant

  return (
    <main
      aria-label={tx("privacy.title")}
      className="px-5 sm:px-10 lg:px-16 py-10 lg:py-16 min-h-[calc(100vh-64px)]"
    >
      <article className="max-w-3xl mx-auto">
        <h1 className="text-[clamp(26px,4vw,40px)] font-extrabold text-navy tracking-tight mb-2 leading-tight">
          {tx("privacy.title")}
        </h1>
        <p className="text-ink-faint text-[13px] mb-8">
          {tx("privacy.updated_label")}: {updated}
        </p>

        {custom ? (
          // Conteúdo do CMS (autorado pelo tenant, sanitizado no servidor).
          <div
            className="space-y-4 text-ink-soft text-[15px] leading-relaxed [&_h2]:text-navy [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-7 [&_h2]:mb-2 [&_a]:text-maroon [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
            dangerouslySetInnerHTML={{ __html: custom }}
          />
        ) : (
          <DefaultPolicy negocio={negocio} email={email} tx={tx} />
        )}
      </article>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-7">
      <h2 className="text-navy font-bold text-lg mb-2">{title}</h2>
      <div className="text-ink-soft text-[15px] leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}

function DefaultPolicy({ negocio, email, tx }) {
  const contacto = email
    ? tx("privacy.contacto.com_email", { email })
    : tx("privacy.contacto.sem_email");
  const vars = { negocio, contacto };

  // Secção com um único parágrafo.
  const simple = (n) => (
    <Section title={tx(`privacy.s${n}.titulo`)}>
      <p>{tx(`privacy.s${n}.texto`, vars)}</p>
    </Section>
  );

  return (
    <div>
      <p className="text-ink-soft text-[15px] leading-relaxed mb-6">
        {tx("privacy.intro", vars)}
      </p>

      {simple(1)}

      <Section title={tx("privacy.s2.titulo")}>
        <ul className="list-disc pl-5 space-y-1">
          {[1, 2, 3, 4].map((i) => (
            <li key={i}>
              <b>{tx(`privacy.s2.item${i}.label`)}</b>{" "}
              {tx(`privacy.s2.item${i}.texto`)}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={tx("privacy.s3.titulo")}>
        <ul className="list-disc pl-5 space-y-1">
          {[1, 2, 3, 4].map((i) => (
            <li key={i}>{tx(`privacy.s3.item${i}`)}</li>
          ))}
        </ul>
      </Section>

      {[4, 5, 6, 7, 8, 9, 10].map((n) => (
        <div key={n}>{simple(n)}</div>
      ))}
    </div>
  );
}
