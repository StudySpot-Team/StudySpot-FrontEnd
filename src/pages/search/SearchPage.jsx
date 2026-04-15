"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Star, Search, MapPin, X, Navigation, Bell, User, ChevronDown } from "lucide-react"
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk"

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [openPlaceId, setOpenPlaceId] = useState(null);
  const [places, setPlaces] = useState([]);
  const [myLocation, setMyLocation] = useState({ lat: 37.4980, lng: 127.0276 });
  const [isSearching, setIsSearching] = useState(false);

  // UI 상태 관리
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, content: "예약하신 스터디룸 이용 시간이 30분 남았습니다.", time: "방금 전" },
    { id: 2, content: "새로운 후기가 등록되었습니다.", time: "1시간 전" }
  ]);

  // 카카오 지도 API 로드
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY,
  });

  /**
   * 로그아웃 처리 함수
   */
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setIsMyPageOpen(false);

      navigate("/login", { replace: true });

    }
  };

  // 주변 장소 데이터 가져오기
  const fetchNearbyPlaces = async (lat, lng) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/places/nearby?keyword=스터디룸&lat=${lat}&lng=${lng}&radius=2000`
      );
      if (response.ok) {
        const result = await response.json();
        setPlaces(result.data || []);
      }
    } catch (err) {
      console.error("백엔드 연결 실패", err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setMyLocation({ lat: latitude, lng: longitude });
        fetchNearbyPlaces(latitude, longitude);
      });
    }
  }, []);

  const goToDetail = (place) => {
    const url = `/detail/${place.externalId}?name=${encodeURIComponent(place.name)}&lat=${myLocation.lat}&lng=${myLocation.lng}`;
    navigate(url);
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans">
      {/* --- 상단 헤더 영역 --- */}
      <header className="border-b bg-white px-6 py-3 flex items-center justify-between shadow-sm z-[1001]">
        <div className="flex items-center gap-10 flex-1">
          <h1
            className="text-2xl font-black text-indigo-600 tracking-tighter cursor-pointer"
            onClick={() => navigate('/search')}
          >
            StudySpot
          </h1>

          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate('/reservations')}
              className="text-[15px] font-bold text-gray-700 hover:text-indigo-600 transition-all"
            >
              예약하기
            </button>
          </nav>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="주변 스터디룸을 검색하세요"
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 알림 섹션 */}
          <div className="relative">
            <button
              onClick={() => setIsNotiOpen(!isNotiOpen)}
              className={`relative p-2.5 rounded-full transition-colors ${isNotiOpen ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Bell className="h-5.5 w-5.5" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {isNotiOpen && (
              <div className="absolute right-0 top-full pt-2 w-80 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <span className="font-bold text-sm text-gray-800">최근 알림</span>
                    <button onClick={() => setNotifications([])} className="text-xs text-gray-400 hover:text-gray-600">모두 지우기</button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(noti => (
                        <div key={noti.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                          <p className="text-sm text-gray-700 leading-snug">{noti.content}</p>
                          <span className="text-[11px] text-gray-400 mt-1 block">{noti.time}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-400 text-sm">새로운 알림이 없습니다.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 마이페이지 섹션 */}
          <div
            className="relative ml-2"
            onMouseEnter={() => setIsMyPageOpen(true)}
            onMouseLeave={() => setIsMyPageOpen(false)}
          >
            <button className="flex items-center gap-2 p-2 px-4 bg-gray-50 text-gray-800 font-bold hover:bg-gray-100 rounded-full transition-all text-sm border border-gray-100">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-indigo-600" />
              </div>
              마이페이지
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isMyPageOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMyPageOpen && (
              <div className="absolute right-0 top-full pt-2 w-48 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-white border border-gray-100 shadow-2xl rounded-2xl py-2 overflow-hidden">
                  <button onClick={() => navigate('/wishlist')} className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors font-semibold">찜 목록</button>
                  <button onClick={() => navigate('/my-reviews')} className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors font-semibold">후기 작성/조회</button>
                  <button onClick={() => navigate('/profile-edit')} className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors font-semibold">내 정보 수정</button>
                  <div className="my-1 border-t border-gray-50"></div>
                  {/* 로그아웃 버튼 */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-bold"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* 사이드바 및 지도 영역 */}
        <aside className="w-full lg:w-[400px] overflow-y-auto border-r p-4 space-y-4 bg-gray-50">
          <div className="flex justify-between items-center px-1">
            <p className="text-sm text-gray-500 font-bold">검색 결과 {places.length}건</p>
            {isSearching && <span className="text-xs text-indigo-600 animate-pulse font-bold">로딩 중</span>}
          </div>

          {places.map((place) => (
            <div
              key={place.externalId}
              onClick={() => {
                setSelectedPlaceId(place.externalId);
                setOpenPlaceId(place.externalId);
                setMyLocation({ lat: place.latitude, lng: place.longitude });
              }}
              className={`p-5 rounded-2xl border bg-white cursor-pointer transition-all hover:shadow-lg ${
                selectedPlaceId === place.externalId ? "border-indigo-600 ring-2 ring-indigo-50 shadow-md scale-[1.02]" : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 text-lg">{place.name}</h3>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span className="text-xs font-bold">{place.averageRating?.toFixed(1) || "0.0"}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{place.roadAddress || place.address}</p>
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50">
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{Math.round(place.distance)}m</span>
                <span className="text-xs text-gray-400 font-medium">{place.phone || "전화번호 정보 없음"}</span>
              </div>
            </div>
          ))}
        </aside>

        <section className="hidden lg:flex flex-1 relative">
          {!loading && !error && (
            <Map center={myLocation} style={{ width: "100%", height: "100%" }} level={3}>
              <MapMarker
                position={myLocation}
                image={{
                  src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                  size: { width: 24, height: 35 }
                }}
                title="현재 위치"
              />

              {places.map((place) => (
                <React.Fragment key={place.externalId}>
                  <MapMarker
                    position={{ lat: place.latitude, lng: place.longitude }}
                    onClick={() => setOpenPlaceId(place.externalId)}
                  />

                  {(openPlaceId === place.externalId || selectedPlaceId === place.externalId) && (
                    <CustomOverlayMap position={{ lat: place.latitude, lng: place.longitude }} yAnchor={1.2}>
                      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 min-w-[220px] relative animate-in zoom-in duration-200">
                        <button
                          onClick={() => { setOpenPlaceId(null); setSelectedPlaceId(null); }}
                          className="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                        <div className="pr-4">
                          <strong className="text-sm font-black block truncate text-gray-900">{place.name}</strong>
                          <div className="flex items-center gap-1.5 text-amber-500 text-xs mt-1.5 font-bold">
                             <Star className="h-3 w-3 fill-current" />
                             {place.averageRating?.toFixed(1) || "0.0"}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button onClick={() => goToDetail(place)} className="flex-1 text-xs font-bold py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">상세보기</button>
                          <a href={`https://map.kakao.com/link/to/${place.name},${place.latitude},${place.longitude}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors no-underline">
                            <Navigation className="h-3 w-3" /> 길찾기
                          </a>
                        </div>
                        <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-100" />
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