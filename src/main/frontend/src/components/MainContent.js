import { bestGoods } from '../components/Best';
import styles from '../assets/styles/MainContent.module.css';
import TopGoodsSection from './TopGoodsSection';

function MainContent() {
    const top5 = [...bestGoods].filter(item => item.rating >= 4).sort((a, b) => b.rating - a.rating).slice(0, 5);

    const sections = [
        { title: 'BEST', icon: '⭐', route: '/best', emoji: '🧸' },
        { title: '기념일', icon: '🎉', route: '/anniversary', emoji: '🎈' },
        { title: '커스텀', icon: '🎨', route: '/customization', emoji: '🧩' },
        { title: '한정판', icon: '✨', route: '/limited_edition', emoji: '🖌️' }
    ];

    return (
        <div className={styles.mainContent}>
            <h2 className={styles.mainTitle}>🏆 BEST GOODS 🏆</h2>

            {sections.map((s) => (
                <TopGoodsSection
                    key={s.route}
                    titleIcon={s.icon}
                    title={s.title}
                    route={s.route}
                    goods={top5}
                    emoji={s.emoji}
                />
            ))}
        </div>
    );
}

export default MainContent;
