import {useEffect, useState} from "react";
import axios from "axios";

import Header from './components/Header';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import MainContent from './components/MainContent';
import Best from './components/Best';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


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
              <Header/>
              <Navbar/>
              <Routes>
                  <Route path="/" element={
                      <>
                          <Banner/>
                          <MainContent/>
                      </>
                  }/>
                  <Route path="/best" element={<Best />} />
              </Routes>
              백엔드에서 받은 데이터: {hello}
              {error && <p>Error: {error}</p>}
          </div>
      </BrowserRouter>
  );
}

export default App;
