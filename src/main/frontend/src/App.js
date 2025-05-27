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
import Cart from './components/Cart';
import ProductDetail from './components/ProductDetail';
import MyPage from './components/MyPage';
import EditProfile from "./components/EditProfile";
import InquiryDetailPage from './components/InquiryDetail';
import InquiryEdit from './components/InquiryEdit';

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
                    <Route path="/inquiry/:id" element={<InquiryDetailPage />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route path="/inquiry/edit/:id" element={<InquiryEdit />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
