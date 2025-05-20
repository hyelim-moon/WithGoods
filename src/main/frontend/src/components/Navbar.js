import { Link } from 'react-router-dom';
import styles from '../assets/styles/Navbar.module.css';

function Navbar() {
    return (
        <nav className={styles.navbar}>
            <Link to="/best"><button>⭐BEST⭐</button></Link>
            <Link to="/all"><button>전체</button></Link>
            <Link to="/anniversary"><button>기념일</button></Link>
            <Link to="/customization"><button>커스텀</button></Link>
            <Link to="/limited_edition"><button>한정판</button></Link>
            <Link to="/inquiry"><button>문의</button></Link>
            <Link to="/registration"><button>상품등록</button></Link>
        </nav>
    );
}

export default Navbar;