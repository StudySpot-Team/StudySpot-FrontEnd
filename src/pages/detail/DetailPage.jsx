import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Phone, ExternalLink, Navigation, Zap, VolumeX, MousePointer, MessageSquarePlus } from "lucide-react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

export default function DetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mapLoading] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY,
  });

  useEffect(() => {
    const name = searchParams.get("name");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    const url = `http://localhost:8080/api/places/${id}?name=${encodeURIComponent(name)}&lat=${lat}&lng=${lng}`;

    fetch(url)
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          setPlace(res.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("데이터 로드 실패:", error);
        setLoading(false);
      });
  }, [id, searchParams]);

  const goToKakaoMapDetail = () => {
    if (place && place.placeUrl) {
      window.open(place.placeUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleWriteReview = () => {
    const query = new URLSearchParams({
      name: place.name,
      address: place.roadAddress || place.address
    }).toString();

    navigate(`/reviews/write/${id}?${query}`);
  };

  if (loading) return <div className="p-10 text-center font-bold">장소 정보를 불러오는 중...</div>;
  if (!place) return <div className="p-10 text-center font-bold text-red-500">장소를 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <div className="p-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-bold">
          <ArrowLeft className="h-5 w-5" />
          <span>뒤로가기</span>
        </button>
      </div>

      <div className="relative h-72 w-full bg-gray-200 cursor-pointer group overflow-hidden shadow-inner" onClick={goToKakaoMapDetail}>
        <img src={place.imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"} alt={place.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white font-bold border-2 border-white px-6 py-2.5 rounded-full text-sm flex items-center gap-2">
            <ExternalLink className="w-4 h-4" /> 카카오맵에서 사진/후기 더보기
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-12 relative z-10">
        <div className="rounded-[32px] bg-white p-8 shadow-2xl border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1 cursor-pointer group" onClick={goToKakaoMapDetail}>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                {place.name}
                <ExternalLink className="h-5 w-5 text-gray-200 group-hover:text-indigo-400" />
              </h2>
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

          <div className="mt-12">
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" /> 위치 확인
            </h3>
            <div className="h-48 w-full rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
              {!mapLoading && (
                <Map center={{ lat: place.latitude, lng: place.longitude }} style={{ width: "100%", height: "100%" }} level={3}>
                  <MapMarker position={{ lat: place.latitude, lng: place.longitude }} />
                </Map>
              )}
            </div>
          </div>

          <div className="mt-12 pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-black text-gray-900">방문자 리뷰 ({place.reviewCount || 0})</h3>
              <button onClick={handleWriteReview} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                리뷰 쓰기
              </button>
            </div>
            {(!place.reviewCount || place.reviewCount === 0) && (
              <div className="bg-gray-50 rounded-[24px] p-10 flex flex-col items-center justify-center border border-dashed border-gray-200">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                  <MessageSquarePlus className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-500">아직 등록된 리뷰가 없습니다.</p>
                <p className="text-xs text-gray-400 mt-1.5 font-medium">첫 번째 리뷰를 작성해 보세요!</p>
              </div>
            )}
          </div>

          <div className="mt-10 flex gap-3">
            <a href={`https://map.kakao.com/link/to/${place.name},${place.latitude},${place.longitude}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-indigo-100 active:scale-95 no-underline">
              <Navigation className="h-6 w-6" />길찾기 시작
            </a>
            {place.phone && (
              <a href={`tel:${place.phone}`} className="px-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all border border-gray-200">
                <Phone className="h-6 w-6" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}