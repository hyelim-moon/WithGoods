import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import memberStyles from "../../assets/styles/admin/MemberManagement.module.css";
import { FiBell, FiRefreshCw, FiGift, FiX } from "react-icons/fi";
import Sidebar from "./Sidebar";
import axios from "../../utils/axios";

// Helper function to check if it's a member's birthday today
const isBirthdayToday = (member) => {
    if (!member.birthDate) return false;
    const today = new Date();
    const birth = new Date(member.birthDate);
    return (
        today.getMonth() === birth.getMonth() &&
        today.getDate() === birth.getDate()
    );
};

// Generic Pagination Controls for Modals
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className={memberStyles.pagination} style={{ marginTop: "20px" }}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={memberStyles.paginationButton}
            >
                이전
            </button>
            {pageNumbers.map((number) => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={`${memberStyles.paginationButton} ${
                        currentPage === number
                            ? memberStyles.activePaginationButton
                            : ""
                    }`}
                >
                    {number}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={memberStyles.paginationButton}
            >
                다음
            </button>
        </div>
    );
};

// WishlistModal Component
const WishlistModal = ({ show, onClose, member, wishlist }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 6; // 2x3 grid

    useEffect(() => {
        if (show) {
            setSearchTerm("");
            setCurrentPage(1);
        }
    }, [show]);

    if (!show) return null;

    const filteredItems = wishlist.filter((item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const currentItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className={memberStyles.modalOverlay}>
            <div className={memberStyles.modalContent}>
                <div className={memberStyles.modalHeader}>
                    <h3>{member?.name}님의 찜한 상품</h3>
                    <button
                        className={memberStyles.modalCloseButton}
                        onClick={onClose}
                    >
                        <FiX />
                    </button>
                </div>
                <div style={{ marginBottom: "15px" }}>
                    <input
                        type="text"
                        placeholder="상품명으로 검색..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    />
                </div>
                <div className={memberStyles.modalBody}>
                    {currentItems.length > 0 ? (
                        <ul className={memberStyles.wishlistGrid}>
                            {currentItems.map((item) => (
                                <li
                                    key={item.productId}
                                    className={memberStyles.wishlistItem}
                                >
                                    <img
                                        src={item.productThumbnail}
                                        alt={item.productName}
                                        className={memberStyles.wishlistImage}
                                    />
                                    <div
                                        className={memberStyles.wishlistDetails}
                                    >
                                        <p
                                            className={
                                                memberStyles.wishlistProductName
                                            }
                                        >
                                            {item.productName}
                                        </p>
                                        <p
                                            className={
                                                memberStyles.wishlistProductPrice
                                            }
                                        >
                                            {item.productPrice.toLocaleString()}
                                            원
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>
                            {searchTerm
                                ? "검색된 상품이 없습니다."
                                : `${member?.name}님이 찜한 상품이 없습니다.`}
                        </p>
                    )}
                </div>
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
                <div className={memberStyles.modalFooter}>
                    <button
                        className={memberStyles.closeButton}
                        onClick={onClose}
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

// CartModal Component
const CartModal = ({ show, onClose, member, cartItems }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 5;

    useEffect(() => {
        if (show) {
            setSearchTerm("");
            setCurrentPage(1);
        }
    }, [show]);

    if (!show) return null;

    const filteredItems = cartItems.filter((item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const currentItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className={memberStyles.modalOverlay}>
            <div className={memberStyles.modalContent}>
                <div className={memberStyles.modalHeader}>
                    <h3>{member?.name}님의 장바구니</h3>
                    <button
                        className={memberStyles.modalCloseButton}
                        onClick={onClose}
                    >
                        <FiX />
                    </button>
                </div>
                <div style={{ marginBottom: "15px" }}>
                    <input
                        type="text"
                        placeholder="상품명으로 검색..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    />
                </div>
                <div className={memberStyles.modalBody}>
                    {currentItems.length > 0 ? (
                        <ul className={memberStyles.cartList}>
                            {currentItems.map((item) => (
                                <li
                                    key={item.cartId}
                                    className={memberStyles.cartItem}
                                >
                                    <div
                                        className={
                                            memberStyles.cartItemContent
                                        }
                                    >
                                        <div
                                            className={
                                                memberStyles.cartItemInfo
                                            }
                                        >
                                            <strong>{item.productName}</strong>
                                            <br />
                                            <small>
                                                상품 ID: {item.productId} |
                                                단가:{" "}
                                                {item.productPrice?.toLocaleString() ||
                                                    "0"}
                                                원 | 수량: {item.quantity}개 |
                                                총액:{" "}
                                                {item.totalPrice?.toLocaleString() ||
                                                    "0"}
                                                원
                                            </small>
                                            <br />
                                            <small
                                                style={{ color: "#666" }}
                                            >
                                                담은 날짜:{" "}
                                                {new Date(
                                                    item.addedAt
                                                ).toLocaleDateString()}
                                            </small>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>
                            {searchTerm
                                ? "검색된 상품이 없습니다."
                                : "장바구니가 비어있습니다."}
                        </p>
                    )}
                </div>
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
                <div className={memberStyles.modalFooter}>
                    <button
                        className={memberStyles.closeButton}
                        onClick={onClose}
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

// OrderHistoryModal Component
const OrderHistoryModal = ({ show, onClose, memberName, orders }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 5;

    useEffect(() => {
        if (show) {
            setSearchTerm("");
            setCurrentPage(1);
        }
    }, [show]);

    if (!show) return null;

    const filteredItems = orders.filter(
        (order) =>
            order.orderId.toString().includes(searchTerm) ||
            order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const currentItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className={memberStyles.modalOverlay}>
            <div className={memberStyles.modalContent}>
                <div className={memberStyles.modalHeader}>
                    <h3>
                        {memberName
                            ? `${memberName}님의 주문 내역`
                            : "주문 내역"}
                    </h3>
                    <button
                        className={memberStyles.modalCloseButton}
                        onClick={onClose}
                    >
                        <FiX />
                    </button>
                </div>
                <div style={{ marginBottom: "15px" }}>
                    <input
                        type="text"
                        placeholder="주문ID 또는 상태로 검색..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    />
                </div>
                <div className={memberStyles.modalBody}>
                    {currentItems.length > 0 ? (
                        <ul className={memberStyles.orderListModal}>
                            {currentItems.map((order) => (
                                <li
                                    key={order.orderId}
                                    className={
                                        memberStyles.orderListItemModal
                                    }
                                >
                                    <div>
                                        <strong>
                                            주문 ID: {order.orderId}
                                        </strong>
                                        <br />
                                        <span>
                                            주문일:{" "}
                                            {new Date(
                                                order.orderDate
                                            ).toLocaleDateString()}
                                        </span>
                                        <br />
                                        <span>
                                            총 금액:{" "}
                                            {order.orderSummary?.finalAmount?.toLocaleString() ||
                                                "0"}
                                            원
                                        </span>
                                        <br />
                                        <span>상태: {order.status}</span>
                                        {order.shippingInfo?.address && (
                                            <>
                                                <br />
                                                <span>
                                                    배송지:{" "}
                                                    {order.shippingInfo.address}
                                                </span>
                                            </>
                                        )}
                                        {order.ordererInfo?.name && (
                                            <>
                                                <br />
                                                <span>
                                                    주문자:{" "}
                                                    {order.ordererInfo.name}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>
                            {searchTerm
                                ? "검색된 주문 내역이 없습니다."
                                : "주문 내역이 없습니다."}
                        </p>
                    )}
                </div>
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
                <div className={memberStyles.modalFooter}>
                    <button
                        className={memberStyles.closeButton}
                        onClick={onClose}
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

// InquiryModal Component
const InquiryModal = ({ show, onClose, memberName, inquiries, navigate }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 5;

    useEffect(() => {
        if (show) {
            setSearchTerm("");
            setCurrentPage(1);
        }
    }, [show]);

    if (!show) return null;

    const filteredItems = inquiries.filter(
        (inquiry) =>
            inquiry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const currentItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className={memberStyles.modalOverlay}>
            <div className={memberStyles.modalContent}>
                <div className={memberStyles.modalHeader}>
                    <h3>
                        {memberName
                            ? `${memberName}님의 문의 내역`
                            : "문의 내역"}
                    </h3>
                    <button
                        className={memberStyles.modalCloseButton}
                        onClick={onClose}
                    >
                        <FiX />
                    </button>
                </div>
                <div style={{ marginBottom: "15px" }}>
                    <input
                        type="text"
                        placeholder="제목 또는 상태로 검색..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    />
                </div>
                <div className={memberStyles.modalBody}>
                    {currentItems.length > 0 ? (
                        <ul className={memberStyles.inquiryListModal}>
                            {currentItems.map((inquiry) => (
                                <li
                                    key={inquiry.id}
                                    className={
                                        memberStyles.inquiryListItemModal
                                    }
                                    onClick={() =>
                                        navigate(`/inquiry/${inquiry.id}`)
                                    }
                                >
                                    <div>
                                        <strong>
                                            문의 ID: {inquiry.id}
                                        </strong>
                                        <br />
                                        <span>제목: {inquiry.title}</span>
                                        <br />
                                        <span>
                                            작성일:{" "}
                                            {new Date(
                                                inquiry.createdAt
                                            ).toLocaleDateString()}
                                        </span>
                                        <br />
                                        <span>상태: {inquiry.status}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>
                            {searchTerm
                                ? "검색된 문의 내역이 없습니다."
                                : "문의 내역이 없습니다."}
                        </p>
                    )}
                </div>
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
                <div className={memberStyles.modalFooter}>
                    <button
                        className={memberStyles.closeButton}
                        onClick={onClose}
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

// ReviewModal Component
const ReviewModal = ({ show, onClose, memberName, reviews }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 4;

    useEffect(() => {
        if (show) {
            setSearchTerm("");
            setCurrentPage(1);
        }
    }, [show]);

    if (!show) return null;

    const filteredItems = reviews.filter(
        (review) =>
            review.productName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            review.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const currentItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className={memberStyles.modalOverlay}>
            <div className={memberStyles.modalContent}>
                <div className={memberStyles.modalHeader}>
                    <h3>
                        {memberName ? `${memberName}님의 리뷰` : "리뷰 내역"}
                    </h3>
                    <button
                        className={memberStyles.modalCloseButton}
                        onClick={onClose}
                    >
                        <FiX />
                    </button>
                </div>
                <div style={{ marginBottom: "15px" }}>
                    <input
                        type="text"
                        placeholder="상품명 또는 내용으로 검색..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    />
                </div>
                <div className={memberStyles.modalBody}>
                    {currentItems.length > 0 ? (
                        <ul className={memberStyles.inquiryListModal}>
                            {currentItems.map((review) => (
                                <li
                                    key={review.reviewId}
                                    className={
                                        memberStyles.inquiryListItemModal
                                    }
                                >
                                    <div>
                                        <strong>
                                            리뷰 ID: {review.reviewId}
                                        </strong>
                                        <br />
                                        <span>
                                            상품명: {review.productName}
                                        </span>
                                        <br />
                                        <span>
                                            평점:{" "}
                                            {"⭐".repeat(review.rating || 0)}
                                        </span>
                                        <br />
                                        <span>내용: {review.content}</span>
                                        <br />
                                        <span>
                                            작성일:{" "}
                                            {new Date(
                                                review.createdAt
                                            ).toLocaleDateString()}
                                        </span>
                                        {review.imageUrl && (
                                            <>
                                                <br />
                                                <img
                                                    src={review.imageUrl}
                                                    alt="리뷰 이미지"
                                                    style={{
                                                        maxWidth: "200px",
                                                        marginTop: "10px",
                                                    }}
                                                />
                                            </>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>
                            {searchTerm
                                ? "검색된 리뷰가 없습니다."
                                : "리뷰 내역이 없습니다."}
                        </p>
                    )}
                </div>
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
                <div className={memberStyles.modalFooter}>
                    <button
                        onClick={onClose}
                        className={memberStyles.closeButton}
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

// EstimateModal Component
const EstimateModal = ({ show, onClose, memberName, estimates }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 4;

    useEffect(() => {
        if (show) {
            setSearchTerm("");
            setCurrentPage(1);
        }
    }, [show]);

    if (!show) return null;

    const filteredItems = estimates.filter(
        (estimate) =>
            estimate.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            estimate.product
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            estimate.customerName
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const currentItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className={memberStyles.modalOverlay}>
            <div className={memberStyles.modalContent}>
                <div className={memberStyles.modalHeader}>
                    <h3>
                        {memberName ? `${memberName}님의 견적` : "견적 내역"}
                    </h3>
                    <button
                        className={memberStyles.modalCloseButton}
                        onClick={onClose}
                    >
                        <FiX />
                    </button>
                </div>
                <div style={{ marginBottom: "15px" }}>
                    <input
                        type="text"
                        placeholder="제목, 고객명, 상품으로 검색..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: '1px solid #ccc',
                            borderRadius: "4px",
                        }}
                    />
                </div>
                <div className={memberStyles.modalBody}>
                    {currentItems.length > 0 ? (
                        <ul className={memberStyles.inquiryListModal}>
                            {currentItems.map((estimate) => (
                                <li
                                    key={estimate.id}
                                    className={
                                        memberStyles.inquiryListItemModal
                                    }
                                >
                                    <div>
                                        <strong>
                                            견적 ID: {estimate.id}
                                        </strong>
                                        <br />
                                        <span>제목: {estimate.title}</span>
                                        <br />
                                        <span>
                                            고객명: {estimate.customerName}
                                        </span>
                                        <br />
                                        <span>
                                            연락처: {estimate.contact}
                                        </span>
                                        <br />
                                        <span>
                                            상품: {estimate.product}
                                        </span>
                                        <br />
                                        <span>
                                            수량: {estimate.quantity}개
                                        </span>
                                        <br />
                                        <span>
                                            요청사항: {estimate.message}
                                        </span>
                                        <br />
                                        <span>
                                            작성일:{" "}
                                            {new Date(
                                                estimate.createdAt
                                            ).toLocaleDateString()}
                                        </span>
                                        {estimate.answer && (
                                            <>
                                                <br />
                                                <span
                                                    style={{
                                                        color: "#4CAF50",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    답변: {estimate.answer}
                                                </span>
                                            </>
                                        )}
                                        {estimate.designFileUrl && (
                                            <>
                                                <br />
                                                <a
                                                    href={`http://localhost:8080${estimate.designFileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    설계파일 다운로드
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>
                            {searchTerm
                                ? "검색된 견적이 없습니다."
                                : "견적 내역이 없습니다."}
                        </p>
                    )}
                </div>
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
                <div className={memberStyles.modalFooter}>
                    <button
                        onClick={onClose}
                        className={memberStyles.closeButton}
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

// MemoModal Component
const MemoModal = ({
                       show,
                       onClose,
                       member,
                       memos,
                       newMemoContent,
                       isAddingMemo,
                       setIsAddingMemo,
                       setNewMemoContent,
                       handleAddMemo,
                       handleDeleteMemo,
                   }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 3;

    useEffect(() => {
        if (show) {
            setSearchTerm("");
            setCurrentPage(1);
        }
    }, [show]);

    if (!show) return null;

    const filteredMemos = memos.filter(
        (memo) =>
            memo.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            memo.adminName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredMemos.length / itemsPerPage);
    const currentItems = filteredMemos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className={memberStyles.modalOverlay}>
            <div
                className={memberStyles.modalContent}
                style={{ maxWidth: "800px", width: "90%" }}
            >
                <div className={memberStyles.modalHeader}>
                    <h3>
                        {member
                            ? `${member.name}님의 관리자 메모`
                            : "관리자 메모"}
                    </h3>
                    <button
                        onClick={onClose}
                        className={memberStyles.modalCloseButton}
                    >
                        <FiX />
                    </button>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                        gap: "10px",
                    }}
                >
                    <div style={{ flexGrow: 1 }}>
                        <input
                            type="text"
                            placeholder="내용 또는 작성자로 검색..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                            }}
                        />
                    </div>
                    {!isAddingMemo && (
                        <button
                            onClick={() => setIsAddingMemo(true)}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                flexShrink: 0,
                            }}
                        >
                            + 메모 작성
                        </button>
                    )}
                </div>

                {isAddingMemo && (
                    <div
                        style={{
                            width: "100%",
                            marginBottom: "20px",
                            padding: "15px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            backgroundColor: "#f9f9f9",
                        }}
                    >
                        <textarea
                            value={newMemoContent}
                            onChange={(e) =>
                                setNewMemoContent(e.target.value)
                            }
                            style={{
                                width: "100%",
                                minHeight: "120px",
                                padding: "10px",
                                border: '1px solid #ccc',
                                borderRadius: "4px",
                                resize: "vertical",
                                fontSize: "0.95em",
                            }}
                            placeholder="메모 내용을 입력하세요"
                        />
                        <div
                            style={{
                                marginTop: "10px",
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "8px",
                            }}
                        >
                            <button
                                onClick={handleAddMemo}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                작성
                            </button>
                            <button
                                onClick={() => {
                                    setIsAddingMemo(false);
                                    setNewMemoContent("");
                                }}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                )}

                <div
                    style={{
                        maxHeight: "500px",
                        overflowY: "auto",
                        border: "1px solid #e0e0e0",
                        borderRadius: "4px",
                        padding: "10px",
                    }}
                >
                    {currentItems.length > 0 ? (
                        currentItems.map((memo) => (
                            <div
                                key={memo.memoId}
                                style={{
                                    marginBottom: "15px",
                                    padding: "15px",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "6px",
                                    backgroundColor: "#fff",
                                    boxShadow:
                                        "0 1px 3px rgba(0,0,0,0.1)",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        marginBottom: "10px",
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                fontWeight: "600",
                                                color: "#333",
                                                marginBottom: "4px",
                                                fontSize: "1em",
                                            }}
                                        >
                                            {memo.adminName}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.85em",
                                                color: "#666",
                                            }}
                                        >
                                            {new Date(
                                                memo.createdAt
                                            ).toLocaleString("ko-KR")}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleDeleteMemo(memo.memoId)
                                        }
                                        style={{
                                            padding: "6px 12px",
                                            backgroundColor: "#dc3545",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "0.85em",
                                        }}
                                    >
                                        삭제
                                    </button>
                                </div>
                                <div
                                    style={{
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                        color: "#444",
                                        lineHeight: "1.6",
                                        paddingTop: "10px",
                                        borderTop: "1px solid #f0f0f0",
                                        fontSize: "0.95em",
                                    }}
                                >
                                    {memo.content}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div
                            style={{
                                padding: "40px",
                                textAlign: "center",
                                color: "#999",
                            }}
                        >
                            {searchTerm
                                ? "검색된 메모가 없습니다."
                                : "작성된 메모가 없습니다."}
                        </div>
                    )}
                </div>
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

// AddEditMemberModal Component
const AddEditMemberModal = ({
                                show,
                                onClose,
                                isEditing,
                                newMemberData,
                                handleNewMemberDataChange,
                                handleSaveMember,
                            }) => {
    if (!show) return null;
    return (
        <div className={memberStyles.modalOverlay}>
            <div className={memberStyles.modalContent}>
                <h3>{isEditing ? "회원 정보 수정" : "새 회원 추가"}</h3>

                {!isEditing && (
                    <div className={memberStyles.formGroup}>
                        <label htmlFor="username">아이디:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={newMemberData.username}
                            onChange={handleNewMemberDataChange}
                            required
                            placeholder="로그인에 사용할 아이디"
                        />
                    </div>
                )}

                {!isEditing && (
                    <div className={memberStyles.formGroup}>
                        <label htmlFor="password">비밀번호:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={newMemberData.password}
                            onChange={handleNewMemberDataChange}
                            required
                            placeholder="비밀번호를 입력하세요"
                        />
                    </div>
                )}

                <div className={memberStyles.formGroup}>
                    <label htmlFor="name">이름:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={newMemberData.name}
                        onChange={handleNewMemberDataChange}
                        required
                    />
                </div>

                <div className={memberStyles.formGroup}>
                    <label htmlFor="nickname">닉네임:</label>
                    <input
                        type="text"
                        id="nickname"
                        name="nickname"
                        value={newMemberData.nickname}
                        onChange={handleNewMemberDataChange}
                    />
                </div>

                <div className={memberStyles.formGroup}>
                    <label htmlFor="email">이메일:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={newMemberData.email}
                        onChange={handleNewMemberDataChange}
                        required
                    />
                </div>

                <div className={memberStyles.formGroup}>
                    <label htmlFor="phoneNumber">전화번호:</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={newMemberData.phoneNumber}
                        onChange={handleNewMemberDataChange}
                        required
                    />
                </div>

                <div className={memberStyles.formGroup}>
                    <label htmlFor="gender">성별:</label>
                    <select
                        id="gender"
                        name="gender"
                        value={newMemberData.gender}
                        onChange={handleNewMemberDataChange}
                    >
                        <option value="">선택하세요</option>
                        <option value="M">남성</option>
                        <option value="F">여성</option>
                    </select>
                </div>

                <div className={memberStyles.formGroup}>
                    <label htmlFor="birthDate">생년월일:</label>
                    <input
                        type="date"
                        id="birthDate"
                        name="birthDate"
                        value={newMemberData.birthDate}
                        onChange={handleNewMemberDataChange}
                    />
                </div>

                <div className={memberStyles.formGroup}>
                    <label htmlFor="address">주소:</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={newMemberData.address}
                        onChange={handleNewMemberDataChange}
                    />
                </div>

                <div className={memberStyles.modalActions}>
                    <button
                        onClick={handleSaveMember}
                        className={memberStyles.modalPrimaryBtn}
                    >
                        {isEditing ? "수정" : "추가"}
                    </button>
                    <button
                        onClick={onClose}
                        className={memberStyles.modalSecondaryBtn}
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

// IndividualCouponModal Component
const IndividualCouponModal = ({
                                   show,
                                   onClose,
                                   member,
                                   availableCoupons,
                                   selectedCouponForIndividual,
                                   setSelectedCouponForIndividual,
                                   handleDistributeCouponToIndividual,
                               }) => {
    if (!show) return null;
    return (
        <div className={memberStyles.modalOverlay}>
            <div className={memberStyles.modalContent}>
                <h3>
                    {member ? `${member.name}님에게 쿠폰 지급` : "쿠폰 지급"}
                </h3>
                <select
                    value={selectedCouponForIndividual}
                    onChange={(e) =>
                        setSelectedCouponForIndividual(e.target.value)
                    }
                    className={memberStyles.couponSelect}
                >
                    {availableCoupons.map((coupon) => (
                        <option key={coupon.id} value={coupon.id}>
                            {coupon.name}
                        </option>
                    ))}
                </select>
                <div className={memberStyles.modalActions}>
                    <button
                        onClick={handleDistributeCouponToIndividual}
                        className={memberStyles.modalPrimaryBtn}
                    >
                        지급
                    </button>
                    <button
                        onClick={onClose}
                        className={memberStyles.modalSecondaryBtn}
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

// CouponDistributionModal Component (for multiple members)
const CouponDistributionModal = ({
                                     show,
                                     onClose,
                                     selectedMembersCount,
                                     availableCoupons,
                                     selectedCouponToDistribute,
                                     setSelectedCouponToDistribute,
                                     handleDistributeCoupon,
                                 }) => {
    if (!show) return null;
    return (
        <div className={memberStyles.modalOverlay}>
            <div className={memberStyles.modalContent}>
                <h3>선택된 회원에게 쿠폰 지급</h3>
                <p>선택된 회원: {selectedMembersCount}명</p>
                <select
                    value={selectedCouponToDistribute}
                    onChange={(e) =>
                        setSelectedCouponToDistribute(e.target.value)
                    }
                    className={memberStyles.couponSelect}
                >
                    {availableCoupons.map((coupon) => (
                        <option key={coupon.id} value={coupon.id}>
                            {coupon.name}
                        </option>
                    ))}
                </select>
                <div className={memberStyles.modalActions}>
                    <button
                        onClick={handleDistributeCoupon}
                        className={memberStyles.modalPrimaryBtn}
                    >
                        지급
                    </button>
                    <button
                        onClick={onClose}
                        className={memberStyles.modalSecondaryBtn}
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

function MemberManagement() {
    const navigate = useNavigate();
    const location = useLocation();

    // 회원 관리 상태
    const [allMembers, setAllMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchCondition, setSearchCondition] = useState("name");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentFilter, setCurrentFilter] = useState("all"); // 'all', 'new', 'birthday'
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        birthday: 0, // 생일인 회원 통계
    });
    const [currentPage, setCurrentPage] = useState(1); // 페이지네이션: 현재 페이지
    const [itemsPerPage] = useState(10); // 페이지네이션: 페이지당 항목 수

    // AdminDashboard에서 포커스 회원을 넘겨줬는지 한 번만 처리하기 위한 플래그
    const [focusHandled, setFocusHandled] = useState(false);

    // 쿠폰 지급 관련 상태
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [selectedCouponToDistribute, setSelectedCouponToDistribute] = useState('');

    // 개별 회원 쿠폰 지급 관련 상태 (사이드바용)
    const [showIndividualCouponModal, setShowIndividualCouponModal] =
        useState(false);
    const [selectedCouponForIndividual, setSelectedCouponForIndividual] =
        useState("");

    // 회원 상세 정보 사이드 패널 관련 상태
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [sidePanelMember, setSidePanelMember] = useState(null);
    const [showWishlistModal, setShowWishlistModal] = useState(false);
    const [memberWishlist, setMemberWishlist] = useState([]);
    const [selectedMemberForWishlist, setSelectedMemberForWishlist] =
        useState(null);
    const [showCartModal, setShowCartModal] = useState(false);
    const [memberCart, setMemberCart] = useState([]);
    const [selectedMemberForCart, setSelectedMemberForCart] = useState(null);

    // 주문 내역 모달 관련 상태
    const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
    const [selectedMemberOrders, setSelectedMemberOrders] = useState([]);
    const [selectedMemberNameForOrders, setSelectedMemberNameForOrders] =
        useState("");

    // 문의 내역 모달 관련 상태
    const [showInquiryModal, setShowInquiryModal] = useState(false);
    const [selectedMemberInquiries, setSelectedMemberInquiries] = useState([]);
    const [selectedMemberNameForInquiries, setSelectedMemberNameForInquiries] =
        useState("");

    // 리뷰 내역 모달 관련 상태
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedMemberReviews, setSelectedMemberReviews] = useState([]);
    const [selectedMemberNameForReviews, setSelectedMemberNameForReviews] =
        useState("");

    // 견적 내역 모달 관련 상태
    const [showEstimateModal, setShowEstimateModal] = useState(false);
    const [selectedMemberEstimates, setSelectedMemberEstimates] = useState([]);
    const [selectedMemberNameForEstimates, setSelectedMemberNameForEstimates] =
        useState("");

    // 회원 메모 관련 상태
    const [memberMemos, setMemberMemos] = useState([]);
    const [newMemoContent, setNewMemoContent] = useState("");
    const [isAddingMemo, setIsAddingMemo] = useState(false);
    const [showMemoModal, setShowMemoModal] = useState(false);

    // 회원 추가/수정 모달 관련 상태
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState(null);
    const [newMemberData, setNewMemberData] = useState({
        id: "",
        username: "",
        password: "",
        nickname: "",
        name: "",
        email: "",
        phoneNumber: "",
        gender: "",
        birthDate: "",
        address: "",
    });

    useEffect(() => {
        const init = async () => {
            await fetchMembers();
            await fetchAvailableCoupons();
        };
        init();
    }, []);

    useEffect(() => {
        let results = allMembers;

        // Apply stat box filters first
        if (currentFilter === "new") {
            const thirtyDaysAgo = new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000
            );
            results = results.filter(
                (member) => new Date(member.joinDate) > thirtyDaysAgo
            );
        } else if (currentFilter === "birthday") {
            results = results.filter(isBirthdayToday);
        }

        // Then apply search term filtering
        if (searchTerm) {
            results = results.filter((member) => {
                const value = member[searchCondition];
                const term = searchTerm.toLowerCase();

                if (typeof value === "string") {
                    return value.toLowerCase().includes(term);
                }

                if (typeof value === "number") {
                    return value.toString().toLowerCase().includes(term);
                }

                return false;
            });
        }
        setFilteredMembers(results);
        setCurrentPage(1); // 필터 또는 검색어 변경 시 현재 페이지를 1로 초기화
    }, [searchTerm, searchCondition, allMembers, currentFilter]);

    // ✅ AdminDashboard에서 넘어온 focusMemberId / focusMemberName을 이용해서
    //    해당 회원 페이지로 이동 + 사이드패널 자동 열기
    useEffect(() => {
        if (focusHandled) return;
        if (!location.state) return;
        const { focusMemberId, focusMemberName } = location.state;
        if (!focusMemberId && !focusMemberName) return;
        if (!allMembers || allMembers.length === 0) return;

        let targetIndex = -1;

        if (focusMemberId) {
            targetIndex = allMembers.findIndex(
                (m) => m.id === focusMemberId
            );
        }

        if (targetIndex === -1 && focusMemberName) {
            const lowered = String(focusMemberName).toLowerCase();
            targetIndex = allMembers.findIndex((m) => {
                const byName =
                    m.name && m.name.toLowerCase() === lowered;
                const byNickname =
                    m.nickname && m.nickname.toLowerCase() === lowered;
                return byName || byNickname;
            });
        }

        if (targetIndex === -1) {
            // 못 찾으면 한 번만 시도하고 끝
            setFocusHandled(true);
            return;
        }

        const targetMember = allMembers[targetIndex];

        // 목록 필터/검색 초기화해서 전체 목록 기준으로 위치 맞추기
        setCurrentFilter("all");
        setSearchTerm("");
        setSearchCondition("name");

        // 해당 회원이 포함된 페이지로 이동
        const page = Math.floor(targetIndex / itemsPerPage) + 1;
        setCurrentPage(page);

        // 사이드 패널 열기 (쿠폰/통계까지 포함한 상세 조회)
        handleViewDetails(targetMember);

        setFocusHandled(true);
    }, [location.state, allMembers, itemsPerPage, focusHandled]);

    const fetchMembers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get("/api/admin/members");
            const apiMembers = (res.data || []).map((m) => ({
                id: m.memberId,
                nickname: m.nickname,
                name: m.name,
                email: m.email,
                phoneNumber: m.phoneNumber,
                role: m.role || "USER",
                joinDate: m.createdAt || new Date().toISOString(),
                address: m.address,
                birthDate: m.birthDate || null,
                totalOrders: m.totalOrders || 0,
                totalSpent: m.totalSpent || 0,
                coupons: [],
                orders: [],
            }));
            setAllMembers(apiMembers);
            setFilteredMembers(apiMembers);

            setStats({
                total: apiMembers.length,
                new: apiMembers.filter(
                    (m) =>
                        new Date(m.joinDate) >
                        new Date(
                            Date.now() - 30 * 24 * 60 * 60 * 1000
                        )
                ).length,
                birthday: apiMembers.filter(isBirthdayToday).length,
            });
        } catch (e) {
            setError("회원 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableCoupons = async () => {
        try {
            const res = await axios.get("/api/coupons");
            const list = (res.data || []).map((c) => ({
                id: c.couponId,
                name: c.name,
            }));
            setAvailableCoupons(list);
            if (list.length > 0) setSelectedCouponToDistribute(list[0].id);
        } catch (e) {
            setAvailableCoupons([]);
        }
    };

    const handleMemberSelect = (memberId, e) => {
        if (e) {
            e.stopPropagation();
        }

        setSelectedMembers((prev) => {
            if (prev.includes(memberId)) {
                return prev.filter((id) => id !== memberId);
            } else {
                return [...prev, memberId];
            }
        });
    };

    const handleSelectAll = (e, currentItems) => {
        if (e.target.checked) {
            setSelectedMembers(currentItems.map((member) => member.id));
        } else {
            setSelectedMembers([]);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchConditionChange = (e) => {
        setSearchCondition(e.target.value);
        setSearchTerm("");
    };

    const handleStatBoxClick = (filterType) => {
        setCurrentFilter(filterType);
        setSearchTerm("");
        setSearchCondition("name");
        setSelectedMembers([]);
    };

    const handleDistributeCoupon = async () => {
        if (selectedMembers.length === 0) {
            alert("쿠폰을 지급할 회원을 선택해주세요.");
            return;
        }
        if (!selectedCouponToDistribute) {
            alert("지급할 쿠폰을 선택해주세요.");
            return;
        }

        let successCount = 0;
        let failCount = 0;
        const failedMembers = [];

        try {
            for (const memberId of selectedMembers) {
                try {
                    await axios.post(
                        `/api/member-coupons/issue`,
                        null,
                        {
                            params: {
                                memberId,
                                couponId: selectedCouponToDistribute,
                            },
                        }
                    );
                    successCount++;
                } catch (error) {
                    failCount++;
                    const member = allMembers.find(
                        (m) => m.id === memberId
                    );
                    const memberName = member
                        ? member.name
                        : `ID: ${memberId}`;
                    failedMembers.push(
                        `${memberName}: ${
                            error.response?.data ||
                            error.message ||
                            "알 수 없는 오류"
                        }`
                    );
                }
            }

            let message = `쿠폰 지급 완료: ${successCount}명 성공`;
            if (failCount > 0) {
                message += `, ${failCount}명 실패\n\n실패한 회원:\n${failedMembers.join(
                    "\n"
                )}`;
            }
            alert(message);

            if (showSidePanel && sidePanelMember) {
                try {
                    const couponRes = await axios.get(
                        `/api/member-coupons/all?memberId=${sidePanelMember.id}`
                    );
                    const updatedMember = {
                        ...sidePanelMember,
                        coupons: couponRes.data || [],
                    };
                    setSidePanelMember(updatedMember);
                } catch (e) {
                    // ignore
                }
            }
        } catch (e) {
            alert(
                "쿠폰 지급 중 오류가 발생했습니다: " +
                (e.response?.data || e.message)
            );
        } finally {
            setShowCouponModal(false);
            setSelectedMembers([]);
        }
    };

    // 개별 회원 쿠폰 지급 함수 (사이드바용)
    const handleDistributeCouponToIndividual = async () => {
        if (!sidePanelMember) {
            alert("회원 정보가 없습니다.");
            return;
        }
        if (!selectedCouponForIndividual) {
            alert("지급할 쿠폰을 선택해주세요.");
            return;
        }

        try {
            await axios.post(`/api/member-coupons/issue`, null, {
                params: {
                    memberId: sidePanelMember.id,
                    couponId: selectedCouponForIndividual,
                },
            });
            alert(`${sidePanelMember.name}님에게 쿠폰이 지급되었습니다.`);

            try {
                const couponRes = await axios.get(
                    `/api/member-coupons/all?memberId=${sidePanelMember.id}`
                );
                const updatedMember = {
                    ...sidePanelMember,
                    coupons: couponRes.data || [],
                };
                setSidePanelMember(updatedMember);
            } catch (e) {
                // ignore
            }
        } catch (e) {
            alert(
                "쿠폰 지급 중 오류가 발생했습니다: " +
                (e.response?.data || e.message)
            );
        } finally {
            setShowIndividualCouponModal(false);
        }
    };

    const handleViewDetails = async (member) => {
        if (showSidePanel && sidePanelMember && sidePanelMember.id === member.id) {
            setShowSidePanel(false);
            setSidePanelMember(null);
        } else {
            try {
                const [couponRes, statsRes] = await Promise.all([
                    axios.get(
                        `/api/member-coupons/all?memberId=${member.id}`
                    ),
                    axios.get(
                        `/api/admin/members/${member.id}/stats`
                    ),
                ]);

                const memberWithDetails = {
                    ...member,
                    coupons: couponRes.data || [],
                    totalOrders: statsRes.data.totalOrders || 0,
                    totalSpent: statsRes.data.totalSpent || 0,
                };
                setSidePanelMember(memberWithDetails);
                setShowSidePanel(true);
            } catch (e) {
                const memberWithDefaults = {
                    ...member,
                    coupons: [],
                    totalOrders: 0,
                    totalSpent: 0,
                };
                setSidePanelMember(memberWithDefaults);
                setShowSidePanel(true);
            }
        }
    };

    const handleViewOrderHistory = async (member) => {
        try {
            const res = await axios.get(
                `/api/admin/orders/member/${member.id}`
            );
            setSelectedMemberOrders(res.data.content || []);
            setSelectedMemberNameForOrders(member.name);
            setShowOrderHistoryModal(true);
        } catch (e) {
            console.error("주문 내역 조회 실패:", e);
            alert("주문 내역을 불러오는데 실패했습니다.");
        }
    };

    const handleViewInquiries = async (member) => {
        try {
            const res = await axios.get(
                `/api/admin/members/${member.id}/inquiries`
            );
            setSelectedMemberInquiries(res.data || []);
            setSelectedMemberNameForInquiries(member.name);
            setShowInquiryModal(true);
        } catch (e) {
            console.error("문의 내역 조회 실패:", e);
            alert("문의 내역을 불러오는데 실패했습니다.");
        }
    };

    const handleViewWishlist = async (member) => {
        try {
            const res = await axios.get(
                `/api/admin/members/${member.id}/wishlist`
            );
            setMemberWishlist(res.data || []);
            setSelectedMemberForWishlist(member);
            setShowWishlistModal(true);
        } catch (e) {
            console.error("찜한 상품 조회 실패:", e);
            alert("찜한 상품을 불러오는데 실패했습니다.");
        }
    };

    const handleViewCart = async (member) => {
        try {
            const res = await axios.get(
                `/api/admin/members/${member.id}/cart`
            );
            setMemberCart(res.data || []);
            setSelectedMemberForCart(member);
            setShowCartModal(true);
        } catch (e) {
            console.error("장바구니 조회 실패:", e);
            alert("장바구니를 불러오는데 실패했습니다.");
        }
    };

    const handleViewReviews = async (member) => {
        try {
            const res = await axios.get(
                `/api/admin/members/${member.id}/reviews`
            );
            setSelectedMemberReviews(res.data || []);
            setSelectedMemberNameForReviews(member.name);
            setShowReviewModal(true);
        } catch (e) {
            console.error("리뷰 내역 조회 실패:", e);
            alert("리뷰 내역을 불러오는데 실패했습니다.");
        }
    };

    const handleViewEstimates = async (member) => {
        try {
            const res = await axios.get(
                `/api/admin/members/${member.id}/estimates`
            );
            setSelectedMemberEstimates(res.data || []);
            setSelectedMemberNameForEstimates(member.name);
            setShowEstimateModal(true);
        } catch (e) {
            console.error("견적 내역 조회 실패:", e);
            alert("견적 내역을 불러오는데 실패했습니다.");
        }
    };

    const fetchMemberMemos = async (memberId) => {
        try {
            const res = await axios.get(
                `/api/admin/members/${memberId}/memos`
            );
            setMemberMemos(res.data || []);
        } catch (e) {
            console.error("메모 목록 조회 실패:", e);
            setMemberMemos([]);
        }
    };

    // 메모 모달 열기
    const handleOpenMemoModal = async (member) => {
        if (member) {
            setSidePanelMember(member);
            await fetchMemberMemos(member.id);
        }
        setShowMemoModal(true);
    };

    const handleAddMemo = async () => {
        if (!sidePanelMember || !newMemoContent.trim()) {
            alert("메모 내용을 입력해주세요.");
            return;
        }
        try {
            const res = await axios.post(
                `/api/admin/members/${sidePanelMember.id}/memos`,
                {
                    content: newMemoContent,
                }
            );
            setMemberMemos([res.data, ...memberMemos]);
            setNewMemoContent("");
            setIsAddingMemo(false);
            alert("메모가 추가되었습니다.");
        } catch (e) {
            console.error("메모 추가 실패:", e);
            alert("메모 추가에 실패했습니다.");
        }
    };

    const handleDeleteMemo = async (memoId) => {
        if (!window.confirm("정말로 이 메모를 삭제하시겠습니까?")) return;
        if (!sidePanelMember) return;
        try {
            await axios.delete(
                `/api/admin/members/${sidePanelMember.id}/memos/${memoId}`
            );
            setMemberMemos(
                memberMemos.filter((memo) => memo.memoId !== memoId)
            );
            alert("메모가 삭제되었습니다.");
        } catch (e) {
            console.error("메모 삭제 실패:", e);
            alert("메모 삭제에 실패했습니다.");
        }
    };

    const handleAddMemberClick = () => {
        setIsEditing(false);
        setMemberToEdit(null);
        setNewMemberData({
            id: "",
            username: "",
            password: "",
            nickname: "",
            name: "",
            email: "",
            phoneNumber: "",
            gender: "",
            birthDate: "",
            address: "",
        });
        setShowAddEditModal(true);
    };

    const handleEditMemberClick = (member) => {
        setIsEditing(true);
        setMemberToEdit(member);
        setNewMemberData({ ...member });
        setShowAddEditModal(true);
        setShowSidePanel(false);
    };

    const handleNewMemberDataChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewMemberData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSaveMember = async () => {
        if (isEditing) {
            if (
                !newMemberData.name ||
                !newMemberData.email ||
                !newMemberData.phoneNumber
            ) {
                alert("이름, 이메일, 전화번호는 필수 입력 항목입니다.");
                return;
            }
        } else {
            if (
                !newMemberData.username ||
                !newMemberData.password ||
                !newMemberData.name ||
                !newMemberData.email ||
                !newMemberData.phoneNumber
            ) {
                alert(
                    "아이디, 비밀번호, 이름, 이메일, 전화번호는 필수 입력 항목입니다."
                );
                return;
            }
        }

        try {
            if (isEditing) {
                const payload = {
                    nickname: newMemberData.nickname,
                    name: newMemberData.name,
                    email: newMemberData.email,
                    phoneNumber: newMemberData.phoneNumber,
                    address: newMemberData.address,
                    role:
                        memberToEdit && memberToEdit.role
                            ? memberToEdit.role
                            : "USER",
                    birthDate: newMemberData.birthDate,
                };
                await axios.put(
                    `/api/admin/members/${newMemberData.id}`,
                    payload
                );
                alert(`${newMemberData.name} 회원 정보가 수정되었습니다.`);
            } else {
                const payload = {
                    username: newMemberData.username,
                    password: newMemberData.password,
                    nickname: newMemberData.nickname,
                    name: newMemberData.name,
                    email: newMemberData.email,
                    phoneNumber: newMemberData.phoneNumber,
                    gender: newMemberData.gender,
                    birthDate: newMemberData.birthDate,
                    address: newMemberData.address,
                };
                await axios.post("/signup", payload);
                alert(`${newMemberData.name} 회원이 추가되었습니다.`);
            }
        } catch (e) {
            const errorMessage =
                e.response?.data?.message || "회원 저장에 실패했습니다.";
            alert(errorMessage);
        } finally {
            setShowAddEditModal(false);
            setMemberToEdit(null);
            setNewMemberData({
                id: "",
                username: "",
                password: "",
                nickname: "",
                name: "",
                email: "",
                phoneNumber: "",
                gender: "",
                birthDate: "",
                address: "",
            });
            await fetchMembers();
        }
    };

    const closeAddEditModal = () => {
        setShowAddEditModal(false);
        setMemberToEdit(null);
        setNewMemberData({
            id: "",
            username: "",
            password: "",
            nickname: "",
            name: "",
            email: "",
            phoneNumber: "",
            gender: "",
            birthDate: "",
            address: "",
        });
    };

    const handleDeleteMember = async () => {
        if (!sidePanelMember) return;
        if (
            !window.confirm(
                `${sidePanelMember.name} 회원을 정말로 탈퇴시키겠습니까?`
            )
        )
            return;
        try {
            await axios.delete(
                `/api/admin/members/${sidePanelMember.id}`
            );
            alert(`${sidePanelMember.name} 회원이 탈퇴 처리되었습니다.`);
        } catch (e) {
            alert("회원 탈퇴에 실패했습니다.");
        } finally {
            setShowSidePanel(false);
            setSidePanelMember(null);
            await fetchMembers();
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className={memberStyles.loading}>
                    회원 정보를 불러오는 중...
                </div>
            );
        }

        if (error) {
            return <div className={memberStyles.error}>{error}</div>;
        }

        const totalPages = Math.ceil(
            filteredMembers.length / itemsPerPage
        );
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filteredMembers.slice(
            indexOfFirstItem,
            indexOfLastItem
        );

        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        return (
            <>
                {/* 통계 박스 */}
                <div className={memberStyles.statsContainer}>
                    <div
                        className={`${memberStyles.statBox} ${
                            currentFilter === "all"
                                ? memberStyles.activeStatBox
                                : ""
                        }`}
                        onClick={() => handleStatBoxClick("all")}
                    >
                        <h2>총 회원수</h2>
                        <p>{stats.total}명</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${
                            currentFilter === "new"
                                ? memberStyles.activeStatBox
                                : ""
                        }`}
                        onClick={() => handleStatBoxClick("new")}
                    >
                        <h2>신규 회원</h2>
                        <p>{stats.new}명</p>
                    </div>
                    <div
                        className={`${memberStyles.statBox} ${
                            currentFilter === "birthday"
                                ? memberStyles.activeStatBox
                                : ""
                        }`}
                        onClick={() => handleStatBoxClick("birthday")}
                    >
                        <h2>생일 회원</h2>
                        <p>{stats.birthday}명</p>
                    </div>
                </div>

                {/* 본문 */}
                <div className={memberStyles.container}>
                    <h3>회원 목록</h3>
                    <div className={memberStyles.toolbar}>
                        <div className={memberStyles.searchBar}>
                            <select
                                value={searchCondition}
                                onChange={handleSearchConditionChange}
                                className={memberStyles.searchCondition}
                            >
                                <option value="name">이름</option>
                                <option value="email">이메일</option>
                                <option value="phoneNumber">
                                    전화번호
                                </option>
                                <option value="nickname">닉네임</option>
                            </select>
                            <input
                                type="text"
                                placeholder="검색어를 입력하세요"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setCurrentPage(1);
                                }}
                                className={memberStyles.iconBtn}
                                aria-label="초기화"
                                title="초기화"
                            >
                                <FiRefreshCw />
                            </button>
                        </div>
                        <div className={memberStyles.actionButtons}>
                            <button
                                className={memberStyles.distributeCouponBtn}
                                onClick={() => setShowCouponModal(true)}
                                disabled={
                                    selectedMembers.length === 0
                                }
                            >
                                <FiGift /> 쿠폰 지급
                            </button>
                            <button
                                className={memberStyles.addMemberBtn}
                                onClick={handleAddMemberClick}
                            >
                                회원 추가
                            </button>
                        </div>
                    </div>

                    <table className={memberStyles.memberTable}>
                        <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    onChange={(e) =>
                                        handleSelectAll(
                                            e,
                                            currentItems
                                        )
                                    }
                                    checked={
                                        currentItems.length > 0 &&
                                        currentItems.every(
                                            (member) =>
                                                selectedMembers.includes(
                                                    member.id
                                                )
                                        )
                                    }
                                />
                            </th>
                            <th>회원ID</th>
                            <th>닉네임</th>
                            <th>이름</th>
                            <th>이메일</th>
                            <th>전화번호</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((member) => (
                                <tr
                                    key={member.id}
                                    onClick={() =>
                                        handleViewDetails(member)
                                    }
                                    className={
                                        memberStyles.memberRow
                                    }
                                >
                                    <td
                                        onClick={(e) =>
                                            e.stopPropagation()
                                        }
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(
                                                member.id
                                            )}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleMemberSelect(
                                                    member.id,
                                                    e
                                                );
                                            }}
                                            onClick={(e) =>
                                                e.stopPropagation()
                                            }
                                        />
                                    </td>
                                    <td
                                        className={
                                            memberStyles.memberIdCell
                                        }
                                    >
                                        {member.id}
                                    </td>
                                    <td>{member.nickname}</td>
                                    <td>{member.name}</td>
                                    <td>{member.email}</td>
                                    <td>{member.phoneNumber}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">
                                    회원 내역이 없습니다.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>

                    <div className={memberStyles.pagination}>
                        <button
                            onClick={() =>
                                handlePageChange(currentPage - 1)
                            }
                            disabled={currentPage === 1}
                            className={memberStyles.paginationButton}
                        >
                            이전
                        </button>
                        {pageNumbers.map((number) => (
                            <button
                                key={number}
                                onClick={() =>
                                    handlePageChange(number)
                                }
                                className={`${memberStyles.paginationButton} ${
                                    currentPage === number
                                        ? memberStyles.activePaginationButton
                                        : ""
                                }`}
                            >
                                {number}
                            </button>
                        ))}
                        <button
                            onClick={() =>
                                handlePageChange(currentPage + 1)
                            }
                            disabled={currentPage === totalPages}
                            className={memberStyles.paginationButton}
                        >
                            다음
                        </button>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className={styles.app}>
            <Sidebar activeLabel="회원관리" />

            {/* Main Content */}
            <main
                className={`${styles.main} ${
                    showSidePanel ? memberStyles.mainWithPanel : ""
                }`}
            >
                <header className={styles.header}>
                    <div className={styles.headerTitle}>회원관리</div>
                    <div className={styles.headerActions}>
                        <button
                            className={styles.iconBtn}
                            aria-label="알림"
                        >
                            <FiBell />
                        </button>
                    </div>
                </header>

                {renderContent()}
            </main>

            {/* 회원 상세 정보 사이드 패널 */}
            <div
                className={`${memberStyles.sidePanelContainer} ${
                    showSidePanel ? memberStyles.sidePanelOpen : ""
                }`}
            >
                <div className={memberStyles.sidePanelHeader}>
                    <h3>회원 상세 정보</h3>
                    <button
                        className={memberStyles.sidePanelCloseBtn}
                        onClick={() => setShowSidePanel(false)}
                    >
                        <FiX />
                    </button>
                </div>
                <div className={memberStyles.sidePanelBody}>
                    {sidePanelMember ? (
                        <>
                            <div className={memberStyles.sidePanelRowGroup}>
                                <div className={memberStyles.sidePanelItem}>
                                    <strong>회원ID:</strong>{" "}
                                    <span>{sidePanelMember.id}</span>
                                </div>
                                <div className={memberStyles.sidePanelItem}>
                                    <strong>닉네임:</strong>{" "}
                                    <span>
                                        {sidePanelMember.nickname}
                                    </span>
                                </div>
                                <div className={memberStyles.sidePanelItem}>
                                    <strong>이름:</strong>{" "}
                                    <span>{sidePanelMember.name}</span>
                                </div>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>이메일:</strong>{" "}
                                <span>{sidePanelMember.email}</span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>전화번호:</strong>{" "}
                                <span>
                                    {sidePanelMember.phoneNumber}
                                </span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>가입일:</strong>{" "}
                                <span>
                                    {sidePanelMember.joinDate
                                        ? new Date(
                                            sidePanelMember.joinDate
                                        ).toLocaleDateString()
                                        : "-"}
                                </span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>생년월일:</strong>{" "}
                                <span>
                                    {sidePanelMember.birthDate
                                        ? new Date(
                                            sidePanelMember.birthDate
                                        ).toLocaleDateString()
                                        : "-"}
                                </span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>주소:</strong>{" "}
                                <span>{sidePanelMember.address}</span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>총 주문 횟수:</strong>{" "}
                                <span>
                                    {sidePanelMember.totalOrders}회
                                </span>
                            </div>
                            <div className={memberStyles.sidePanelItem}>
                                <strong>총 결제 금액:</strong>{" "}
                                <span>
                                    {sidePanelMember.totalSpent.toLocaleString()}
                                    원
                                </span>
                            </div>
                            <div
                                className={`${memberStyles.sidePanelItem} ${memberStyles.couponItem}`}
                            >
                                <strong>보유 쿠폰:</strong>
                                {sidePanelMember.coupons &&
                                sidePanelMember.coupons.length > 0 ? (
                                    <ul
                                        className={
                                            memberStyles.couponList
                                        }
                                    >
                                        {sidePanelMember.coupons.map(
                                            (coupon) => (
                                                <li
                                                    key={
                                                        coupon.memberCouponId
                                                    }
                                                >
                                                    <div>
                                                        <strong>
                                                            {
                                                                coupon.couponName
                                                            }
                                                        </strong>
                                                        <br />
                                                        <small>
                                                            발급일:{" "}
                                                            {new Date(
                                                                coupon.issuedAt
                                                            ).toLocaleDateString()}{" "}
                                                            | 만료일:{" "}
                                                            {new Date(
                                                                coupon.expiresAt
                                                            ).toLocaleDateString()}{" "}
                                                            | 상태:{" "}
                                                            {coupon.isUsed
                                                                ? "사용됨"
                                                                : "사용가능"}
                                                        </small>
                                                    </div>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <span>
                                        보유한 쿠폰이 없습니다.
                                    </span>
                                )}
                            </div>
                            <div className={memberStyles.sidePanelActions}>
                                <button
                                    className={
                                        memberStyles.editMemberBtn
                                    }
                                    onClick={() =>
                                        handleEditMemberClick(
                                            sidePanelMember
                                        )
                                    }
                                >
                                    회원 수정
                                </button>
                                <button
                                    className={
                                        memberStyles.deleteMemberBtn
                                    }
                                    onClick={handleDeleteMember}
                                >
                                    회원 탈퇴
                                </button>
                                <button
                                    className={
                                        memberStyles.viewCartBtn
                                    }
                                    onClick={() =>
                                        handleOpenMemoModal(
                                            sidePanelMember
                                        )
                                    }
                                    style={{
                                        backgroundColor: "#6f42c1",
                                        color: "white",
                                    }}
                                    onMouseOver={(e) =>
                                        (e.target.style.backgroundColor =
                                            "#5a32a3")
                                    }
                                    onMouseOut={(e) =>
                                        (e.target.style.backgroundColor =
                                            "#6f42c1")
                                    }
                                >
                                    메모
                                </button>
                                <button
                                    className={
                                        memberStyles.viewCartBtn
                                    }
                                    onClick={() =>
                                        handleViewWishlist(
                                            sidePanelMember
                                        )
                                    }
                                >
                                    찜한 상품
                                </button>
                                <button
                                    className={
                                        memberStyles.viewCartBtn
                                    }
                                    onClick={() =>
                                        handleViewCart(sidePanelMember)
                                    }
                                >
                                    장바구니
                                </button>
                                <button
                                    className={
                                        memberStyles.viewCartBtn
                                    }
                                    onClick={() =>
                                        handleViewReviews(
                                            sidePanelMember
                                        )
                                    }
                                >
                                    작성한 리뷰
                                </button>
                                <button
                                    className={
                                        memberStyles.viewCartBtn
                                    }
                                    onClick={() =>
                                        handleViewEstimates(
                                            sidePanelMember
                                        )
                                    }
                                >
                                    작성한 견적
                                </button>
                                <button
                                    className={
                                        memberStyles.viewCartBtn
                                    }
                                    onClick={() =>
                                        handleViewOrderHistory(
                                            sidePanelMember
                                        )
                                    }
                                >
                                    주문 내역 보기
                                </button>
                                <button
                                    className={
                                        memberStyles.viewCartBtn
                                    }
                                    onClick={() =>
                                        handleViewInquiries(
                                            sidePanelMember
                                        )
                                    }
                                >
                                    문의 내역 보기
                                </button>
                                <button
                                    className={
                                        memberStyles.distributeCouponBtn
                                    }
                                    onClick={() => {
                                        if (
                                            availableCoupons.length > 0
                                        ) {
                                            setSelectedCouponForIndividual(
                                                availableCoupons[0].id
                                            );
                                        }
                                        setShowIndividualCouponModal(
                                            true
                                        );
                                    }}
                                >
                                    <FiGift /> 쿠폰 지급
                                </button>
                            </div>
                        </>
                    ) : (
                        <p>선택된 회원 정보가 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 모달들 */}
            <CouponDistributionModal
                show={showCouponModal}
                onClose={() => setShowCouponModal(false)}
                selectedMembersCount={selectedMembers.length}
                availableCoupons={availableCoupons}
                selectedCouponToDistribute={
                    selectedCouponToDistribute
                }
                setSelectedCouponToDistribute={
                    setSelectedCouponToDistribute
                }
                handleDistributeCoupon={handleDistributeCoupon}
            />

            <IndividualCouponModal
                show={showIndividualCouponModal}
                onClose={() => setShowIndividualCouponModal(false)}
                member={sidePanelMember}
                availableCoupons={availableCoupons}
                selectedCouponForIndividual={
                    selectedCouponForIndividual
                }
                setSelectedCouponForIndividual={
                    setSelectedCouponForIndividual
                }
                handleDistributeCouponToIndividual={
                    handleDistributeCouponToIndividual
                }
            />

            <WishlistModal
                show={showWishlistModal}
                onClose={() => setShowWishlistModal(false)}
                member={selectedMemberForWishlist}
                wishlist={memberWishlist}
            />

            <CartModal
                show={showCartModal}
                onClose={() => setShowCartModal(false)}
                member={selectedMemberForCart}
                cartItems={memberCart}
            />

            <OrderHistoryModal
                show={showOrderHistoryModal}
                onClose={() => setShowOrderHistoryModal(false)}
                memberName={selectedMemberNameForOrders}
                orders={selectedMemberOrders}
            />

            <InquiryModal
                show={showInquiryModal}
                onClose={() => setShowInquiryModal(false)}
                memberName={selectedMemberNameForInquiries}
                inquiries={selectedMemberInquiries}
                navigate={navigate}
            />

            <ReviewModal
                show={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                memberName={selectedMemberNameForReviews}
                reviews={selectedMemberReviews}
            />

            <EstimateModal
                show={showEstimateModal}
                onClose={() => setShowEstimateModal(false)}
                memberName={selectedMemberNameForEstimates}
                estimates={selectedMemberEstimates}
            />

            <MemoModal
                show={showMemoModal}
                onClose={() => {
                    setShowMemoModal(false);
                    setIsAddingMemo(false);
                    setNewMemoContent("");
                }}
                member={sidePanelMember}
                memos={memberMemos}
                newMemoContent={newMemoContent}
                isAddingMemo={isAddingMemo}
                setIsAddingMemo={setIsAddingMemo}
                setNewMemoContent={setNewMemoContent}
                handleAddMemo={handleAddMemo}
                handleDeleteMemo={handleDeleteMemo}
            />

            <AddEditMemberModal
                show={showAddEditModal}
                onClose={closeAddEditModal}
                isEditing={isEditing}
                newMemberData={newMemberData}
                handleNewMemberDataChange={handleNewMemberDataChange}
                handleSaveMember={handleSaveMember}
            />
        </div>
    );
}

export default MemberManagement;
