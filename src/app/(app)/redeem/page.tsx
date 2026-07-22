"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RedeemCouponPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ message: string; expiresAt: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("쿠폰 코드를 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/redeem-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "쿠폰 등록에 실패했어요.");
        setLoading(false);
        return;
      }

      setSuccess({ message: data.message, expiresAt: data.expiresAt });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("네트워크 오류가 발생했어요. 다시 시도해주세요.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "#FAFAFA",
      }}>
        <div style={{
          maxWidth: 480,
          width: "100%",
          background: "#fff",
          border: "1px solid #EBEBEB",
          borderRadius: 20,
          padding: "40px 28px",
          textAlign: "center",
          boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
        }}>
          <div style={{
            width: 80, height: 80,
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "2.4rem",
            marginBottom: 20,
          }}>
            ✓
          </div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: 12, color: "#1a1a1a" }}>
            등록 완료! 🎉
          </h1>
          <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.8, marginBottom: 24 }}>
            {success.message}
          </p>
          <div style={{
            background: "#F0F4FF",
            border: "1px solid #C8D6FF",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 24,
            fontSize: "0.85rem",
            color: "#2A5FFF",
            fontWeight: 700,
          }}>
            ⏰ 만료: {new Date(success.expiresAt).toLocaleDateString("ko-KR", {
              year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </div>
          <button
            type="button"
            onClick={() => router.push("/write")}
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #2A5FFF 0%, #5B82FF 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: "0.98rem",
              fontWeight: 900,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 8px 20px rgba(42,95,255,0.3)",
            }}
          >
            블로그 글 쓰러 가기 →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      background: "#FAFAFA",
    }}>
      <div style={{
        maxWidth: 480,
        width: "100%",
        background: "#fff",
        border: "1px solid #EBEBEB",
        borderRadius: 20,
        padding: "40px 28px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: "2.8rem", lineHeight: 1, marginBottom: 12 }}>🎁</div>
          <p style={{ fontSize: "0.72rem", fontWeight: 900, color: "#2A5FFF", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>
            Redeem Coupon
          </p>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 900, lineHeight: 1.4, marginBottom: 10, wordBreak: "keep-all", color: "#1a1a1a" }}>
            쿠폰 코드 등록
          </h1>
          <p style={{ fontSize: "0.88rem", color: "#666", lineHeight: 1.7, wordBreak: "keep-all" }}>
            EAZY 릴스 강의 등을 구매하시고 발급받은<br />
            쿠폰 코드를 입력하면 <strong style={{ color: "#1a1a1a" }}>PRO 이용권</strong>이 활성화돼요.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(""); }}
            placeholder="예: RL-XK4H-M2P9"
            autoComplete="off"
            autoCapitalize="characters"
            style={{
              width: "100%",
              padding: "16px 18px",
              border: `1.5px solid ${error ? "#FF4444" : "#EBEBEB"}`,
              borderRadius: 12,
              fontSize: "1.05rem",
              fontWeight: 700,
              textAlign: "center",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              outline: "none",
              marginBottom: 10,
              color: "#2A5FFF",
            }}
          />
          {error && (
            <p style={{ fontSize: "0.82rem", color: "#FF4444", fontWeight: 700, marginBottom: 12, textAlign: "center", lineHeight: 1.5 }}>
              ⚠️ {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: loading ? "#ccc" : "#1a1a1a",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: "0.98rem",
              fontWeight: 900,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              marginTop: error ? 4 : 12,
            }}
          >
            {loading ? "확인 중..." : "🎁 이용권 활성화"}
          </button>
        </form>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid #F0F0F0" }}>
          <p style={{ fontSize: "0.78rem", color: "#888", lineHeight: 1.7, textAlign: "center", wordBreak: "keep-all" }}>
            💡 쿠폰이 없으신가요?<br />
            <Link href="https://www.jjeen-eazy.com/products/reels-class" target="_blank" style={{ color: "#2A5FFF", fontWeight: 700, textDecoration: "underline" }}>
              EAZY 릴스 강의
            </Link>{" "}
            구매 시 자동으로 발급됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
