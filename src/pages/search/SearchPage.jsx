"use client"

import React, { useState } from "react"
import { Mail, Lock, User, Star, Search, MapPin } from "lucide-react"

// --- 백엔드 연결 전 테스트용 데이터 ---
const MOCK_PLACES = [
  { id: 1, name: "스타벅스 강남역점", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300", rating: 4.5, congestion: "여유", tags: ["#조용함", "#콘센트많음", "#와이파이"], isOpen: true, closingTime: "22:00" },
  { id: 2, name: "투썸플레이스 역삼점", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300", rating: 4.2, congestion: "보통", tags: ["#넓은좌석", "#디저트맛집"], isOpen: true, closingTime: "23:00" },
  { id: 3, name: "강남 시립도서관", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=300", rating: 4.8, congestion: "혼잡", tags: ["#무료", "#초집중", "#에어컨"], isOpen: false, closingTime: "21:00" },
];

const congestionColors = {
  여유: "bg-emerald-100 text-emerald-700 border-emerald-200",
  보통: "bg-amber-100 text-amber-700 border-amber-200",
  혼잡: "bg-red-100 text-red-700 border-red-200",
};

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("distance");
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* --- 상단 헤더 영역 --- */}
      <header className="border-b bg-white p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm z-10">
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-2xl font-bold text-indigo-600">StudySpot</h1>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="공부할 곳을 검색해보세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {["전체", "카페", "도서관", "스터디룸"].map((label, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(label)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === label ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
          <select
            className="ml-2 p-1.5 border rounded-md text-sm bg-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="distance">거리순</option>
            <option value="rating">별점순</option>
          </select>
        </div>
      </header>

      {/* --- 메인 [리스트 + 지도] --- */}
      <main className="flex flex-1 overflow-hidden">

        {/* 사이드바 리스트 */}
        <aside className="w-full lg:w-[400px] overflow-y-auto border-r p-4 space-y-4 bg-gray-50">
          <p className="text-sm text-gray-500 font-medium">{MOCK_PLACES.length}개의 장소</p>
          {MOCK_PLACES.map((place) => (
            <div
              key={place.id}
              onClick={() => setSelectedPlaceId(place.id)}
              className={`p-4 rounded-xl border bg-white cursor-pointer transition-all hover:shadow-md ${
                selectedPlaceId === place.id ? "border-indigo-600 ring-1 ring-indigo-600" : "border-gray-200"
              }`}
            >
              <div className="flex gap-4">
                <img src={place.image} alt={place.name} className="w-20 h-20 rounded-lg object-cover bg-gray-200" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900">{place.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${congestionColors[place.congestion]}`}>
                      {place.congestion}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-amber-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-sm font-bold text-gray-700">{place.rating}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {place.tags.map(tag => (
                      <span key={tag} className="text-[11px] text-gray-500">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${place.isOpen ? "bg-green-500" : "bg-gray-400"}`} />
                <span className={place.isOpen ? "text-green-600 font-medium" : "text-gray-500"}>
                  {place.isOpen ? `영업 중 · ${place.closingTime} 종료` : "영업 종료"}
                </span>
              </div>
            </div>
          ))}
        </aside>

        {/* 진짜 지도 영역 - 추후에 카카오맵 api 연결 시 */}
        <section className="hidden lg:flex flex-1 bg-slate-100 relative items-center justify-center">
          <div className="text-center">
            <div className="bg-white p-4 rounded-full shadow-lg mb-4 inline-block">
              <MapPin className="h-8 w-8 text-indigo-600 animate-bounce" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700">지도 영역</h2>
            <p className="text-gray-500">카카오맵 API 연결 시 실제 지도가 표시됩니다.</p>
          </div>

          {/* 하단 플로팅 안내  */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-2xl border flex items-center gap-3">
             <span className="text-sm font-medium">지도를 움직여 장소를 찾아보세요</span>
          </div>
        </section>
      </main>
    </div>
  )
}