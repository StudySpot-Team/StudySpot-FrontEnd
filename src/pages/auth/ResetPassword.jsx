"use client"

import React, { useState, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Lock, Eye, EyeOff, ArrowLeft, Check, X } from "lucide-react"
import axios from "axios"

// 비밀번호 유효성 검사 규칙
const passwordRules = [
  { label: "8자 이상", test: (pw) => pw.length >= 8 },
  { label: "숫자 포함", test: (pw) => /\d/.test(pw) },
  { label: "특수문자 포함", test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
  { label: "대문자 포함", test: (pw) => /[A-Z]/.test(pw) },
]

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const ruleResults = useMemo(() => {
    return passwordRules.map((rule) => ({
      ...rule,
      passed: rule.test(password),
    }))
  }, [password])

  const isFormValid =
    ruleResults.every((r) => r.passed) &&
    password === confirmPassword &&
    password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    if (!token) {
      alert("유효한 인증 토큰이 없습니다. 메일의 링크를 다시 확인해 주세요.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/auth/reset-password", {
        token: token,
        newPassword: password
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error("비밀번호 재설정 에러:", err.response?.data);
      alert(err.response?.data?.message || "비밀번호 변경 중 오류가 발생했습니다. 링크 만료 여부를 확인해 주세요.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50 relative overflow-hidden font-sans">
      {/* 배경 디자인 */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-600/5 blur-3xl" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 z-10 border border-gray-100 transition-all">
        {!isSubmitted ? (
          <>
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-100">
                <span className="text-2xl font-black text-white">S</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">새 비밀번호 설정</h2>
              <p className="text-gray-500 mt-2 text-sm">안전한 비밀번호를 설정해 주세요.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 새 비밀번호 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">새 비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                    placeholder="새 비밀번호 입력"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* 비밀번호 규칙 체크 UI */}
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-2">
                {ruleResults.map((rule, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs font-bold ${rule.passed ? "text-green-600" : "text-gray-400"}`}>
                    {rule.passed ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    {rule.label}
                  </div>
                ))}
              </div>

              {/* 비밀번호 확인 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">비밀번호 확인</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-12 py-3.5 border rounded-xl outline-none focus:ring-2 transition-all text-sm ${
                      confirmPassword && password !== confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-indigo-500"
                    }`}
                    placeholder="다시 한번 입력"
                    required
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-red-500 font-bold ml-1 animate-in fade-in slide-in-from-top-1">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isFormValid}
                className="w-full bg-indigo-600 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl shadow-lg transform transition-all active:scale-95"
              >
                비밀번호 변경 완료
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">변경 완료!</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                새로운 비밀번호로 정상적으로 변경되었습니다.<br />
                이제 다시 로그인해 주세요.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-all"
            >
              로그인하러 가기
            </button>
          </div>
        )}

        {!isSubmitted && (
          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              로그인으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </main>
  )
}