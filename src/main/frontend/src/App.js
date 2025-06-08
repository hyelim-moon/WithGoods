import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import axios from "axios";

import Header from './components/Header';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import MainContent from './components/MainContent';
import Best from './components/Best';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Forgot from './components/Forgot';
import All from './components/All';
import Anniversary from './components/Anniversary';
import Customization from './components/Customization';
import Limited_Edition from './components/Limited_Edition';
import InquiryPage from "./components/InquiryPage";
import InquiryForm from "./components/InquiryForm";
import EstimateInquiryForm from './components/EstimateInquiryForm';
import Cart from './components/Cart';
import ProductDetail from './components/ProductDetail';
import MyPage from './components/MyPage';
import EditProfile from "./components/EditProfile";
import Registration from "./components/Registration";
import MyProductList from "./components/MyProductList";
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

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function AppContent() {
  const [hello, setHello] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    axios.get('http://localhost:8080/api/test')
      .then((res) => {
        setHello(res.data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  return (
    <div className="App">
      <Header />
      <Navbar />
      <Routes>
        <Route path="/" element={
          <>
            <Banner />
            <MainContent />
          </>
        } />
        <Route path="/best" element={<Best />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/all" element={<All />} />
        <Route path="/anniversary" element={<Anniversary />} />
        <Route path="/customization" element={<Customization />} />
        <Route path="/limited_edition" element={<Limited_Edition />} />
        <Route path="/inquiry" element={<InquiryPage />} />
        <Route path="/inquiry/write" element={<InquiryForm />} />
        <Route path="/inquiry/estimate" element={<EstimateInquiryForm />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/myproductlist" element={<MyProductList />} />
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
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/product/:id/stats" element={<ProductStats />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/product-register" element={<ProductRegisterMain />}>
          <Route index element={<GeneralProductForm />} />  {/* 인덱스 라우트: 기본 화면 */}
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
