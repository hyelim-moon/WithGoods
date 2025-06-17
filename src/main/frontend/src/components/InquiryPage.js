// src/components/InquiryPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from '../assets/styles/InquiryPage.module.css';

// 날짜 포맷 헬퍼
const formatDate = isoString => {
    const d = new Date(isoString);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const InquiryPage = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const [generalList, setGeneralList] = useState([]);
    const [estimateList, setEstimateList] = useState([]);
    const [selectedTab, setSelectedTab] = useState('기타');

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const pageGroupSize = 5;

    // 탭 바뀌면 1페이지로
    useEffect(() => { setCurrentPage(1); }, [selectedTab]);

    // 데이터 fetch & 내림차순 정렬
    useEffect(() => {
        const category = selectedTab === '견적' ? 'estimate' : 'general';
        axios.get(`http://localhost:8080/inquiries?category=${category}`, {
            withCredentials: true
        })
            .then(res => {
                const sorted = res.data.slice().sort((a, b) => b.id - a.id);
                if (category === 'estimate') {
                    setEstimateList(sorted);
                } else {
                    setGeneralList(sorted);
                }
            })
            .catch(console.error);
    }, [selectedTab]);

    const list = selectedTab === '기타' ? generalList : estimateList;
    const totalItems = list.length;
    const totalPages = Math.ceil((totalItems - (totalItems % itemsPerPage || itemsPerPage)) / itemsPerPage)
        + (totalItems % itemsPerPage ? 1 : 0);

    // 첫 페이지에 보여줄 개수
    const rem = totalItems % itemsPerPage || itemsPerPage;

    // 현재 페이지에 보여줄 slice 구하기
    let currentItems;
    if (currentPage === 1) {
        currentItems = list.slice(0, rem);
    } else {
        const start = rem + (currentPage-2)*itemsPerPage;
        currentItems = list.slice(start, start + itemsPerPage);
    }

    // 페이지 그룹
    const groupIndex = Math.floor((currentPage-1)/pageGroupSize);
    const groupStart = groupIndex*pageGroupSize + 1;
    const groupEnd = Math.min(groupStart + pageGroupSize - 1, totalPages);

    return (
        <div className={styles.container}>
            {/* 탭 */}
            <div className={styles.header}>
                <h2 className={styles.title}>문의</h2>
                <div className={styles.tabContainer}>
                    <button
                        className={`${styles.tab} ${selectedTab==='기타'?styles.active:''}`}
                        onClick={()=>setSelectedTab('기타')}
                    >기타</button>
                    <button
                        className={`${styles.tab} ${selectedTab==='견적'?styles.active:''}`}
                        onClick={()=>setSelectedTab('견적')}
                    >견적</button>
                </div>
            </div>
            <hr className={styles.line}/>

            {/* 테이블 */}
            <div className={styles.content}>
                {currentItems.length===0
                    ? <p className={styles.noInquiry}>
                        {selectedTab==='기타'?'기타 문의가 없습니다.':'견적 문의가 없습니다.'}
                    </p>
                    : <table className={styles.inquiryTable}>
                        <thead>
                        <tr>
                            <th>번호</th><th>상품정보</th><th>제목</th>
                            <th>작성자</th><th>작성일</th><th>조회</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentItems.map((item, idx) => {
                            // 연속 번호 계산: 전체개수에서 (이 페이지 앞에 이미 보여준 개수 + idx)만큼 뺌
                            const offset = (currentPage===1 ? 0 : rem + (currentPage-2)*itemsPerPage);
                            const displayNo = totalItems - (offset + idx);
                            return (
                                <tr key={item.id} onClick={()=>navigate(`/inquiry/${item.id}`)}>
                                    <td>{displayNo}</td>
                                    <td>[{item.type||'기타'}]</td>
                                    <td>
                                        {item.secret && '🔒︎ '}
                                        {item.title}
                                        {Date.now()-new Date(item.createdAt)<1000*60*60*24 && (
                                            <span className={styles.badgeNew}>NEW</span>
                                        )}
                                    </td>
                                    <td>{item.writer||'익명'}</td>
                                    <td>{formatDate(item.createdAt)}</td>
                                    <td>{item.views||0}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                }
            </div>

            {/* 페이지네이션 */}
            {totalPages>1 && (
                <div className={styles.pagination}>
                    {groupStart>1 && (
                        <button onClick={()=>setCurrentPage(groupStart-1)}>‹</button>
                    )}
                    {Array.from({length: groupEnd-groupStart+1}, (_,i)=>groupStart+i)
                        .map(p=>(
                            <button
                                key={p}
                                className={p===currentPage?styles.activePage:''}
                                onClick={()=>setCurrentPage(p)}
                            >{p}</button>
                        ))
                    }
                    {groupEnd<totalPages && (
                        <button onClick={()=>setCurrentPage(groupEnd+1)}>›</button>
                    )}
                </div>
            )}

            <hr className={styles.line}/>
            {!loading && user && (
                <div className={styles.footerButtonWrapper}>
                    <button
                        className={styles.inquiryButton}
                        onClick={()=>navigate(selectedTab==='기타'?'/inquiry/write':'/inquiry/estimate')}
                    >
                        문의하기
                    </button>
                </div>
            )}
        </div>
    );
};

export default InquiryPage;
