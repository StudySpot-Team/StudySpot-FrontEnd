"use client"

import React, { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AuthForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [activeTab, setActiveTab] = useState("login")

  const API_BASE_URL = "http://localhost:8080/api/auth"

  // 1. 로그인 처리 함수
  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email: email,
        password: password
      })

      const token = response.data.accessToken || response.data.token || response.data.data?.accessToken;

      if (token) {
        localStorage.setItem("accessToken", token);
        localStorage.setItem("user", JSON.stringify(response.data.data));

        alert(response.data.message || "로그인 성공!");
        navigate("/search");
      } else {
        alert("토큰을 받지 못했습니다. 백엔드 응답 형식을 확인해주세요.");
      }

    } catch (error) {
      console.error("로그인 에러:", error.response?.data)
      alert(error.response?.data?.message || "로그인 중 에러가 발생했습니다.")
    }
  }

  // 2. 회원가입 처리 함수
  const handleSignUp = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        email: email,
        password: password,
        nickname: nickname
      })

      alert(response.data.message || "회원가입 성공!")
      setActiveTab("login")
    } catch (error) {
      console.error("회원가입 에러:", error.response?.data)
      alert(error.response?.data?.message || "회원가입 중 에러가 발생했습니다.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all">
        <div className="text-center pt-8 pb-4 px-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-100">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">StudySpot</h1>
          <p className="text-gray-500 mt-1 text-sm">나만의 스터디 공간을 찾아보세요</p>
        </div>

        <div className="px-8 pb-8">
          <div className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("login")}
              className={`py-2 text-sm font-bold rounded-md transition-all ${
                activeTab === "login" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`py-2 text-sm font-bold rounded-md transition-all ${
                activeTab === "signup" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {activeTab === "login" && (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1" htmlFor="login-email">이메일</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="login-email"
                      type="email"
                      placeholder="hello@studyspot.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-semibold text-gray-700" htmlFor="login-password">비밀번호</label>
                    <button
                      type="button"
                      onClick={() => navigate('/find-password')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      비밀번호를 잊으셨나요?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
                  로그인
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400 font-medium">또는 소셜 계정으로 로그인</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/kakao'}
                  className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm"
                >
                  <img src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png" alt="카카오" className="w-5 h-5" />
                  카카오
                </button>
                <button
                  onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
                  className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm"
                >
                  <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="구글" className="w-5 h-5" />
                  구글
                </button>
              </div>
            </>
          )}

          {activeTab === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1" htmlFor="signup-email">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="hello@studyspot.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1" htmlFor="signup-password">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1" htmlFor="nickname">닉네임</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="nickname"
                    type="text"
                    placeholder="공부왕"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
                회원가입
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}