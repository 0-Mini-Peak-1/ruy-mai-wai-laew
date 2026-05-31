"use client";

import { DAILY_LIMIT, MONTHLY_LIMIT, GOV_RATIO } from "@/lib/store";

export default function Guide() {
  return (
    <div className="space-y-4 stagger">
      {/* Hero card */}
      <div
        className="card animate-slide-up p-6 text-center"
        style={{
          background: "linear-gradient(135deg, var(--gov) 0%, #1a3f80 100%)",
          border: "none",
          color: "white",
        }}
      >
        <div style={{ fontSize: "2.5rem" }}>🇹🇭</div>
        <div className="font-800 text-xl mt-2">ไทยช่วยไทย</div>
        <div className="text-sm mt-1 opacity-80">โครงการรัฐบาลช่วยเหลือค่าครองชีพ</div>
      </div>

      {/* Ratio explainer */}
      <div className="card animate-slide-up p-5 space-y-3">
        <div className="text-sm font-700" style={{ color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          สัดส่วนการจ่าย
        </div>
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl p-4 text-center" style={{ background: "var(--gov-soft)" }}>
            <div className="text-3xl font-800" style={{ color: "var(--gov)" }}>60%</div>
            <div className="text-xs mt-1 font-600" style={{ color: "var(--gov)" }}>รัฐบาลจ่าย</div>
          </div>
          <div className="flex items-center font-800 text-lg" style={{ color: "var(--text-muted)" }}>+</div>
          <div className="flex-1 rounded-xl p-4 text-center" style={{ background: "var(--accent-soft)" }}>
            <div className="text-3xl font-800" style={{ color: "var(--accent)" }}>40%</div>
            <div className="text-xs mt-1 font-600" style={{ color: "var(--accent)" }}>คุณจ่าย</div>
          </div>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          ทุกครั้งที่ซื้อของ รัฐบาลจะออกให้ 60% ของราคา ส่วนที่เหลือ 40% คุณจ่ายเอง ผ่านกระเป๋าเงิน <strong>เป๋าตังค์</strong>
        </p>
      </div>

      {/* Limits */}
      <div className="card animate-slide-up p-5 space-y-3">
        <div className="text-sm font-700" style={{ color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          วงเงินที่รัฐออกให้
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: "var(--surface2)" }}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: "1.3rem" }}>☀️</span>
              <div>
                <div className="font-600">วงเงินรายวัน</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>รีเซ็ตทุกเที่ยงคืน</div>
              </div>
            </div>
            <div className="font-800 text-lg">฿{DAILY_LIMIT}</div>
          </div>
          <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: "var(--surface2)" }}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: "1.3rem" }}>📅</span>
              <div>
                <div className="font-600">วงเงินรายเดือน</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>รีเซ็ตทุกต้นเดือน</div>
              </div>
            </div>
            <div className="font-800 text-lg">฿{MONTHLY_LIMIT}</div>
          </div>
        </div>
      </div>

      {/* Example */}
      <div className="card animate-slide-up p-5 space-y-3">
        <div className="text-sm font-700" style={{ color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          ตัวอย่างการคำนวณ
        </div>
        <div className="space-y-2 text-sm">
          {[
            { item: "ข้าวมันไก่", price: 60, gov: 36, you: 24 },
            { item: "กาแฟ", price: 80, gov: 48, you: 32 },
            { item: "ของชำ", price: 200, gov: 120, you: 80 },
          ].map((ex) => (
            <div
              key={ex.item}
              className="rounded-xl p-3"
              style={{ background: "var(--surface2)" }}
            >
              <div className="flex justify-between mb-2">
                <span className="font-600">{ex.item}</span>
                <span className="font-700">฿{ex.price}</span>
              </div>
              <div className="flex gap-2">
                <span
                  className="badge"
                  style={{ background: "var(--gov-soft)", color: "var(--gov)" }}
                >
                  รัฐ ฿{ex.gov}
                </span>
                <span
                  className="badge"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  คุณ ฿{ex.you}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to use */}
      <div className="card animate-slide-up p-5 space-y-3">
        <div className="text-sm font-700" style={{ color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          วิธีใช้แอปนี้
        </div>
        <div className="space-y-3">
          {[
            { icon: "1", title: "กรอกราคาสินค้า", desc: "ใส่ราคาเต็มของสิ่งที่คุณต้องการซื้อ" },
            { icon: "2", title: "กดคำนวณ", desc: "ระบบจะแสดงว่ารัฐออกให้เท่าไร และคุณต้องจ่ายเพิ่มเท่าไร" },
            { icon: "3", title: "บันทึกรายการ", desc: "บันทึกเพื่อติดตามยอดที่ใช้ไปในแต่ละวันและเดือน" },
            { icon: "4", title: "ตรวจสอบประวัติ", desc: "ดูรายการทั้งหมดและยอดสะสมในแท็บ \"ประวัติ\"" },
          ].map((step) => (
            <div key={step.icon} className="flex gap-3 items-start">
              <div
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-800"
                style={{ background: "var(--gov)", color: "white" }}
              >
                {step.icon}
              </div>
              <div>
                <div className="font-600 text-sm">{step.title}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div
        className="rounded-xl p-4 text-xs animate-slide-up"
        style={{ background: "var(--warn-soft)", color: "var(--warn)" }}
      >
        ⚠️ แอปนี้เป็นเพียงเครื่องมือช่วยคำนวณเท่านั้น ไม่ใช่บริการทางการของรัฐบาล ยอดจริงขึ้นอยู่กับระบบ เป๋าตังค์
      </div>

      <div className="h-2" />
    </div>
  );
}
