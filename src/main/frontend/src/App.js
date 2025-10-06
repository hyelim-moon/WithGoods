import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import axios from "axios";

import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import Banner from './components/layout/Banner';
import MainContent from './components/layout/MainContent';
import Best from './components/pages/Best';
import Login from './components/auth/Login';
import AdminDashboard from "./components/admin/AdminDashboard";
import SignUp from './components/auth/SignUp';
import Forgot from './components/auth/Forgot';
// import All from './components/pages/All'; // 파일이 존재하지 않으므로 주석 처리
import Anniversary from './components/pages/Anniversary';
import Customization from './components/pages/Customization';
import Limited_Edition from './components/pages/Limited_Edition';
import Search from './components/pages/Search';
import InquiryPage from "./components/inquiry/InquiryPage";
import InquiryForm from "./components/inquiry/InquiryForm";
import InquiryDetail from "./components/inquiry/InquiryDetail";
import EstimateInquiryForm from './components/inquiry/EstimateInquiryForm';
import Cart from './components/order/Cart';
import ProductDetail from './components/product/ProductDetail';
import MyPage from './components/my-page/MyPage';
import EditProfile from "./components/my-page/EditProfile";
import MyProductList from "./components/product/ProductList";
import WishList from "./components/my-page/WishList";
import Recent from "./components/pages/Recent";
import EstimateList from "./components/inquiry/EstimateList";
import ProductStats from "./components/admin/ProductStats";
import Checkout from "./components/order/Checkout";
import OrderComplete from "./components/order/OrderComplete";
import OrderHistory from './components/order/OrderHistory';
import ReviewWrite from './components/product/ReviewWrite';
import ProductRegisterMain from './components/product/ProductRegisterMain';
import GeneralProductForm from './components/ProductRegister/GeneralProductForm';
import CustomProductForm from './components/ProductRegister/CustomProductForm';
import LimitedProductForm from './components/ProductRegister/LimitedProductForm';
import AnniversaryProductForm from './components/ProductRegister/AnniversaryProductForm';
import MyReviews from './components/my-page/MyReviews';
import ReviewEdit from './components/my-page/ReviewEdit';
import AdminOrderManagement from './components/admin/AdminOrderManagement';
import MemberManagement from './components/admin/MemberManagement';
import CouponManagement from './components/admin/CouponManagement'; // CouponManagement import
import Coupons from './components/my-page/Coupons';

// 로그인 필요 보호 라우트
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

// 관리자 전용 보호 라우트
const ProtectedAdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/" />;
    if (user.role !== 'ADMIN') return <Navigate to="/" />;
    return children;
};

function AppContent() {
    const location = useLocation();
    // 관리자 대시보드에서도 헤더/네비 숨김
    const hideLayout = ['/login', '/signup', '/Forgot', '/admin/dashboard', '/admin/members', '/admin/coupons'].includes(location.pathname); // /admin/coupons 추가

    const [hello, setHello] = React.useState('');
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        axios.get('http://localhost:8080/api/test')
            .then((res) => setHello(res.data))
            .catch((err) => setError(err.message));
    }, []);

    return (
        <div className="App">
            {!hideLayout && <Header />}
            {!hideLayout && <Navbar />}

            <Routes>
                <Route
                    path="/"
                    element={
                        <>
                            <Banner />
                            <MainContent />
                        </>
                    }
                />
                <Route path="/best" element={<Best />} />
                <Route path="/login" element={<Login />} />

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedAdminRoute>
                            <AdminDashboard />
                        </ProtectedAdminRoute>
                    }
                />

                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot" element={<Forgot />} />
                {/* <Route path="/all" element={<All />} /> */}{/* 파일이 존재하지 않으므로 주석 처리 */}
                <Route path="/anniversary" element={<Anniversary />} />
                <Route path="/customization" element={<Customization />} />
                <Route path="/limited_edition" element={<Limited_Edition />} />

                <Route path="/inquiry" element={<InquiryPage />} />
                <Route path="/inquiry/:id" element={<InquiryDetail />} />
                <Route path="/inquiry/write" element={<InquiryForm />} />
                <Route path="/inquiry/write/:productId" element={<InquiryForm />} />
                <Route path="/inquiry/estimate" element={<EstimateInquiryForm />} />

                <Route path="/mypage" element={<MyPage />} />
                <Route path="/productlist" element={<MyProductList />} />
                <Route path="/wishlist" element={<WishList />} />

                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute>
                            <Cart />
                        </ProtectedRoute>
                    }
                />

                <Route path="/recent" element={<Recent />} />
                <Route path="/estimatelist" element={<EstimateList />} />

                <Route path="/search" element={<Search />} />
                <Route path="/search/:category" element={<Search />} />

                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/product/edit/:id" element={<GeneralProductForm />} />
                <Route path="/product/:id/stats" element={<ProductStats />} />

                <Route path="/edit-profile" element={<EditProfile />} />

                <Route path="/product-register" element={<ProductRegisterMain />}>
                    <Route index element={<GeneralProductForm />} />
                    <Route path="general" element={<GeneralProductForm />} />
                    <Route path="custom" element={<CustomProductForm />} />
                    <Route path="limited" element={<LimitedProductForm />} />
                    <Route path="anniversary" element={<AnniversaryProductForm />} />
                </Route>

                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute>
                            <Checkout />
                        </ProtectedRoute>
                    }
                />
                <Route path="/ordercomplete" element={<OrderComplete />} />
                <Route path="/orders" element={<OrderHistory />} />

                <Route path="/review/write" element={<ReviewWrite />} />
                <Route path="/review-write/:orderDetailId" element={<ReviewWrite />} />
                <Route path="/review-edit/:reviewId" element={<ReviewEdit />} />
                <Route path="/my-reviews" element={<MyReviews />} />

                <Route
                    path="/admin/orders"
                    element={
                        <ProtectedAdminRoute>
                            <AdminOrderManagement />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/members"
                    element={
                        <ProtectedAdminRoute>
                            <MemberManagement />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/coupons"
                    element={
                        <ProtectedAdminRoute>
                            <CouponManagement />
                        </ProtectedAdminRoute>
                    }
                />

                <Route path="/coupons" element={<Coupons />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;
