import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Star, MapPin, Phone, ExternalLink,
  Navigation, MessageSquarePlus, Heart, ChevronRight, Flame
} from "lucide-react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

export default function DetailPage() {
  const navigate = useNavigate();
  const { id: externalId } = useParams();
  const [searchParams] = useSearchParams();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const [viewerCount, setViewerCount] = useState(1);

  const userId = 1;

  const [mapLoading] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY,
  });

  // --- 1. 장소 기본 정보 로드 ---
  useEffect(() => {
    const name = searchParams.get("name");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    const safeName = (!name || name === "null" || name === "undefined") ? "" : name;
    const safeLat = (!lat || lat === "null" || lat === "undefined") ? "0.0" : lat;
    const safeLng = (!lng || lng === "null" || lng === "undefined") ? "0.0" : lng;

    const fetchPlaceDetail = async () => {
      try {
        const url = `http://localhost:8080/api/places/${externalId}?name=${encodeURIComponent(safeName)}&lat=${safeLat}&lng=${safeLng}`;
        const response = await fetch(url);
        const res = await response.json();

        // 백엔드에서 ApiResponse로 감싸서 오므로 res.data 사용
        if (res.data) {
          setPlace(res.data);
          await fetchFavoriteStatus();
        }
        setLoading(false);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        setLoading(false);
      }
    };

    fetchPlaceDetail();
  }, [externalId, searchParams]);

  // --- 2. 실시간 현재 보고 있는 사람 수 추적 로직 ---
  useEffect(() => {
    if (!externalId) return;

    const sessionId = sessionStorage.getItem("viewSessionId") || crypto.randomUUID();
    sessionStorage.setItem("viewSessionId", sessionId);

    const joinUrl = `http://localhost:8080/api/places/${externalId}/viewing?sessionId=${sessionId}`;
    const leaveUrl = `http://localhost:8080/api/places/${externalId}/viewing/leave?sessionId=${sessionId}`;

    const sendHeartbeat = async () => {
      try {
        const response = await fetch(joinUrl, { method: 'POST' });
        if (response.ok) {
          const result = await response.json();
          setViewerCount(result.data || 1);
        }
      } catch (err) {
        console.error("하트비트 전송 실패", err);
      }
    };

    sendHeartbeat();

    // 3초마다 갱신
    const intervalId = setInterval(sendHeartbeat, 3000);

    // 브라우저 창 닫기/새로고침 시에만 즉시 이탈 처리
    const handleBeforeUnload = () => {
      navigator.sendBeacon(leaveUrl);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      navigator.sendBeacon(leaveUrl);
    };
  }, [externalId]);

  // --- 3. 부가 기능 (찜, 외부 링크, 리뷰 이동) ---
  const fetchFavoriteStatus = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/favorites/check?userId=${userId}&placeId=${externalId}`);
      const status = await res.json();
      setIsFavorite(Boolean(status));
    } catch (err) {
      console.error("찜 상태 확인 실패:", err);
      setIsFavorite(false);
    }
  };

  const handleToggleFavorite = async (e) => {
    if (e) e.stopPropagation();
    const previousState = isFavorite;
    setIsFavorite(!previousState);

    try {
      const response = await fetch(`http://localhost:8080/api/favorites/toggle?userId=${userId}&placeId=${externalId}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error("네트워크 응답 오류");
      const result = await response.text();
      setIsFavorite(result.trim() === "added");
    } catch (error) {
      console.error("찜하기 실패:", error);
      setIsFavorite(previousState);
    }
  };

  const goToKakaoMapDetail = () => {
    if (place && place.placeUrl) {
      window.open(place.placeUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleWriteReview = (e) => {
    if (e) e.stopPropagation();
    const query = new URLSearchParams({
      name: place.name,
      address: place.roadAddress || place.address
    }).toString();
    navigate(`/reviews/write/${externalId}?${query}`);
  };

  const handleViewAllReviews = () => {
    navigate(`/reviews/place/${externalId}?name=${encodeURIComponent(place.name)}`);
  };

  if (loading) return <div className="p-10 text-center font-bold">장소 정보를 불러오는 중...</div>;
  if (!place) return <div className="p-10 text-center font-bold text-red-500">장소를 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* 상단 헤더 */}
      <div className="p-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-bold">
          <ArrowLeft className="h-5 w-5" />
          <span>뒤로가기</span>
        </button>
        <button onClick={() => navigate("/mypage")} className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">
          마이페이지
        </button>
      </div>

      {/* 이미지 섹션 */}
      <div className="relative h-72 w-full bg-gray-200 cursor-pointer group overflow-hidden shadow-inner" onClick={goToKakaoMapDetail}>
        <img src={place.imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"} alt={place.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white font-bold border-2 border-white px-6 py-2.5 rounded-full text-sm flex items-center gap-2">
            <ExternalLink className="w-4 h-4" /> 카카오맵 상세정보
          </p>
        </div>
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all active:scale-90 z-20 ${
            isFavorite ? "bg-red-500 text-white" : "bg-white/90 text-gray-400"
          }`}
        >
          <Heart className={`h-6 w-6 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-12 relative z-10">
        <div className="rounded-[32px] bg-white p-8 shadow-2xl border border-gray-100">

          {viewerCount > 0 && (
            <div className="flex items-center gap-1.5 inline-flex bg-red-50 px-3 py-1.5 rounded-full border border-red-100 animate-pulse mb-4">
              <Flame className="w-4 h-4 text-red-500" />
              <span className="text-xs font-black text-red-600 tracking-tight">
                현재 {viewerCount}명이 이 장소를 보고 있어요!
              </span>
            </div>
          )}

          {/* 장소 기본 정보 */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">{place.name}</h2>
              <div className="mt-3 flex items-start gap-2 text-gray-500">
                <MapPin className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold leading-snug">{place.roadAddress || place.address}</span>
                  <span className="text-[11px] text-gray-400 mt-1">[지번] {place.address}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center bg-amber-50 px-4 py-3 rounded-2xl shrink-0 border border-amber-100">
              <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
              <span className="text-lg font-black text-amber-700 mt-0.5">{place.averageRating?.toFixed(1) || "0.0"}</span>
            </div>
          </div>

          {/* 지도 섹션 */}
          <div className="mt-12">
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" /> 위치 확인
            </h3>
            <div className="h-48 w-full rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
              {!mapLoading && place.latitude && place.longitude && (
                <Map center={{ lat: place.latitude, lng: place.longitude }} style={{ width: "100%", height: "100%" }} level={3}>
                  <MapMarker position={{ lat: place.latitude, lng: place.longitude }} />
                </Map>
              )}
            </div>
          </div>

          {/* 방문자 리뷰 섹션 */}
          <div className="mt-12 pb-4">
            <div className="flex justify-between items-center mb-5">
              <div
                onClick={handleViewAllReviews}
                className="group cursor-pointer flex items-center gap-1.5 hover:opacity-80 transition-all"
              >
                <h3 className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                  방문자 리뷰 ({place.reviewCount || 0})
                </h3>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <button
                onClick={handleWriteReview}
                className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
              >
                리뷰 쓰기
              </button>
            </div>

            {(!place.reviewCount || place.reviewCount === 0) ? (
              <div
                onClick={handleViewAllReviews}
                className="bg-gray-50 rounded-[24px] p-10 flex flex-col items-center justify-center border border-dashed border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors group"
              >
                <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquarePlus className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-500">아직 등록된 리뷰가 없습니다.</p>
                <p className="text-xs text-gray-400 mt-1.5 font-medium">첫 번째 리뷰를 작성해 보세요!</p>
              </div>
            ) : (
              <div
                onClick={handleViewAllReviews}
                className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-center cursor-pointer hover:bg-indigo-50 transition-colors"
              >
                <p className="text-xs font-bold text-indigo-600">스터디러들의 후기 보러가기 ✨</p>
              </div>
            )}
          </div>

          {/* 하단 버튼 바 */}
          <div className="mt-10 flex gap-3">
            <a
              href={`https://map.kakao.com/link/to/${place.name},${place.latitude},${place.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-indigo-100 active:scale-95 no-underline"
            >
              <Navigation className="h-6 w-6" />길찾기 시작
            </a>
            <button
              onClick={handleToggleFavorite}
              className={`px-6 flex items-center justify-center rounded-2xl transition-all border active:scale-90 ${
                isFavorite ? "bg-red-50 border-red-100 text-red-500" : "bg-gray-100 border-gray-200 text-gray-700"
              }`}
            >
              <Heart className={`h-6 w-6 ${isFavorite ? "fill-current" : ""}`} />
            </button>
            {place.phone && (
              <a href={`tel:${place.phone}`} className="px-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl border border-gray-200">
                <Phone className="h-6 w-6" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}