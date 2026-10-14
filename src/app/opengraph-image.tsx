import { ImageResponse } from "next/og";

// English-only branding on purpose: Satori (next/og) does not ship an Arabic
// glyph set and cannot load our self-hosted WOFF2 subsets, so keeping the OG
// image Latin-only makes generation fully deterministic (no network, no fonts).
export const alt = "Learn Cyber Security — Till We Get Paid";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A0A0A",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "#FACC15",
                border: "4px solid #FAF6EC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  color: "#0A0A0A",
                  fontSize: 30,
                  fontWeight: 900,
                  display: "flex",
                }}
              >
                {">_"}
              </div>
            </div>
            <div
              style={{
                color: "#FAF6EC",
                fontSize: 34,
                fontWeight: 900,
                display: "flex",
              }}
            >
              htl.cyber
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#22C55E",
              color: "#0A0A0A",
              fontSize: 24,
              fontWeight: 900,
              padding: "10px 22px",
              borderRadius: 999,
              border: "4px solid #FAF6EC",
            }}
          >
            <div style={{ display: "flex" }}>● 100% FREE</div>
          </div>
        </div>

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              color: "#FAF6EC",
              fontSize: 104,
              fontWeight: 900,
              lineHeight: 1.02,
              display: "flex",
            }}
          >
            Learn Cyber Security
          </div>
          <div
            style={{
              color: "#FACC15",
              fontSize: 48,
              fontWeight: 900,
              display: "flex",
            }}
          >
            Till We Get Paid.
          </div>
        </div>

        {/* Bottom: terminal strip */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            background: "#FAF6EC",
            border: "4px solid #FAF6EC",
            borderRadius: 16,
            padding: "22px 28px",
          }}
        >
          <div
            style={{
              color: "#0A0A0A",
              fontSize: 30,
              fontWeight: 700,
              display: "flex",
            }}
          >
            root@htl:~# ./start --free
          </div>
          <div
            style={{
              color: "#3346F0",
              fontSize: 28,
              fontWeight: 700,
              display: "flex",
            }}
          >
            flag&#123;y0u_4r3_1n&#125;
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
