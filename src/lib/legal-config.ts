export const legalConfig = {
  publisherName: process.env.NEXT_PUBLIC_LEGAL_PUBLISHER_NAME ?? "BailFlow",
  publisherDetails: process.env.NEXT_PUBLIC_LEGAL_PUBLISHER_DETAILS ?? "Editeur du service BailFlow",
  publicationDirector: process.env.NEXT_PUBLIC_LEGAL_PUBLICATION_DIRECTOR ?? "Direction BailFlow",
  contactEmail: process.env.NEXT_PUBLIC_LEGAL_CONTACT_EMAIL ?? "contact@bailflow.fr",
  hostingProvider: process.env.NEXT_PUBLIC_LEGAL_HOSTING_PROVIDER ?? "Vercel Inc.",
  hostingAddress: process.env.NEXT_PUBLIC_LEGAL_HOSTING_ADDRESS ?? "340 Pine Street, Suite 701, San Francisco, CA 94104, Etats-Unis",
  hostingWebsite: process.env.NEXT_PUBLIC_LEGAL_HOSTING_WEBSITE ?? "vercel.com"
};
