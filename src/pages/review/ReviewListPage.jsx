import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MessageSquarePlus, MapPin, Trash2, Edit3, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function ReviewListPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(0);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    loadInitialData();
  }, [navigate]);

  // 1. 초기 데이터 로드 (내 정보 -> 리뷰 목록)
  const loadInitialData = async () => {
    if (!token) {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    try {
      const userRes = await fetch("http://localhost:8080/api/mypage/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const userData = await userRes.json();

      const currentId = userData.userId || userData.id;
      setUserId(currentId);

      const reviewRes = await fetch(`http://localhost:8080/api/reviews/user/${currentId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const response = await reviewRes.json();

      setReviews(response.data || response || []);
    } catch (err) {
      console.error("데이터 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. 수정 모드 시작
  const handleEditStart = (review) => {
    setEditingId(review.id);
    setEditContent(review.content);
    setEditRating(review.rating);
  };

  // 3. 수정 취소
  const handleEditCancel = () => {
    setEditingId(null);
    setEditContent("");
  };

  // 4. 수정 저장
  const handleEditSave = async (reviewId) => {
    if (!editContent.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/reviews/${reviewId}?userId=${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: editContent, rating: editRating })
      });

      const response = await res.json();

      if (res.ok) {
        // 성공 시 목록의 해당 데이터만 교체
        setReviews(reviews.map(r => r.id === reviewId ? response.data : r));
        setEditingId(null);
        alert("수정되었습니다.");
      } else {
        throw new Error(response.message || "수정 실패");
      }
    } catch (err) {
      alert("수정 중 오류가 발생했습니다: " + err.message);
    }
  };

  // 5. 삭제 처리 (
  const handleDelete = async (reviewId) => {
    if (!window.confirm("정말 이 리뷰를 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/reviews/${reviewId}?userId=${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        alert("삭제되었습니다.");
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("삭제 에러:", err);
      alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md">
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
        {/* 상단 리뷰 요약 */}
        <motion.div variants={itemVariants} className="flex items-center justify-between px-2 mb-2">
          <span className="text-sm font-bold text-gray-500">
            총 <span className="text-indigo-600 font-black">{reviews.length}</span>개의 리뷰
          </span>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : reviews.length === 0 ? (
          <motion.div variants={itemVariants} className="rounded-[32px] bg-white p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center mt-10">
            <MessageSquarePlus className="h-10 w-10 text-gray-300 mb-4" />
            <p className="text-lg font-black text-gray-900">작성한 리뷰가 없습니다</p>
          </motion.div>
        ) : (
          reviews.map((review) => (
            <motion.div key={review.id} layout variants={itemVariants} className="rounded-[32px] bg-white p-6 shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <MapPin className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900">{review.placeName || "장소 정보 없음"}</h3>
                    <p className="text-xs text-gray-400 font-medium">
                      {new Date(review.createdAt).toLocaleDateString()} 작성
                    </p>
                  </div>
                </div>

                {editingId !== review.id && (
                  <div className="flex gap-1">
                    <button onClick={() => handleEditStart(review)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(review.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )}
              </div>

              {editingId === review.id ? (
                /* --- 수정 모드 --- */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-2 bg-amber-50/50 rounded-2xl w-fit">
                    <span className="text-xs font-bold text-amber-700 px-2">별점 수정</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button key={num} onClick={() => setEditRating(num)}>
                          <Star className={`h-6 w-6 ${num <= editRating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-h-[120px] p-4 bg-gray-50 rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 outline-none text-sm transition-all"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={handleEditCancel} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl"><X className="h-4 w-4" /> 취소</button>
                    <button onClick={() => handleEditSave(review.id)} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl"><Check className="h-4 w-4" /> 저장</button>
                  </div>
                </div>
              ) : (
                /* --- 일반 모드 --- */
                <>
                  <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-800 leading-relaxed mb-3">
                    {review.content}
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 w-fit px-2.5 py-1.5 rounded-lg border border-amber-100/50">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-black text-amber-700">{review.rating}</span>
                  </div>
                </>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}