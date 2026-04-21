import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Star, MapPin, Phone, ExternalLink,
  Navigation, Zap, VolumeX, MousePointer,
  MessageSquarePlus, Heart, ChevronRight
} from "lucide-react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

export default function DetailPage() {
  const navigate = useNavigate();
  const { id: externalId } = useParams();
  const [searchParams] = useSearchParams();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // 로그인 기능 구현 전까지 임시 userId 사용
  const userId = 1;

  const [mapLoading] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY,
  });

  useEffect(() => {
    const name = searchParams.get("name");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    const safeName = (!name || name === "null" || name === "undefined") ? "" : name;
    const safeLat = (!lat || lat === "null" || lat === "undefined") ? "0.0" : lat;
    const safeLng = (!lng || lng === "null" || lng === "undefined") ? "0.0" : lng;

    // 장소 상세 조회 API 호출
    const fetchPlaceDetail = async () => {
      try {
        const url = `http://localhost:8080/api/places/${externalId}?name=${encodeURIComponent(safeName)}&lat=${safeLat}&lng=${safeLng}`;
        const response = await fetch(url);
        const res = await response.json();

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

  // 찜 상태 확인 API
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

  // 찜하기 토글
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

  // 1. 리뷰 작성 페이지 이동
  const handleWriteReview = (e) => {
    if (e) e.stopPropagation(); // 부모 div의 클릭 이벤트 전파 방지
    const query = new URLSearchParams({
      name: place.name,
      address: place.roadAddress || place.address
    }).toString();
    navigate(`/reviews/write/${externalId}?${query}`);
  };

  // 2. 전체 리뷰 목록 페이지 이동 (새로 만든 기능)
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

          {/* 학습 환경 정보 */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="text-sm font-black text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>학습 환경 정보
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center p-4 bg-blue-50/50 rounded-2xl border border-blue-50">
                <Zap className="h-6 w-6 text-blue-500 mb-2" />
                <span className="text-[11px] font-black text-blue-700">콘센트 넉넉</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-purple-50/50 rounded-2xl border border-purple-50">
                <VolumeX className="h-6 w-6 text-purple-500 mb-2" />
                <span className="text-[11px] font-black text-purple-700">집중 잘됨</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-green-50/50 rounded-2xl border border-green-50">
                <MousePointer className="h-6 w-6 text-green-500 mb-2" />
                <span className="text-[11px] font-black text-green-700">노트북 환영</span>
              </div>
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

          {/* --- 방문자 리뷰 섹션 (클릭 가능하도록 수정) --- */}
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