import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function Record() {
    return null;
}

function App() {
    const [hello, setHello] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8080/api/test')
            .then((res) => {
                setHello(res.data);
            })
            .catch((err) => {
                setError(err.message);
            });
    }, []);

    return (
        <BrowserRouter>
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
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/recent" element={<Recent />} />
                    <Route path="/estimatelist" element={<EstimateList />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/product/:id/stats" element={<ProductStats />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route path="/registration" element={<Registration />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-complete" element={<OrderComplete />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
