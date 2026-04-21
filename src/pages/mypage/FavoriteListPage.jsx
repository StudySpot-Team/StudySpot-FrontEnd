"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Heart, MapPin, Coffee, BookOpen, Users } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}

const categoryConfig = {
  cafe: { label: "카페", icon: Coffee, color: "bg-amber-50 text-amber-600" },
  library: { label: "도서관", icon: BookOpen, color: "bg-emerald-50 text-emerald-600" },
  studyroom: { label: "스터디룸", icon: Users, color: "bg-indigo-50 text-indigo-600" },
  default: { label: "스터디스팟", icon: MapPin, color: "bg-indigo-50 text-indigo-600" }
}

export default function FavoriteListPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const loadFavorites = async () => {
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      try {
        const userRes = await fetch("http://localhost:8080/api/mypage/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const userResult = await userRes.json();
        const userData = userResult.data || userResult;
        const currentId = userData.userId || userData.id;
        setUserId(currentId);

        const favRes = await fetch(`http://localhost:8080/api/favorites/${currentId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const favData = await favRes.json();

        setFavorites(Array.isArray(favData) ? favData : favData.data || []);
      } catch (err) {
        console.error("즐겨찾기 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [token, navigate]);


  const handleToggleFavorite = async (externalId) => {
    if (!externalId) {
      console.error("externalId가 없습니다!");
      return;
    }

    if (!window.confirm("즐겨찾기를 해제하시겠습니까?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/favorites/toggle?userId=${userId}&placeId=${externalId}`, {
        method: 'POST',
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(f => f.externalId !== externalId));
      } else {
        const errorData = await response.json();
        alert("에러 발생: " + errorData.message);
      }
    } catch (err) {
      console.error("즐겨찾기 해제 실패:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-gray-900 flex-1">즐겨찾기 장소</h1>
      </header>

      <motion.div className="mx-auto max-w-[600px] p-4 pt-6 space-y-4" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="px-2 mb-2">
          <span className="text-sm font-bold text-gray-500">
            총 <span className="text-indigo-600 font-black">{favorites.length}</span>곳을 저장했어요
          </span>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : favorites.length === 0 ? (
          <motion.div variants={itemVariants} className="rounded-[32px] bg-white p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center mt-10">
            <Heart className="h-10 w-10 text-gray-200 mb-4" />
            <p className="text-lg font-black text-gray-900 mb-1">저장한 장소가 없습니다</p>
            <button onClick={() => navigate("/search")} className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold text-sm">장소 찾아보기</button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {favorites.map((fav) => {
              const config = categoryConfig.default;
              const CategoryIcon = config.icon;

              return (
                <motion.div
                  key={fav.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  onClick={() => navigate(`/detail/${fav.externalId}?name=${encodeURIComponent(fav.placeName)}`)}
                  className="rounded-[32px] bg-white p-6 shadow-sm border border-gray-100 mb-3 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
                          <CategoryIcon className="h-3.5 w-3.5" />
                          {config.label}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-gray-900 mb-2 truncate">{fav.placeName}</h3>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{fav.address || "주소 정보 없음"}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(fav.externalId);
                      }}
                      className="p-2.5 rounded-full bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  )
}