import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
// import MePage from './MePage'; // (선택) 만든 경우만 import
// import HomePage from './HomePage'; // (선택) 홈 화면 있는 경우

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<div>홈 화면입니다</div>} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                {/* <Route path="/me" element={<MePage />} /> */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
