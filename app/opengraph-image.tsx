import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const alt =
  "ไทยช่วยไทย — คำนวณค่าใช้จ่าย 60:40 พร้อมติดตามวงเงินรายวันและรายเดือน";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(): Promise<ArrayBuffer | undefined> {
  try {
    const file = await fs.readFile(
      path.join(process.cwd(), "app/fonts/Sarabun-Bold.ttf")
    );
    return file.buffer.slice(
      file.byteOffset,
      file.byteOffset + file.byteLength
    ) as ArrayBuffer;
  } catch {
    return undefined;
  }
}

export default async function Image() {
  const fontData = await loadFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f7f6f2",
          fontFamily: "Sarabun",
        }}
      >
        {/* Thai flag stripe */}
        <div
          style={{
            width: "100%",
            height: 18,
            background:
              "linear-gradient(to bottom, #a51931 0%, #a51931 16%, #f4f5f8 16%, #f4f5f8 33%, #2d2a4a 33%, #2d2a4a 66%, #f4f5f8 66%, #f4f5f8 83%, #a51931 83%, #a51931 100%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "38px 56px 44px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: 18,
                background: "#e63329",
                color: "#ffffff",
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              60
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: "#1a1814",
                letterSpacing: -0.5,
              }}
            >
              ไทยช่วยไทย
            </div>
            <div
              style={{
                marginLeft: "auto",
                fontSize: 24,
                color: "#6b665f",
                fontWeight: 700,
              }}
            >
              คำนวณ 60:40
            </div>
          </div>

          <div style={{ display: "flex", flex: 1, gap: 44, marginTop: 30 }}>
            {/* Left copy */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "58%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  fontSize: 62,
                  fontWeight: 700,
                  color: "#1a1814",
                  lineHeight: 1.16,
                  letterSpacing: -1.5,
                }}
              >
                <span>รัฐช่วยจ่าย 60%</span>
                <span style={{ color: "#e63329" }}>คุณจ่ายแค่ 40%</span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  fontSize: 28,
                  color: "#6b665f",
                  marginTop: 18,
                  lineHeight: 1.45,
                }}
              >
                <span>คำนวณทุกครั้งก่อนจ่าย พร้อมติดตามวงเงิน</span>
                <span>ไทยช่วยไทยแบบเรียลไทม์</span>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
                <div
                  style={{
                    display: "flex",
                    padding: "10px 20px",
                    borderRadius: 999,
                    background: "#e8eef8",
                    color: "#1a4fa0",
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  ฿200 / วัน
                </div>
                <div
                  style={{
                    display: "flex",
                    padding: "10px 20px",
                    borderRadius: 999,
                    background: "#fdf4dc",
                    color: "#a87a06",
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  ฿1,000 / เดือน
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: "auto",
                  fontSize: 22,
                  color: "#6b665f",
                  fontWeight: 700,
                }}
              >
                ruy-mai-wai-laew.vercel.app
              </div>
            </div>

            {/* Right example card */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "42%",
                background: "#ffffff",
                border: "2px solid #e2ddd6",
                borderRadius: 32,
                padding: "30px 32px",
                justifyContent: "center",
                gap: 16,
                boxShadow: "0 20px 50px rgba(26,24,20,0.12)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#1a4fa0",
                }}
              >
                <span>รัฐบาล</span>
                <span>60%</span>
              </div>

              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: 26,
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div style={{ width: "60%", height: "100%", background: "#1a4fa0" }} />
                <div style={{ width: "40%", height: "100%", background: "#e63329" }} />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#e63329",
                }}
              >
                <span>คุณ</span>
                <span>40%</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 14,
                  paddingTop: 16,
                  borderTop: "2px solid #e2ddd6",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 20, color: "#6b665f" }}>ตัวอย่าง ฿100</span>
                  <span style={{ fontSize: 30, fontWeight: 700, color: "#1a1814" }}>
                    รัฐ ฿60
                  </span>
                </div>
                <span style={{ fontSize: 30, fontWeight: 700, color: "#e63329" }}>
                  คุณ ฿40
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "Sarabun",
              data: fontData,
              weight: 700,
              style: "normal",
            },
          ]
        : undefined,
    }
  );
}
