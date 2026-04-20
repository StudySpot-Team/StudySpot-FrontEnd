import React, { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Star, Pen, MapPin, ArrowLeft } from "lucide-react";

export default function WriteReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const placeName = searchParams.get("name") || "장소 정보";
  const placeAddress = searchParams.get("address") || "주소 정보 없음";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert("별점을 선택해주세요");
      return;
    }
    if (content.trim().length < 10) {
      alert("리뷰 내용을 10자 이상 입력해주세요");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");

      const userStr = localStorage.getItem("user");
      let currentUserId = 1;
      if (userStr) {
        const userData = JSON.parse(userStr);
        currentUserId = userData.id || userData.userId || 1;
      }

      const requestData = {
        userId: currentUserId,      // Long userId
        placeId: Number(id),        // Long placeId
        placeName: placeName,
        placeAddress: placeAddress,
        content: content.trim(),    // String content
        rating: rating              // Integer rating
      };

      const response = await fetch("http://localhost:8080/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      if (response.status === 401) {
        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/login");
        return;
      }

      if (!response.ok) throw new Error("등록 실패");

      alert("리뷰가 등록되었습니다!");
      navigate(`/detail/${id}?name=${encodeURIComponent(placeName)}`);
    } catch (error) {
      alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans text-gray-900">
      <header className="sticky top-0 z-50 bg-white border-b p-4">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-black">리뷰 작성</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-xl font-black mb-2">{placeName}</h2>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-bold">
            <MapPin className="h-4 w-4 text-indigo-500" />
            <span>{placeAddress}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
            <label className="block text-sm font-black mb-6 text-gray-700">학습 환경은 어떠셨나요?</label>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= displayRating ? "fill-amber-400 text-amber-400" : "fill-transparent text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-gray-700">
              <Pen className="h-4 w-4 text-indigo-600" />
              <label className="text-sm font-black">솔직한 후기</label>
            </div>
            <textarea
              className="w-full min-h-[160px] p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-medium"
              placeholder="최소 10자 이상 작성해주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-5 rounded-2xl text-white text-lg font-black shadow-xl transition-all active:scale-[0.98] ${
              isSubmitting ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isSubmitting ? "등록 중..." : "리뷰 등록 완료"}
          </button>
        </form>
      </main>
    </div>
  );
}