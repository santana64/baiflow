import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BailFlow — Suivi des impayés locatifs",
    template: "%s — BailFlow"
  },
  description: "SaaS français de suivi administratif des impayés locatifs pour propriétaires bailleurs. Chronologie, courriers et dossier exportable.",
  metadataBase: new URL("https://bailflow.fr"),
  openGraph: {
    title: "BailFlow — Reprenez le contrôle dès le premier impayé",
    description: "Suivez les impayés, générez vos courriers, documentez chaque étape et préparez un dossier propre avant escalade professionnelle.",
    siteName: "BailFlow",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "BailFlow — Suivi des impayés locatifs"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "BailFlow — Reprenez le contrôle dès le premier impayé",
    description: "SaaS français de gestion des impayés locatifs.",
    images: ["/api/og"]
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/favicon.svg"
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const posthogKeyRaw = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogKey = posthogKeyRaw && posthogKeyRaw !== "placeholder" ? posthogKeyRaw : null;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
  const crispIdRaw = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
  const crispId = crispIdRaw && crispIdRaw !== "placeholder" ? crispIdRaw : null;
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {posthogKey ? (
          <Script id="posthog" strategy="afterInteractive">
            {`!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags reloadFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init("${posthogKey}",{api_host:"${posthogHost}",person_profiles:"identified_only"});`}
          </Script>
        ) : null}
        {crispId ? (
          <Script id="crisp" strategy="afterInteractive">
            {`window.$crisp=[];window.CRISP_WEBSITE_ID="${crispId}";(function(){var d=document,s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();`}
          </Script>
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
