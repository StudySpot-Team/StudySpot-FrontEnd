import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthForm from "./pages/auth/LoginPage";
import SearchPage from "./pages/search/SearchPage";
import DetailPage from "./pages/detail/DetailPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. 처음 접속 시  로그인 페이지로 자동 이동 */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 2. 로그인 및 회원가입 페이지 */}
        <Route path="/login" element={<AuthForm />} />

        {/* 3. 탐색 페이지 */}
        <Route path="/search" element={<SearchPage />} />

        {/* 4. 상세 및 예약 페이지 경로를 뚫어줍니다! */}
        <Route path="/detail/:id" element={<DetailPage />} />

        {/* 5. 잘못된 주소로 들어오면 로그인으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;