"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Star, Search, MapPin, X, Navigation } from "lucide-react"
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk"

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [openPlaceId, setOpenPlaceId] = useState(null);
  const [places, setPlaces] = useState([]);
  const [myLocation, setMyLocation] = useState({ lat: 37.4980, lng: 127.0276 });
  const [isSearching, setIsSearching] = useState(false);

  // 카카오 지도 API 로드
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY,
  });

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

  // 상세 페이지 이동 함수
  const goToDetail = (place) => {
    const url = `/detail/${place.externalId}?name=${encodeURIComponent(place.name)}&lat=${myLocation.lat}&lng=${myLocation.lng}`;
    navigate(url);
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans">
      <header className="border-b bg-white p-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-2xl font-black text-indigo-600 tracking-tighter">StudySpot</h1>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="내 주변 스터디룸 검색 중..."
              className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* 사이드바 리스트 영역 */}
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

        {/* 지도 영역 */}
        <section className="hidden lg:flex flex-1 relative">
          {!loading && !error && (
            <Map center={myLocation} style={{ width: "100%", height: "100%" }} level={3}>
              {/* 현재 내 위치 마커 */}
              <MapMarker
                position={myLocation}
                image={{
                  src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                  size: { width: 24, height: 35 }
                }}
                title="현재 위치"
              />

              {/* 장소 마커들 */}
              {places.map((place) => (
                <React.Fragment key={place.externalId}>
                  <MapMarker
                    position={{ lat: place.latitude, lng: place.longitude }}
                    onClick={() => setOpenPlaceId(place.externalId)}
                  />

                  {/* 마커 위 정보창 (Overlay) */}
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
                             <span className="text-gray-400 font-medium">(리뷰 {place.reviewCount || 0})</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => goToDetail(place)}
                            className="flex-1 text-xs font-bold py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            상세보기
                          </button>
                          <a
                            href={`https://map.kakao.com/link/to/${place.name},${place.latitude},${place.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors no-underline"
                          >
                            <Navigation className="h-3 w-3" /> 길찾기
                          </a>
                        </div>
                        {/* 꼬리표 */}
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