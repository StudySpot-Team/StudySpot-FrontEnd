"use client"

import React, { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AuthForm() {
    const navigate = useNavigate(); //페이지 이동
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [activeTab, setActiveTab] = useState("login")

  // 백엔드 기본 주소 (포트 8080 확인)
  const API_BASE_URL = "http://localhost:8080/api/auth"

  // 1. 로그인 처리 함수
  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email: email,
        password: password
      })

      // 백엔드의 ApiResponse 구조에 맞춰서 메시지 출력
      alert(response.data.message || "로그인 성공!")
      console.log("로그인 데이터:", response.data.data)

      //로그인 성공 시  /search 페이지로 이동
      navigate("/search");

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

      // 가입 성공 시 로그인 탭으로 자동 이동
      setActiveTab("login")
    } catch (error) {
      console.error("회원가입 에러:", error.response?.data)
      alert(error.response?.data?.message || "회원가입 중 에러가 발생했습니다.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="text-center pt-8 pb-4 px-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">StudySpot</h1>
          <p className="text-gray-500 mt-1">나만의 스터디 공간을 찾아보세요</p>
        </div>

        <div className="px-8 pb-8">
          {/* Tabs List */}
          <div className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("login")}
              className={`py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "login" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "signup" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Content */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="login-email">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="hello@studyspot.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-10 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="login-password">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-10 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors">
                로그인
              </button>
            </form>
          )}

          {/* Sign Up Content */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="signup-email">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="hello@studyspot.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-10 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="signup-password">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-10 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="nickname">닉네임</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="nickname"
                    type="text"
                    placeholder="공부왕"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-10 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors">
                회원가입
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}