import {useEffect, useState} from "react";
import axios from "axios";

import Header from './components/Header';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import MainContent from './components/MainContent';
import {BrowserRouter} from "react-router-dom";

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
              <Banner/>
              <MainContent/>
              백엔드에서 받은 데이터: {hello}
              {error && <p>Error: {error}</p>}
          </div>
      </BrowserRouter>
  );
}

export default App;
