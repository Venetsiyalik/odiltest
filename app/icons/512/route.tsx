import { ImageResponse } from "next/og";

export const contentType = "image/png";
export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#171717",
          color: "#fafafa",
          fontSize: 256,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        OS
      </div>
    ),
    { width: 512, height: 512 },
  );
}
