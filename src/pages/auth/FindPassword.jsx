"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Mail, User, ArrowLeft, Send } from "lucide-react"
import axios from "axios"

export default function FindPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("")
  const [nickname, setNickname] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post("http://localhost:8080/api/auth/find-password", {
        email: email,
        nickname: nickname
      });
      setIsSubmitted(true)
    } catch (err) {
      alert(err.response?.data?.message || "입력하신 정보와 일치하는 사용자가 없습니다.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50 relative overflow-hidden font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 z-10 border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg">
            <span className="text-2xl font-black text-white">S</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">비밀번호 찾기</h2>
          <p className="text-gray-500 mt-2 text-sm">이메일과 닉네임을 입력해 주세요.</p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              {/* 이메일 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">이메일 주소</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="hello@studyspot.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    required
                  />
                </div>
              </div>

              {/* 닉네임 입력 추가 */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">닉네임</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="가입 시 등록한 닉네임"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all active:scale-95">
              인증 메일 보내기 <Send className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
              <Mail className="h-8 w-8" />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              <span className="font-semibold text-indigo-600">{email}</span>로 <br />
              비밀번호 재설정 링크를 보내드렸습니다.
            </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <button onClick={() => navigate('/login')} className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="h-4 w-4" /> 로그인으로 돌아가기
          </button>
        </div>
      </div>
    </main>
  )
}