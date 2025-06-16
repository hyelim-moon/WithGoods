import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 서버에서 현재 사용자 정보 확인
  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:8080/current-user', {
        withCredentials: true
      });
      
      if (response.data && response.data.username) {
        setUser({
          username: response.data.username,
          nickname: response.data.nickname,
          role: response.data.role
        });
        
        // 로컬스토리지도 업데이트
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('nickname', response.data.nickname);
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('isAdmin', response.data.role === 'ADMIN' ? 'true' : 'false');
      } else {
        // 서버에서 로그인 정보가 없으면 로컬스토리지도 클리어
        setUser(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('nickname');
        localStorage.removeItem('role');
        localStorage.removeItem('isAdmin');
      }
    } catch (error) {
      console.log('서버 세션 확인 실패:', error);
      // 서버 에러 시 로컬스토리지도 클리어
      setUser(null);
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      localStorage.removeItem('nickname');
      localStorage.removeItem('role');
      localStorage.removeItem('isAdmin');
    } finally {
      setLoading(false);
    }
  };

  // 앱 로드시 서버 세션 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 로그아웃 이벤트 리스너
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setLoading(false);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
