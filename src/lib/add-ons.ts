import type { AddOnType } from "@prisma/client";

export type AddOnDefinition = {
  type: AddOnType;
  name: string;
  priceCents: number;
  providerCostCents: number;
  description: string;
};

export const ADD_ONS: Record<AddOnType, AddOnDefinition> = {
  REGISTERED_LETTER: {
    type: "REGISTERED_LETTER",
    name: "Recommandé électronique",
    priceCents: 490,
    providerCostCents: 150,
    description: "Envoi en recommandé électronique via un prestataire configuré."
  },
  ELECTRONIC_SIGNATURE: {
    type: "ELECTRONIC_SIGNATURE",
    name: "Signature électronique",
    priceCents: 390,
    providerCostCents: 80,
    description: "Signature électronique du plan d'apurement via provider configuré."
  },
  FISCAL_REPORT: {
    type: "FISCAL_REPORT",
    name: "Rapport fiscal annuel PDF",
    priceCents: 990,
    providerCostCents: 20,
    description: "Rapport annuel pour déclaration 2044 et comptable."
  },
  PROFESSIONAL_FILE: {
    type: "PROFESSIONAL_FILE",
    name: "Dossier professionnel complet",
    priceCents: 1990,
    providerCostCents: 50,
    description: "Dossier préparatoire enrichi pour commissaire de justice ou conseil."
  },
  REGISTERED_LETTER_PACK_10: {
    type: "REGISTERED_LETTER_PACK_10",
    name: "Pack 10 recommandés",
    priceCents: 3900,
    providerCostCents: 1500,
    description: "Crédit de 10 recommandés électroniques."
  },
  LEGAL_CONSULTATION: {
    type: "LEGAL_CONSULTATION",
    name: "Consultation partenaire 30 min",
    priceCents: 4900,
    providerCostCents: 1000,
    description: "Mise en relation avec un professionnel partenaire."
  },
  LEGAL_ARCHIVE_10Y: {
    type: "LEGAL_ARCHIVE_10Y",
    name: "Archivage légal 10 ans",
    priceCents: 1990,
    providerCostCents: 10,
    description: "Archivage longue durée du dossier et de ses documents."
  }
};

export function getAddOn(type: AddOnType) {
  return ADD_ONS[type];
}
