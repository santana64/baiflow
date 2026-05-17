import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Reprenez le contrôle dès le premier impayé.";
  const sub = searchParams.get("sub") ?? "SaaS français pour propriétaires bailleurs";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#fdfcfc",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Top green accent stripe */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "#16a34a" }} />

        {/* Background dot grid */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "500px",
            height: "500px",
            backgroundImage: "radial-gradient(circle, #0a0a0a 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            opacity: 0.04
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "48px 64px 0" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              background: "#0a0a0a",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px"
            }}
          >
            <span style={{ color: "#fff" }}>⚖</span>
          </div>
          <span style={{ fontSize: "22px", fontWeight: 700, color: "#0a0a0a", letterSpacing: "-0.4px" }}>
            BailFlow
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 64px 48px"
          }}
        >
          {/* Category tag */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "9999px",
              padding: "6px 14px",
              marginBottom: "28px",
              width: "fit-content"
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#16a34a" }}>
              SaaS français · Loyers impayés
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 50 ? "46px" : "54px",
              fontWeight: 800,
              color: "#0a0a0a",
              lineHeight: 1.15,
              letterSpacing: "-1px",
              maxWidth: "820px",
              marginBottom: "20px"
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div style={{ fontSize: "20px", color: "#57534e", lineHeight: 1.5, maxWidth: "600px" }}>
            {sub}
          </div>

          {/* Feature pills row */}
          <div style={{ display: "flex", gap: "12px", marginTop: "40px" }}>
            {["Dossiers structurés", "Courriers IA", "Chronologie opposable"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#f5f3f1",
                  border: "1px solid #e5e5e5",
                  borderRadius: "9999px",
                  padding: "8px 18px"
                }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "9999px", background: "#16a34a" }} />
                <span style={{ fontSize: "15px", fontWeight: 600, color: "#0a0a0a" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 64px",
            borderTop: "1px solid #e5e5e5",
            background: "#fdfcfc"
          }}
        >
          <span style={{ fontSize: "14px", color: "#a8a29e" }}>bailflow.fr</span>
          <span style={{ fontSize: "14px", color: "#a8a29e" }}>
            Support administratif · Impayés locatifs
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
