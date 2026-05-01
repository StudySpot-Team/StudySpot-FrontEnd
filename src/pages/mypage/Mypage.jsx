"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Settings,
  Edit3,
  Star,
  Heart,
  ClipboardList,
  MapPin,
  Bell,
  LogOut,
  ChevronRight
} from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

export default function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    nickname: "스터디러",
    email: "loading...",
    bio: "나만의 스터디 스팟을 찾는 중 ☕️",
    reviewCount: 0,
    favoriteCount: 0,
  });

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      try {
        const response = await fetch("http://localhost:8080/api/mypage/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();

        const userData = result.data || result;

        if (userData) {
          setUser({
            nickname: userData.nickname || "지수",
            email: userData.email,
            bio: userData.bio || "매일 꾸준히 공부하는 스터디러입니다.",
            reviewCount: userData.reviewCount || 0,
            favoriteCount: userData.favoriteCount || 0
          });
        }
      } catch (err) {
        console.error("사용자 정보 로딩 실패:", err);
      }
    };

    fetchUserData();
  }, [token]);

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* 1. 상단 헤더 */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-gray-200/50 bg-white/80 px-4 backdrop-blur-md">
        <button
          onClick={() => navigate("/search")}
          className="flex items-center justify-center rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-black text-gray-900">마이페이지</h1>
        <button className="flex items-center justify-center rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100">
          <Settings className="h-5 w-5" />
        </button>
      </header>

      {/* 2. 메인 컨텐츠 영역 */}
      <motion.div
        className="mx-auto max-w-[500px] space-y-4 p-4 pt-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 프로필 섹션 */}
        <motion.div variants={itemVariants} className="rounded-[32px] bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 shadow-inner">
                <span className="text-2xl font-black text-indigo-600">
                  {user.nickname.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">{user.nickname} 님</h2>
                <p className="text-sm text-gray-400 font-medium">{user.email}</p>
              </div>
            </div>

            {/* 프로필 설정 페이지로 이동하는 버튼 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/profile/edit")}
              className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-100 border border-gray-100"
            >
              <Edit3 className="h-3.5 w-3.5" />
              프로필 수정
            </motion.button>
          </div>

          <div className="mt-4 rounded-2xl bg-gray-50/50 p-4 border border-gray-100/30">
            <p className="text-sm leading-relaxed text-gray-600 font-medium">{user.bio}</p>
          </div>
        </motion.div>

        {/* --- 통계 그리드 --- */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 font-bold">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/mypage/reviews")}
            className="cursor-pointer rounded-[32px] bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider">내 리뷰</span>
            </div>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{user.reviewCount}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/mypage/favorites")}
            className="cursor-pointer rounded-[32px] bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              <span className="text-xs font-black uppercase tracking-wider">즐겨찾기</span>
            </div>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{user.favoriteCount}</p>
          </motion.div>
        </motion.div>

        {/* 활동 리스트 메뉴 */}
        <motion.div variants={itemVariants} className="rounded-[32px] bg-white shadow-sm border border-gray-100 overflow-hidden font-bold">
          {[
            { icon: ClipboardList, label: "리뷰 내역", desc: "작성한 리뷰 관리", path: "/mypage/reviews", color: "text-indigo-600", bg: "bg-indigo-50" },
            { icon: MapPin, label: "즐겨찾기 장소", desc: "저장한 장소 보기", path: "/mypage/favorites", color: "text-rose-600", bg: "bg-rose-50" },
            { icon: Bell, label: "알림 설정", desc: "알림 환경설정", path: "/mypage/notifications", color: "text-amber-600", bg: "bg-amber-50" },
          ].map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className={`flex items-center justify-between p-5 transition-colors cursor-pointer hover:bg-gray-50 ${
                index !== 2 ? "border-b border-gray-50" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.bg}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-[15px] text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300" />
            </div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 text-gray-400 font-bold hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">로그아웃 하기</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}