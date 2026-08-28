import { ImageResponse } from "next/og";

export const alt = "HARIKOS AI — Build fast with AI. Keep the project straight.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ background: "#07090c", color: "#eef4fb", display: "flex", fontFamily: "Inter, sans-serif", height: "100%", padding: 56, position: "relative", width: "100%" }}>
      <div style={{ backgroundImage: "linear-gradient(rgba(86,217,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(86,217,255,.08) 1px, transparent 1px)", backgroundSize: "44px 44px", inset: 0, position: "absolute" }} />
      <div style={{ border: "1px solid #26313c", display: "flex", flex: 1, flexDirection: "column", justifyContent: "space-between", padding: 46, position: "relative" }}>
        <div style={{ alignItems: "center", display: "flex", fontSize: 19, fontWeight: 800, letterSpacing: ".16em" }}><span style={{ alignItems: "center", background: "#dff5ff", color: "#071019", display: "flex", height: 42, justifyContent: "center", marginRight: 16, transform: "rotate(45deg)", width: 42 }}>H</span> HARIKOS AI</div>
        <div style={{ display: "flex", flexDirection: "column" }}><span style={{ color: "#56d9ff", fontFamily: "monospace", fontSize: 17, letterSpacing: ".14em", marginBottom: 18 }}>THE PROJECT BRAIN</span><strong style={{ fontSize: 66, letterSpacing: "-.055em", lineHeight: 1.02 }}>Build fast with AI.<br />Keep the project straight.</strong></div>
        <div style={{ color: "#8c9bab", display: "flex", fontFamily: "monospace", fontSize: 16, gap: 24 }}><span>TRUTH</span><span>MEMORY</span><span>CONTEXT</span><span>AGENT BRIDGE</span></div>
      </div>
    </div>,
    size,
  );
}
