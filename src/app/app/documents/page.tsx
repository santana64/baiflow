import { Calendar, Clock, FileText, Mail, Send } from "lucide-react";
import type { DocumentType } from "@prisma/client";
import { Breadcrumbs, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { PrintButton } from "@/components/print-button";
import { ConfirmDeleteForm } from "@/components/confirm-delete-form";
import { deleteDocument, sendDocumentByEmail } from "@/server/actions";
import { requestSignature, sendRegisteredLetter } from "@/server/growth-actions";
import { sendableDocumentTypes, emailRecipientLabel } from "@/server/email";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { getAccessibleUserIds } from "@/server/workspace";

export const dynamic = "force-dynamic";

const documentTypeLabels: Record<string, string> = {
  AMICABLE_REMINDER_EMAIL: "Relance amiable (email)",
  AMICABLE_REMINDER_LETTER: "Relance amiable (courrier)",
  FORMAL_NOTICE_DRAFT: "Brouillon mise en demeure",
  REPAYMENT_PLAN: "Plan d'apurement",
  GUARANTOR_INFORMATION_LETTER: "Courrier caution",
  CASE_SUMMARY: "Synthèse dossier",
  PROFESSIONAL_ESCALATION_FILE: "Dossier préparatoire pro"
};

const filterLabels: Record<string, string> = {
  AMICABLE_REMINDER_EMAIL: "Relances email",
  AMICABLE_REMINDER_LETTER: "Relances courrier",
  FORMAL_NOTICE_DRAFT: "Mises en demeure",
  REPAYMENT_PLAN: "Plans d'apurement",
  GUARANTOR_INFORMATION_LETTER: "Courriers caution",
  CASE_SUMMARY: "Synthèses",
  PROFESSIONAL_ESCALATION_FILE: "Dossiers pro"
};

const sensitiveTypes = new Set(["FORMAL_NOTICE_DRAFT", "PROFESSIONAL_ESCALATION_FILE"]);
const registeredLetterTypes = new Set(["AMICABLE_REMINDER_LETTER", "FORMAL_NOTICE_DRAFT"]);

export default async function DocumentsPage({
  searchParams
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const params = await searchParams;

  const validType: DocumentType | undefined =
    params.type && Object.keys(documentTypeLabels).includes(params.type)
      ? (params.type as DocumentType)
      : undefined;

  const whereBase = { rentCase: { userId: { in: accessibleUserIds } } } as const;

  const [documents, total] = await Promise.all([
    prisma.generatedDocument.findMany({
      where: validType ? { ...whereBase, type: validType } : whereBase,
      include: {
        rentCase: { include: { tenant: true, property: true } },
        emailLogs: { orderBy: { sentAt: "desc" } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.generatedDocument.count({ where: whereBase })
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: "Tableau de bord", href: "/app" }, { label: "Documents" }]}
      />

      <PageHeader
        title="Documents générés"
        subtitle={`${total} document${total > 1 ? "s" : ""} au total — consultables, imprimables et exportables en PDF.`}
      />

      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/app/documents"
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            !validType
              ? "border-navy bg-navy text-white"
              : "border-line bg-white text-ink/60 hover:border-navy/30 hover:text-navy"
          }`}
        >
          Tous ({total})
        </a>
        {Object.entries(filterLabels).map(([type, label]) => (
          <a
            key={type}
            href={`/app/documents?type=${type}`}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              validType === type
                ? "border-navy bg-navy text-white"
                : "border-line bg-white text-ink/60 hover:border-navy/30 hover:text-navy"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      {documents.length === 0 ? (
        <EmptyState
          title="Aucun document dans cette catégorie"
          text="Les documents sont générés depuis la page de chaque dossier d'impayé."
          href="/app/cases"
          cta="Voir les dossiers"
        />
      ) : (
        <div className="space-y-5">
          {documents.map((document) => (
            <section
              key={document.id}
              className="rounded-xl border border-line bg-white shadow-card"
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper">
                    <FileText className="h-5 w-5 text-navy/60" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-navy">{document.title}</h2>
                      {sensitiveTypes.has(document.type) && (
                        <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
                          À vérifier avant envoi
                        </span>
                      )}
                      <span className="rounded-full bg-paper px-2 py-0.5 text-xs font-medium text-ink/55">
                        {documentTypeLabels[document.type] ?? document.type}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink/50">
                      <a
                        href={`/app/cases/${document.rentCase.id}`}
                        className="hover:text-navy hover:underline"
                      >
                        {document.rentCase.tenant.firstName} {document.rentCase.tenant.lastName}
                      </a>
                      <span>·</span>
                      <span>{document.rentCase.property.name}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {document.createdAt.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="no-print flex flex-wrap gap-2">
                  <a
                    href={`/app/documents/${document.id}/pdf`}
                    className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-navy transition-colors hover:bg-paper"
                  >
                    PDF
                  </a>
                  <PrintButton />
                  {sendableDocumentTypes.has(document.type) && (
                    <form action={async (fd) => { await sendDocumentByEmail(fd); }}>
                      <input type="hidden" name="id" value={document.id} />
                      <button
                        title={`Envoyer au ${emailRecipientLabel[document.type] ?? "destinataire"} par email`}
                        className="flex items-center gap-1.5 rounded-lg border border-sage/30 bg-sage/5 px-3 py-2 text-sm font-semibold text-sage transition-colors hover:bg-sage/10"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Envoyer
                      </button>
                    </form>
                  )}
                  {registeredLetterTypes.has(document.type) && (
                    <form action={async (fd) => { const result = await sendRegisteredLetter(fd); if (!result.ok) throw new Error(result.error.message); }}>
                      <input type="hidden" name="documentId" value={document.id} />
                      <button
                        title="Envoyer en recommandÃ© Ã©lectronique"
                        className="flex items-center gap-1.5 rounded-lg border border-blue/30 bg-blue/5 px-3 py-2 text-sm font-semibold text-blue transition-colors hover:bg-blue/10"
                      >
                        <Send className="h-3.5 w-3.5" />
                        RecommandÃ©
                      </button>
                    </form>
                  )}
                  {document.type === "REPAYMENT_PLAN" && (
                    <form action={async (fd) => { const result = await requestSignature(fd); if (!result.ok) throw new Error(result.error.message); }}>
                      <input type="hidden" name="documentId" value={document.id} />
                      <button
                        title="Demander une signature Ã©lectronique"
                        className="flex items-center gap-1.5 rounded-lg border border-navy/20 bg-navy/5 px-3 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Signature
                      </button>
                    </form>
                  )}
                  <ConfirmDeleteForm action={deleteDocument} message={`Supprimer définitivement "${document.title}" ?`}>
                    <input type="hidden" name="id" value={document.id} />
                    <button className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger/10">
                      Supprimer
                    </button>
                  </ConfirmDeleteForm>
                </div>
              </div>

              {/* Preview */}
              <div className="overflow-hidden">
                <div className="max-h-[480px] overflow-auto bg-white p-6">
                  <div dangerouslySetInnerHTML={{ __html: document.contentHtml }} />
                </div>
              </div>

              {/* Email history */}
              {document.emailLogs.length > 0 && (
                <div className="border-t border-line bg-paper/50 px-6 py-3">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink/40">
                    <Mail className="h-3 w-3" />
                    Historique d&apos;envoi
                  </p>
                  <div className="space-y-1">
                    {document.emailLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-2 text-xs text-ink/55">
                        <Clock className="h-3 w-3 shrink-0 text-ink/30" />
                        <span>
                          Envoyé à <span className="font-medium text-ink/70">{log.to}</span>
                        </span>
                        <span className="text-ink/30">·</span>
                        <span>
                          {log.sentAt.toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}{" "}
                          à{" "}
                          {log.sentAt.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-line px-6 py-3">
                <LinkButton
                  href={`/app/cases/${document.rentCase.id}`}
                  variant="ghost"
                  size="sm"
                  className="text-ink/50"
                >
                  ← Voir le dossier
                </LinkButton>
                <a
                  href={`/app/documents/${document.id}/pdf`}
                  className="text-sm font-semibold text-sage hover:underline"
                >
                  Exporter PDF →
                </a>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
