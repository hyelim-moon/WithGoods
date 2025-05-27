import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);


    // 앱 로드시 로컬스토리지에서 유저 정보 읽기
    useEffect(() => {
        const username = localStorage.getItem("username");
        const nickname = localStorage.getItem("nickname");
        const role = localStorage.getItem("role");

        if (username && nickname && role) {
            setUser({ username, nickname, role });
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
