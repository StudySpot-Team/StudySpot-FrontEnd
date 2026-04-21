"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Camera, Eye, ShieldCheck, AlertTriangle } from "lucide-react"

export default function ProfileSettings() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
  });

  // 1. 초기 데이터 로드
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      try {
        const response = await fetch("http://localhost:8080/api/mypage/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();
        const userData = result.data || result;
        if (userData) {
          setUserId(userData.id || userData.userId);
          setFormData(prev => ({
            ...prev,
            nickname: userData.nickname,
            email: userData.email,
          }));
        }
      } catch (err) { console.error("데이터 로딩 실패:", err); }
    };
    fetchUserData();
  }, [token]);

  // 2. 닉네임 변경 저장 함수
  const handleSaveNickname = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/me/nickname?userId=${userId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ nickname: formData.nickname })
      });

      if (response.ok) {
        alert("닉네임이 변경되었습니다! ✨");
        navigate("/mypage");
      } else {
        const errorMsg = await response.text();
        alert(errorMsg || "닉네임 변경에 실패했습니다. 중복 여부를 확인해주세요.");
      }
    } catch (err) { alert("서버 통신 중 오류가 발생했습니다."); }
  };

  // 3. 회원 탈퇴 함수
  const handleWithdraw = async () => {
    // 사용자에게 한 번 더 물어보기
    if (!window.confirm("정말로 탈퇴하시겠습니까? 작성하신 리뷰와 찜 목록 등 모든 데이터가 영구적으로 삭제됩니다.")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/users/me?userId=${userId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert("그동안 StudySpot을 이용해 주셔서 감사합니다. 회원 탈퇴가 완료되었습니다.");
        localStorage.clear();
        navigate("/login");
      } else {
        alert("탈퇴 처리 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("탈퇴 오류:", err);
      alert("서버와 통신할 수 없습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="mx-auto max-w-[500px] px-5 py-6">
        {/* Header */}
        <header className="mb-8 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-black text-gray-900">프로필 설정</h1>
        </header>

        <section className="mb-10 flex flex-col items-center text-center">
          <div className="relative">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md">
              <span className="text-4xl font-black text-white">{formData.nickname?.charAt(0) || "S"}</span>
            </div>
          </div>
          <p className="mt-4 text-xs font-bold text-gray-300 italic px-10 leading-relaxed">
            프로필 사진 기능은 추후에 도입 될 예정입니다
          </p>
        </section>

        {/* 정보 입력 폼 */}
        <div className="space-y-6">
          {/* 아이디 & 이메일 */}
          <div>
            <label className="text-xs font-bold text-gray-400 ml-1 mb-2 block uppercase tracking-wider">아이디 (이메일)</label>
            <div className="w-full px-5 py-4 bg-gray-100 rounded-[24px] text-gray-400 font-bold border border-transparent">
              {formData.email}
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="text-xs font-bold text-gray-400 ml-1 mb-2 block uppercase tracking-wider">비밀번호</label>
            <div className="w-full px-5 py-4 bg-gray-100 rounded-[24px] text-gray-300 font-black tracking-widest flex justify-between items-center">
              <span>••••••••••••</span>
              <ShieldCheck size={16} className="text-gray-300" />
            </div>
          </div>

          {/* 닉네임 */}
          <div>
            <label className="text-xs font-bold text-indigo-500 ml-1 mb-2 block uppercase tracking-wider">변경할 닉네임</label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({...formData, nickname: e.target.value})}
              className="w-full px-5 py-4 bg-indigo-50/30 rounded-[24px] text-gray-900 font-black border-2 border-indigo-100 focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-sm"
              placeholder="닉네임을 입력해주세요"
            />
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSaveNickname}
          className="mt-12 w-full py-5 bg-indigo-600 text-white rounded-[32px] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all"
        >
          설정 저장하기
        </button>

        {/* Danger Zone */}
        <section className="mt-10 border-t border-gray-100 pt-8">
           <h2 className="text-sm font-bold text-red-500 flex items-center gap-2 mb-4 uppercase tracking-widest">
            <AlertTriangle size={16} /> 위험 구역
          </h2>
          <p className="mb-4 text-xs font-medium text-gray-400 leading-relaxed px-1">
            회원 탈퇴 시 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다. 예약 내역, 리뷰 등 모든 정보가 사라집니다.
          </p>
          <button
            onClick={handleWithdraw}
            className="w-full rounded-[32px] border-2 border-red-500 py-4 font-black text-red-500 hover:bg-red-50 transition-all active:scale-[0.98]"
          >
            회원 탈퇴
          </button>
        </section>
      </div>
    </div>
  )
}