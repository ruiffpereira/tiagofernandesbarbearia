import { useCms } from "../context/CmsContext.jsx";

/**
 * Página "Política de Privacidade" (/privacidade) — RGPD.
 *
 * O conteúdo é editável no CMS e multilíngua:
 *  - `privacy.title`   → título (fallback PT);
 *  - `privacy.content` → corpo em HTML/richtext; se o tenant o preencher, é esse
 *    que aparece (na língua atual, fallback PT do CMS).
 * Se o tenant ainda NÃO tiver conteúdo no CMS, mostramos um texto-base RGPD em PT
 * (estrutura completa) com o nome do negócio injetado — para a página nunca ficar
 * vazia nem o link do banner de cookies ficar partido.
 */
export default function PrivacyPage() {
  const { t } = useCms();
  const negocio = t("hero.titulo") || "o estabelecimento";
  const email = t("contacto.email") || t("contact.email") || "";
  const updated = t("privacy.updated") || "junho de 2026";
  const custom = t("privacy.content"); // override do tenant (HTML)

  return (
    <main
      aria-label={t("privacy.title") || "Política de Privacidade"}
      className="px-5 sm:px-10 lg:px-16 py-10 lg:py-16 min-h-[calc(100vh-64px)]"
    >
      <article className="max-w-3xl mx-auto">
        <h1 className="text-[clamp(26px,4vw,40px)] font-extrabold text-navy tracking-tight mb-2 leading-tight">
          {t("privacy.title") || "Política de Privacidade"}
        </h1>
        <p className="text-ink-faint text-[13px] mb-8">
          {t("privacy.updated_label") || "Última atualização"}: {updated}
        </p>

        {custom ? (
          // Conteúdo do CMS (autorado pelo tenant, sanitizado no servidor).
          <div
            className="space-y-4 text-ink-soft text-[15px] leading-relaxed [&_h2]:text-navy [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-7 [&_h2]:mb-2 [&_a]:text-maroon [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
            dangerouslySetInnerHTML={{ __html: custom }}
          />
        ) : (
          <DefaultPolicy negocio={negocio} email={email} />
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

function DefaultPolicy({ negocio, email }) {
  const contacto = email
    ? `através de ${email}`
    : "através dos contactos disponíveis neste site";
  return (
    <div>
      <p className="text-ink-soft text-[15px] leading-relaxed mb-6">
        A sua privacidade é importante para {negocio}. Esta política explica que
        dados pessoais recolhemos quando usa este site para marcar serviços ou
        gerir a sua conta, para que os usamos e quais os seus direitos ao abrigo
        do Regulamento Geral sobre a Proteção de Dados (RGPD).
      </p>

      <Section title="1. Responsável pelo tratamento">
        <p>
          {negocio} é o responsável pelo tratamento dos seus dados pessoais.
          Pode contactar-nos {contacto} para qualquer questão relacionada com
          privacidade.
        </p>
      </Section>

      <Section title="2. Que dados recolhemos">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <b>Identificação e contacto:</b> nome, email e telemóvel que indica
            ao marcar ou ao criar conta.
          </li>
          <li>
            <b>Marcações:</b> serviço, data, hora e notas das suas marcações.
          </li>
          <li>
            <b>Conta:</b> palavra-passe (guardada de forma cifrada) e
            preferências.
          </li>
          <li>
            <b>Estatísticas de utilização:</b> dados agregados e anónimos de
            visita ao site (ver secção Cookies).
          </li>
        </ul>
      </Section>

      <Section title="3. Para que usamos os dados">
        <ul className="list-disc pl-5 space-y-1">
          <li>Gerir e confirmar as suas marcações;</li>
          <li>Enviar confirmações, alterações e lembretes por email;</li>
          <li>Gerir a sua conta e o histórico de serviços;</li>
          <li>Melhorar o site através de estatísticas agregadas.</li>
        </ul>
      </Section>

      <Section title="4. Base legal">
        <p>
          Tratamos os seus dados para a <b>execução do contrato</b> (a marcação
          que solicita), com base no seu <b>consentimento</b> (cookies não
          essenciais e comunicações opcionais) e no nosso <b>interesse
          legítimo</b> em manter o serviço seguro e funcional.
        </p>
      </Section>

      <Section title="5. Cookies e estatísticas">
        <p>
          Usamos apenas cookies <b>essenciais</b> ao funcionamento do site. Para
          estatísticas usamos uma ferramenta <b>sem cookies e anónima</b>
          (Plausible, auto-hospedado), que <b>não</b> rastreia os visitantes
          entre sites nem cria perfis individuais. Pode gerir as suas
          preferências no banner de cookies.
        </p>
      </Section>

      <Section title="6. Adicionar marcações ao calendário">
        <p>
          Se optar por subscrever as suas marcações no calendário do telemóvel,
          geramos um link privado (.ics) com as suas próximas marcações. O link
          é pessoal — não o partilhe. Pode deixar de o usar a qualquer momento
          removendo a subscrição no seu calendário.
        </p>
      </Section>

      <Section title="7. Conservação dos dados">
        <p>
          Conservamos os seus dados enquanto a sua conta existir ou enquanto
          forem necessários para as finalidades acima. Pode pedir a eliminação a
          qualquer momento (ver os seus direitos).
        </p>
      </Section>

      <Section title="8. Os seus direitos">
        <p>
          Tem direito a aceder, retificar, eliminar e exportar (portabilidade) os
          seus dados, bem como a opor-se ou limitar o seu tratamento. Para
          exercer estes direitos, contacte-nos {contacto}. Tem ainda o direito de
          apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD).
        </p>
      </Section>

      <Section title="9. Subcontratantes">
        <p>
          Para prestar o serviço recorremos a fornecedores que tratam dados em
          nosso nome (alojamento da aplicação e envio de emails), sujeitos a
          obrigações de confidencialidade e segurança. Os dados não são vendidos
          a terceiros.
        </p>
      </Section>

      <Section title="10. Alterações a esta política">
        <p>
          Podemos atualizar esta política. A data da última atualização é
          indicada no topo desta página.
        </p>
      </Section>
    </div>
  );
}
