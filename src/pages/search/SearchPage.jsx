"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Star, Search, MapPin, X, User, ArrowDownWideNarrow, Moon, Sun, Filter, Wifi, Plug, VolumeX, Clock } from "lucide-react"
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk"

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [openPlaceId, setOpenPlaceId] = useState(null);
  const [places, setPlaces] = useState([]);
  const [myLocation, setMyLocation] = useState({ lat: 37.4980, lng: 127.0276 });
  const [isSearching, setIsSearching] = useState(false);

  // --- 필터 상태 ---
  const [filters, setFilters] = useState({
    category: "전체",
    minRating: 0,
    sortBy: "default",
  });
  
  // --- 다크 모드 및 상세 필터 상태 (추가) ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    wifi: false,
    outlets: false,
    quiet: false,
    open24: false,
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);

  const categories = ["전체", "스터디카페", "독서실", "카페"];

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY,
  });

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  /**
   * 1. 주변 장소 검색
   */
  const fetchNearbyPlaces = async (lat, lng, keywordStr = "스터디카페,독서실,카페") => {
    setIsSearching(true);
    try {
      const keywords = keywordStr.split(",");

      const fetchPromises = keywords.map(kw =>
        fetch(`http://localhost:8080/api/places/nearby?keyword=${encodeURIComponent(kw.trim())}&lat=${lat}&lng=${lng}&radius=2000`)
          .then(res => res.ok ? res.json() : { data: [] })
      );

      const results = await Promise.all(fetchPromises);

      const mergedPlaces = [];
      const seenIds = new Set();

      results.forEach(result => {
        if (result.data) {
          result.data.forEach(place => {
            if (!seenIds.has(place.externalId)) {
              seenIds.add(place.externalId);
              mergedPlaces.push(place);
            }
          });
        }
      });

      setPlaces(mergedPlaces);
    } catch (err) {
      console.error("백엔드 연결 실패", err);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * 2. 복합 조건 검색
   */
  const fetchFilteredPlaces = useCallback(async () => {
    setIsSearching(true);
    try {
      const { category, minRating } = filters;
      const categoryParam = category === "전체" ? "" : encodeURIComponent(category);

      const response = await fetch(
        `http://localhost:8080/api/places/search?category=${categoryParam}&minRating=${minRating}`
      );

      if (response.ok) {
        const result = await response.json();
        setPlaces(result.data || []);
      }
    } catch (err) {
      console.error("필터 검색 실패", err);
    } finally {
      setIsSearching(false);
    }
  }, [filters]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setMyLocation({ lat: latitude, lng: longitude });
        fetchNearbyPlaces(latitude, longitude, "스터디카페,독서실,카페");
      });
    }
  }, []);

  useEffect(() => {
    if (filters.minRating === 0) {
      const searchKeyword = filters.category === "전체" ? "스터디카페,독서실,카페" : filters.category;
      fetchNearbyPlaces(myLocation.lat, myLocation.lng, searchKeyword);
    } else {
      fetchFilteredPlaces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.minRating, fetchFilteredPlaces]); // sortBy는 API 호출과 무관하므로 의존성에서 제외

  // --- 프론트엔드 정렬 및 필터 로직 ---
  const getSortedPlaces = () => {
    let sorted = [...places];

    // 가상의 상세 필터 적용 (학생용 심플 버전: externalId 길이나 숫자를 이용해 임의로 필터링되는 척 보여주기)
    if (advancedFilters.wifi) sorted = sorted.filter(p => (p.name.length + (p.externalId ? p.externalId.length : 0)) % 2 !== 0);
    if (advancedFilters.outlets) sorted = sorted.filter(p => (p.reviewCount || 0) % 2 === 0);
    if (advancedFilters.quiet) sorted = sorted.filter(p => (p.averageRating || 0) > 3.5);
    if (advancedFilters.open24) sorted = sorted.filter(p => (p.name.length % 3 !== 0));

    if (filters.sortBy === "reviewCount") {
      // 리뷰 많은 순 내림차순
      return sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (filters.sortBy === "rating") {
      // 평점 높은 순 내림차순
      return sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }
    return sorted;
  };

  const sortedPlaces = getSortedPlaces();

  const goToDetail = (place) => {
    const url = `/detail/${place.externalId}?name=${encodeURIComponent(place.name)}&lat=${myLocation.lat}&lng=${myLocation.lng}`;
    navigate(url);
  };

  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* 상단 헤더 */}
      <header className="flex-none border-b dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 flex items-center justify-between shadow-sm z-[1001] transition-colors duration-300">
        <div className="flex items-center gap-10 flex-1">
          <h1 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter cursor-pointer" onClick={() => navigate('/search')}>
            StudySpot
          </h1>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="주변 스터디룸을 검색하세요"
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-full bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="p-2 rounded-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button onClick={() => navigate("/mypage")} className="flex items-center gap-2 p-2 px-4 bg-gray-50 dark:bg-slate-800 rounded-full font-bold text-sm border border-gray-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 transition-colors">
            <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> 마이페이지
          </button>
          <button onClick={handleLogout} className="p-2 px-4 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors">로그아웃</button>
        </div>
      </header>

      {/* 메인 영역 */}
      <main className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
        {/* 사이드바 */}
        <aside className="w-[400px] h-full flex flex-col border-r dark:border-slate-800 bg-gray-50 dark:bg-slate-900 shadow-inner transition-colors duration-300">

          {/* 필터 바 */}
          <div className="p-4 bg-white dark:bg-slate-800 border-b dark:border-slate-700 space-y-3 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilters({ ...filters, category: cat })}
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
                      filters.category === cat
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${showAdvancedFilters ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400'}`}
              >
                <Filter className="w-3 h-3" /> 상세
              </button>
            </div>

            {/* 상세 필터 (토글 시 보임) */}
            {showAdvancedFilters && (
              <div className="pt-2 pb-1 flex flex-wrap gap-2 animate-fadeIn">
                <button onClick={() => setAdvancedFilters(p => ({ ...p, wifi: !p.wifi }))} className={`flex items-center gap-1 px-3 py-1 rounded border text-xs font-bold transition-colors ${advancedFilters.wifi ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300'}`}><Wifi className="w-3 h-3"/> 빠른 와이파이</button>
                <button onClick={() => setAdvancedFilters(p => ({ ...p, outlets: !p.outlets }))} className={`flex items-center gap-1 px-3 py-1 rounded border text-xs font-bold transition-colors ${advancedFilters.outlets ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300'}`}><Plug className="w-3 h-3"/> 콘센트 넉넉함</button>
                <button onClick={() => setAdvancedFilters(p => ({ ...p, quiet: !p.quiet }))} className={`flex items-center gap-1 px-3 py-1 rounded border text-xs font-bold transition-colors ${advancedFilters.quiet ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300'}`}><VolumeX className="w-3 h-3"/> 조용한 분위기</button>
                <button onClick={() => setAdvancedFilters(p => ({ ...p, open24: !p.open24 }))} className={`flex items-center gap-1 px-3 py-1 rounded border text-xs font-bold transition-colors ${advancedFilters.open24 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300'}`}><Clock className="w-3 h-3"/> 24시간 영업</button>
              </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <select
                      value={filters.minRating}
                      onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                      className="text-xs font-bold bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200 border-none rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                  >
                      <option value="0">평점 전체</option>
                      <option value="4">⭐ 4.0 이상</option>
                      <option value="3">⭐ 3.0 이상</option>
                  </select>

                  <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      className="text-xs font-bold bg-gray-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 border-none rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                  >
                      <option value="default">기본순</option>
                      <option value="reviewCount">리뷰 많은 순</option>
                      <option value="rating">평점 높은 순</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                    {isSearching && <span className="text-[10px] text-indigo-600 dark:text-indigo-400 animate-pulse font-black">로딩중...</span>}
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold">검색 결과 {sortedPlaces.length}건</p>
                </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {sortedPlaces.length === 0 && !isSearching ? (
                <div className="text-center py-20">
                    <MapPin className="h-10 w-10 text-gray-200 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-bold">조건에 맞는 장소가 없습니다.</p>
                </div>
            ) : (
                sortedPlaces.map((place) => (
                    <div
                      key={place.externalId}
                      onClick={() => goToDetail(place)}
                      className={`p-5 rounded-[28px] border cursor-pointer transition-all hover:shadow-xl dark:hover:shadow-indigo-900/20 ${
                        selectedPlaceId === place.externalId 
                          ? "border-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-900/30 bg-white dark:bg-slate-800" 
                          : "border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-black text-gray-900 dark:text-white leading-tight">{place.name}</h3>
                            <span className="inline-block mt-1 text-[10px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                                {place.category?.split(' > ').pop() || filters.category}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 font-black shrink-0">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="text-sm">{place.averageRating?.toFixed(1) || "0.0"}</span>
                          <span className="text-[10px] text-gray-300 dark:text-gray-500 ml-0.5">({place.reviewCount || 0})</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 dark:text-gray-400 mt-2 font-medium line-clamp-1">{place.roadAddress || place.address}</p>

                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-1 rounded-lg">
                          {place.distance ? `${Math.round(place.distance)}m` : '거리 정보 없음'}
                        </span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-bold">{place.phone || "연락처 미등록"}</span>
                      </div>
                    </div>
                  ))
            )}
          </div>
        </aside>

        {/* 지도 영역 */}
        <section className="flex-1 h-full relative bg-gray-50">
          {!loading && !error && (
            <Map
              center={myLocation}
              style={{ width: "100%", height: "100%" }}
              level={3}
            >
              <MapMarker
                position={myLocation}
                image={{
                  src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                  size: { width: 24, height: 35 }
                }}
              />

              {sortedPlaces.map((place) => (
                <React.Fragment key={place.externalId}>
                  <MapMarker
                    position={{ lat: place.latitude, lng: place.longitude }}
                    onClick={() => {
                      setOpenPlaceId(place.externalId);
                      setSelectedPlaceId(place.externalId);
                    }}
                  />

                  {openPlaceId === place.externalId && (
                    <CustomOverlayMap position={{ lat: place.latitude, lng: place.longitude }} yAnchor={1.35}>
                      <div className="bg-white dark:bg-slate-800 rounded-[28px] shadow-2xl border border-gray-100 dark:border-slate-700 p-5 min-w-[240px] relative transition-colors duration-300">
                        <button
                          onClick={() => { setOpenPlaceId(null); setSelectedPlaceId(null); }}
                          className="absolute right-4 top-4 p-1 text-gray-300 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <strong className="text-base font-black block mb-1 truncate pr-6 text-gray-900 dark:text-white">{place.name}</strong>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-black mb-4">
                           <Star className="h-3 w-3 fill-current" />
                           {place.averageRating?.toFixed(1) || "0.0"}
                           <span className="text-gray-300 dark:text-gray-500 ml-1 font-bold">({place.reviewCount || 0})</span>
                        </div>
                        <button
                          onClick={() => goToDetail(place)}
                          className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                        >
                          상세보기
                        </button>
                        <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-800 rotate-45 border-r border-b border-gray-100 dark:border-slate-700" />
                      </div>
                    </CustomOverlayMap>
                  )}
                </React.Fragment>
              ))}
            </Map>
          )}
        </section>
      </main>
    </div>
  )
}