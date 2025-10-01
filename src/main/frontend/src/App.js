import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import axios from "axios";

import Header from './components/Header';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import MainContent from './components/MainContent';
import Best from './components/Best';
import Login from './components/Login';
import AdminDashboard from "./components/AdminDashboard";
import SignUp from './components/SignUp';
import Forgot from './components/Forgot';
import All from './components/All';
import Anniversary from './components/Anniversary';
import Customization from './components/Customization';
import Limited_Edition from './components/Limited_Edition';
import Search from './components/Search';
import InquiryPage from "./components/InquiryPage";
import InquiryForm from "./components/InquiryForm";
import InquiryDetail from "./components/InquiryDetail";
import EstimateInquiryForm from './components/EstimateInquiryForm';
import Cart from './components/Cart';
import ProductDetail from './components/ProductDetail';
import MyPage from './components/MyPage';
import EditProfile from "./components/EditProfile";
import MyProductList from "./components/ProductList";
import WishList from "./components/WishList";
import Recent from "./components/Recent";
import EstimateList from "./components/EstimateList";
import ProductStats from "./components/ProductStats";
import Checkout from "./components/Checkout";
import OrderComplete from "./components/OrderComplete";
import OrderHistory from './components/OrderHistory';
import ReviewWrite from './components/ReviewWrite';
import ProductRegisterMain from './components/ProductRegister/ProductRegisterMain';
import GeneralProductForm from './components/ProductRegister/GeneralProductForm';
import CustomProductForm from './components/ProductRegister/CustomProductForm';
import LimitedProductForm from './components/ProductRegister/LimitedProductForm';
import AnniversaryProductForm from './components/ProductRegister/AnniversaryProductForm';
import MyReviews from './components/MyReviews';
import ReviewEdit from './components/ReviewEdit';
import AdminOrderManagement from './components/AdminOrderManagement';
import AdminMemberManagement from './components/AdminMemberManagement';
import Coupons from './components/Coupons';

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
    const hideLayout = ['/login', '/signup', '/Forgot', '/admin/dashboard'].includes(location.pathname);

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
                <Route path="/all" element={<All />} />
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
                            <AdminMemberManagement />
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
