import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { subMonths } from "date-fns";
import { computeLineUnpaidAmount, generateDefaultTimeline, getNextRecommendedAction, calculateCaseSeverity } from "../src/domain/rent-cases";
import { generateDocumentTemplate } from "../src/domain/rent-cases/documents";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({ where: { email: "demo@bailflow.fr" } });
  const passwordHash = await hash("BailFlowDemo123!", 12);
  const user = await prisma.user.create({
    data: {
      email: "demo@bailflow.fr",
      name: "Bailleur démo",
      passwordHash,
      referralCode: "DEMO2026",
      emailVerifiedAt: new Date(),
      plan: "PREMIUM",
      subscriptionStatus: "ACTIVE",
      subscriptionCurrentPeriodEnd: new Date("2099-12-31"),
      profile: {
        create: {
          fullName: "Claire Martin",
          email: "claire.martin@example.fr",
          phone: "06 12 34 56 78",
          address: "12 rue des Lilas, 69003 Lyon",
          defaultSignature: "Claire Martin"
        }
      }
    },
    include: { profile: true }
  });
  const lyon = await prisma.property.create({ data: { userId: user.id, name: "Appartement Lyon 3", address: "24 rue Paul Bert", city: "Lyon", postalCode: "69003", rentAmountCents: 78000, chargesAmountCents: 6500, paymentDayOfMonth: 5, leaseStartDate: new Date("2023-09-01"), hasGuarantor: false, notes: "T2 meublé" } });
  const nantes = await prisma.property.create({ data: { userId: user.id, name: "Studio Nantes Centre", address: "8 rue Crébillon", city: "Nantes", postalCode: "44000", rentAmountCents: 62000, chargesAmountCents: 4500, paymentDayOfMonth: 3, leaseStartDate: new Date("2022-04-15"), hasGuarantor: true, notes: "Caution parentale" } });
  const tenantOne = await prisma.tenant.create({ data: { userId: user.id, propertyId: lyon.id, firstName: "Nadia", lastName: "Bernard", email: "nadia.bernard@example.fr", phone: "06 44 12 09 31", address: "24 rue Paul Bert, 69003 Lyon", notes: "" } });
  const tenantTwo = await prisma.tenant.create({ data: { userId: user.id, propertyId: nantes.id, firstName: "Hugo", lastName: "Morel", email: "hugo.morel@example.fr", phone: "06 18 22 45 90", address: "8 rue Crébillon, 44000 Nantes", guarantorName: "Élodie Morel", guarantorEmail: "elodie.morel@example.fr", guarantorPhone: "06 11 11 11 11", notes: "" } });

  for (const item of [
    { property: lyon, tenant: tenantOne, first: subMonths(new Date(), 1), periods: ["Mars 2026"], contact: true },
    { property: nantes, tenant: tenantTwo, first: subMonths(new Date(), 2), periods: ["Février 2026", "Mars 2026"], contact: false }
  ]) {
    const lines = item.periods.map((period, index) => {
      const dueDate = new Date(item.first);
      dueDate.setMonth(item.first.getMonth() + index);
      const line = { periodLabel: period, dueDate, rentDueCents: item.property.rentAmountCents, chargesDueCents: item.property.chargesAmountCents, paidAmountCents: index === 0 && item.contact ? 20000 : 0 };
      return { ...line, unpaidAmountCents: computeLineUnpaidAmount(line), status: line.paidAmountCents > 0 ? "PARTIAL" as const : "UNPAID" as const };
    });
    const events = generateDefaultTimeline({ firstMissedPaymentDate: item.first, hasGuarantor: item.property.hasGuarantor });
    const domainCase = { status: "AMICABLE" as const, firstMissedPaymentDate: item.first, totalUnpaidCents: lines.reduce((s, l) => s + l.unpaidAmountCents, 0), lines, events, hasGuarantor: item.property.hasGuarantor || Boolean(item.tenant.guarantorName), documents: [] };
    const next = getNextRecommendedAction(domainCase);
    const rentCase = await prisma.rentCase.create({
      data: {
        userId: user.id,
        propertyId: item.property.id,
        tenantId: item.tenant.id,
        status: item.contact ? "AMICABLE" : "REPAYMENT_PLAN",
        severity: calculateCaseSeverity(domainCase),
        firstMissedPaymentDate: item.first,
        totalUnpaidCents: domainCase.totalUnpaidCents,
        nextActionLabel: next.label,
        nextActionDate: next.date,
        legalDisclaimerAcknowledged: true,
        lines: { create: lines },
        events: { create: events.map((event) => ({ ...event, description: event.description ?? null })) }
      },
      include: { lines: true, events: true, documents: true, tenant: true, property: true }
    });
    const generated = generateDocumentTemplate({ type: item.contact ? "AMICABLE_REMINDER_EMAIL" : "CASE_SUMMARY", landlord: user.profile!, tenant: item.tenant, property: item.property, rentCase, lines: rentCase.lines, events: rentCase.events, documents: [], currentDate: new Date() });
    await prisma.generatedDocument.create({ data: { rentCaseId: rentCase.id, type: item.contact ? "AMICABLE_REMINDER_EMAIL" : "CASE_SUMMARY", ...generated } });
  }

  await prisma.partnerProfessional.createMany({
    data: [
      {
        type: "COMMISSAIRE_JUSTICE",
        name: "Étude Rhône Justice",
        department: "69",
        city: "Lyon",
        email: "contact@rhone-justice.example",
        phone: "04 72 00 00 00",
        website: "https://example.fr",
        description: "Étude pilote pour les dossiers locatifs structurés et commandements de payer.",
        verified: true,
        premiumPlacement: true
      },
      {
        type: "AVOCAT",
        name: "Cabinet Droit des Baux Atlantique",
        department: "44",
        city: "Nantes",
        email: "contact@baux-atlantique.example",
        phone: "02 40 00 00 00",
        description: "Accompagnement baux d'habitation, impayés et procédures locatives.",
        verified: true
      }
    ],
    skipDuplicates: true
  });

  const organization = await prisma.organization.create({
    data: {
      name: "SCI Martin Patrimoine",
      type: "SCI",
      members: { create: { userId: user.id, role: "OWNER" } },
      sciProfile: {
        create: {
          legalName: "SCI Martin Patrimoine",
          siren: "123456789",
          shareCapital: "1 000 EUR",
          taxRegime: "IR",
          shareholders: {
            create: [
              { name: "Claire Martin", email: "claire.martin@example.fr", sharesBps: 7000 },
              { name: "Paul Martin", email: "paul.martin@example.fr", sharesBps: 3000 }
            ]
          }
        }
      }
    }
  });
  await prisma.whiteLabelSetting.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      brandName: "Martin Gestion",
      primaryColor: "#172b4d",
      accentColor: "#5d7d6a",
      customDomain: "impayes.martin-gestion.example"
    }
  });
  void organization;
}

main().finally(async () => prisma.$disconnect());
