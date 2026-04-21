import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthForm from "./pages/auth/LoginPage";
import SearchPage from "./pages/search/SearchPage";
import DetailPage from "./pages/detail/DetailPage";
import FindPassword from "./pages/auth/FindPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import WriteReviewPage from "./pages/review/WriteReviewPage";
import ReviewListPage from "./pages/review/ReviewListPage";
import MyPage from "./pages/mypage/MyPage";
import PlaceReviewListPage from "./pages/place/PlaceReviewListPage";
import FavoriteListPage from "./pages/mypage/FavoriteListPage";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("accessToken");
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. 처음 접속 시 탐색 페이지로 자동 이동 */}
        <Route path="/" element={<Navigate to="/search" />} />

        {/* 2. 로그인 및 회원가입 페이지 */}
        <Route path="/login" element={<AuthForm />} />

        {/* 3. 비밀번호 찾기 및 재설정 페이지 */}
        <Route path="/find-password" element={<FindPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 4. 탐색 페이지 */}
        <Route path="/search" element={<SearchPage />} />

        {/* 5. 상세 페이지 */}
        <Route path="/detail/:id" element={<DetailPage />} />

        {/* 6. 리뷰 작성 페이지 */}
        <Route path="/reviews/write/:id" element={<WriteReviewPage />} />

        {/* 7. 예약 내역 페이지 */}
        <Route path="/reservations" element={<div>예약 내역 페이지 (준비 중)</div>} />

        {/* 8. 마이페이지 */}
        <Route path="/mypage" element={ <PrivateRoute><MyPage /></PrivateRoute>} />

        {/* 9. 리뷰 내역 페이지 */}
        <Route path="/mypage/reviews" element={<PrivateRoute><ReviewListPage /></PrivateRoute>} />

        {/* 10. 장소 리뷰 목록 페이지 */}
        <Route path="/reviews/place/:externalId" element={<PlaceReviewListPage />} />

        {/* 11. 즐겨찾기 목록 페이지 */}
        <Route path="/mypage/favorites" element={<FavoriteListPage />} />

        {/* 12. 잘못된 주소 처리 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;