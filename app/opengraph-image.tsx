import { ImageResponse } from "next/og";
import { theme } from "@/lib/theme";

export const runtime = "edge";
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
          alignItems: "center",
          justifyContent: "center",
          background: theme.colors.primary,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 104, fontWeight: 800, color: "#ffffff" }}>Odil School</div>
        <div style={{ fontSize: 40, marginTop: 20, color: theme.colors.accent }}>
          Bepul onlayn darslar va testlar
        </div>
      </div>
    ),
    size,
  );
}
