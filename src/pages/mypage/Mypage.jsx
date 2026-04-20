import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MessageSquarePlus, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function MyReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    fetch("http://localhost:8080/api/mypage/me", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("유저 정보를 불러올 수 없습니다.");
        return res.json();
      })
      .then((userData) => {
        const realUserId = userData.id || userData.userId;

        if (!realUserId) throw new Error("유저 ID가 없습니다.");

        return fetch(`http://localhost:8080/api/reviews/user/${realUserId}`);
      })
      .then((res) => {
        if (!res.ok) throw new Error("리뷰 내역을 불러올 수 없습니다.");
        return res.json();
      })
      .then((data) => {
        setReviews(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("에러 발생:", err);
        setLoading(false);
      });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-gray-200/50 bg-white/80 px-4 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-gray-900 flex-1">나의 리뷰 내역</h1>
      </header>

      <motion.div
        className="mx-auto max-w-[600px] p-4 pt-6 space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 총 리뷰 갯수 요약 */}
        <motion.div variants={itemVariants} className="flex items-center justify-between px-2 mb-2">
          <span className="text-sm font-bold text-gray-500">
            총 <span className="text-indigo-600 font-black">{reviews.length}</span>개의 리뷰를 작성했어요
          </span>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : reviews.length === 0 ? (
          <motion.div variants={itemVariants} className="rounded-[32px] bg-white p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center mt-10">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <MessageSquarePlus className="h-10 w-10 text-gray-300" />
            </div>
            <p className="text-lg font-black text-gray-900 mb-1">작성한 리뷰가 없습니다</p>
            <p className="text-sm text-gray-400 font-medium">방문했던 장소의 첫 리뷰를 남겨보세요!</p>
          </motion.div>
        ) : (
          // 리뷰가 있을 때 보여줄 목록
          reviews.map((review) => (
            <motion.div key={review.id} variants={itemVariants} className="rounded-[32px] bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              {/* 장소 정보 & 별점 */}
              <div className="flex justify-between items-start mb-4">
                <div
                  className="cursor-pointer group flex items-center gap-2"
                  onClick={() => navigate(`/detail/${review.place?.externalId}?name=${encodeURIComponent(review.place?.name)}&lat=${review.place?.latitude}&lng=${review.place?.longitude}`)}
                >
                  <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                    <MapPin className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {review.place?.name || "알 수 없는 장소"}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                      {new Date(review.createdAt).toLocaleDateString()} 작성
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100/50">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-black text-amber-700">{review.rating}</span>
                </div>
              </div>

              {/* 리뷰 내용 */}
              <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-800 leading-relaxed font-medium">
                {review.content}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}