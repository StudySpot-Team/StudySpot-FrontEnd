"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Star, Search, MapPin } from "lucide-react"
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk"

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [places, setPlaces] = useState([]);
  const [myLocation, setMyLocation] = useState({ lat: 37.4980, lng: 127.0276 });
  const [isSearching, setIsSearching] = useState(false);

  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY,
  });

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
    } else {
      fetchNearbyPlaces(myLocation.lat, myLocation.lng);
    }
  }, []);

  // 상세 페이지로 이동하는 공통 함수
  const goToDetail = (place) => {
    setSelectedPlaceId(place.externalId);
    const url = `/detail/${place.externalId}?name=${encodeURIComponent(place.name)}&lat=${myLocation.lat}&lng=${myLocation.lng}`;
    navigate(url);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="border-b bg-white p-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-2xl font-bold text-indigo-600">StudySpot</h1>
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
        <aside className="w-full lg:w-[400px] overflow-y-auto border-r p-4 space-y-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500 font-medium">검색 결과 {places.length}건</p>
            {isSearching && <span className="text-xs text-indigo-600 animate-pulse">불러오는 중...</span>}
          </div>

          {places.map((place) => (
            <div
              key={place.externalId}
              onClick={() => goToDetail(place)}
              className={`p-4 rounded-xl border bg-white cursor-pointer transition-all hover:shadow-md ${
                selectedPlaceId === place.externalId ? "border-indigo-600 ring-1 ring-indigo-600 shadow-md" : "border-gray-200"
              }`}
            >
              <h3 className="font-bold text-gray-900">{place.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{place.roadAddress || place.address}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-semibold text-indigo-600">{Math.round(place.distance)}m</span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-600">{place.phone || "전화번호 없음"}</span>
              </div>
            </div>
          ))}
        </aside>

        <section className="hidden lg:flex flex-1 relative">
          {!loading && !error && (
            <Map center={myLocation} style={{ width: "100%", height: "100%" }} level={4}>
              <MapMarker
                position={myLocation}
                image={{ src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png", size: { width: 34, height: 35 } }}
                title="내 위치"
              />
              {places.map((place) => (
                <MapMarker
                  key={place.externalId}
                  position={{ lat: place.latitude, lng: place.longitude }}
                  title={place.name}
                  onClick={() => goToDetail(place)}
                />
              ))}
            </Map>
          )}
        </section>
      </main>
    </div>
  )
}