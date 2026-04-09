"use client"

import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Wifi, Plug, Coffee, Clock } from "lucide-react";

export default function DetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [searchParams] = useSearchParams();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [id, searchParams]); // id나 파라미터가 바뀔 때마다 다시 호출

  if (loading) return <div className="p-10 text-center font-bold">장소 정보를 불러오는 중...</div>;
  if (!place) return <div className="p-10 text-center font-bold text-red-500">장소를 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 상단 뒤로가기 버튼 (추가하면 편해요!) */}
      <div className="p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600">
          <ArrowLeft className="h-5 w-5" />
          <span>뒤로가기</span>
        </button>
      </div>

      <div className="relative h-56 w-full bg-gray-200">
        <img
          src={place.imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"}
          alt={place.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">{place.name}</h2>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-gray-700">{place.averageRating}</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-gray-500">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{place.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
}