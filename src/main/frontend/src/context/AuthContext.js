import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 로그인 직후 서버가 준 사용자 정보를 곧바로 반영하는 헬퍼
  const applyUser = (u) => {
    if (!u) {
      setUser(null);
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      localStorage.removeItem('nickname');
      localStorage.removeItem('role');
      localStorage.removeItem('isAdmin');
      return;
    }
    setUser({
      username: u.username,
      nickname: u.nickname,
      role: u.role
    });
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', u.username ?? '');
    localStorage.setItem('nickname', u.nickname ?? '');
    localStorage.setItem('role', u.role ?? '');
    localStorage.setItem('isAdmin', u.role === 'ADMIN' ? 'true' : 'false');
  };

  // 서버에서 현재 사용자 정보 확인
  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:8080/current-user', {
        withCredentials: true
      });
      if (response.data && response.data.username) {
        applyUser(response.data);
      } else {
        applyUser(null);
      }
    } catch (error) {
      console.log('서버 세션 확인 실패:', error);
      applyUser(null);
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
      <AuthContext.Provider value={{ user, setUser, loading, checkAuthStatus, applyUser }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
