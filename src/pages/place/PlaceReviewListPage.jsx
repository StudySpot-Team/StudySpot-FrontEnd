import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Star, MessageSquare, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const AVATARS = ["🐰", "🐻", "🦊", "🐼", "🐨", "🦁", "🐯", "🐸", "🐵", "🐶", "🐱", "🦄"];
const AVATAR_COLORS = [
  "bg-pink-100", "bg-amber-100", "bg-orange-100", "bg-emerald-100",
  "bg-sky-100", "bg-violet-100", "bg-rose-100", "bg-lime-100",
];

const getAvatar = (id) => AVATARS[id % AVATARS.length];
const getAvatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

export default function PlaceReviewListPage() {
  const navigate = useNavigate();
  const { externalId } = useParams();
  const [searchParams] = useSearchParams();
  const placeName = searchParams.get("name") || "장소 정보";

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaceReviews = async () => {
      try {
        // 백엔드 API 호출
        const response = await fetch(`http://localhost:8080/api/reviews/place/${externalId}`);
        const result = await response.json();

        setReviews(result.data || result || []);
      } catch (error) {
        console.error("리뷰 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceReviews();
  }, [externalId]);

  // 평균 별점 계산
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-gray-50/80 pb-16 font-sans">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100/50">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{placeName}</h1>
            <p className="text-xs text-gray-500 font-medium">리뷰 전체보기</p>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 pt-6 space-y-5">
        {/* 통계 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-1"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100/50">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-black text-amber-700">{averageRating}</span>
            </div>
            <p className="text-sm font-bold text-gray-500">
              총 <span className="text-indigo-600">{reviews.length}개</span>의 방문자 리뷰
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-8 w-8 text-indigo-600" />
            </motion.div>
            <p className="text-sm font-bold text-gray-400">후기를 가져오고 있어요...</p>
          </div>
        ) : reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm mt-6"
          >
            <MessageSquare className="h-10 w-10 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold">아직 리뷰가 없어요</p>
            <button
              onClick={() => navigate(`/reviews/write/${externalId}?name=${encodeURIComponent(placeName)}`)}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold text-sm"
            >
              첫 리뷰 작성하기
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${getAvatarColor(review.id)} rounded-full flex items-center justify-center text-lg shadow-sm`}>
                      {getAvatar(review.id)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-800">익명의 스터디러</p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {new Date(review.createdAt).toLocaleDateString()} 방문
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-black text-amber-700">{review.rating}.0</span>
                  </div>
                </div>
                <p className="text-[14px] text-gray-700 leading-relaxed font-medium">
                  {review.content}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}