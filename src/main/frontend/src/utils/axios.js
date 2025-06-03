import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 401 인증 에러 처리
    if (error.response?.status === 401) {
      // AuthContext의 user 상태를 null로 변경하기 위해 이벤트 발생
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 