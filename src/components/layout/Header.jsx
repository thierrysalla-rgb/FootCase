import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import './Header.css';

const Header = ({ activeView }) => {
    const getTitle = () => {
        switch (activeView) {
            case 'dashboard': return 'Tableau de bord';
            case 'matches': return 'Matchs & Compositions';
            case 'players': return 'Effectif';
            case 'standings': return 'Classement Championnat';
            case 'stats': return 'Statistiques Individuelles';
            default: return 'Gestion Football';
        }
    };

    return (
        <header className="header glass-header">
            <div className="header-left">
                <h2>{getTitle()}</h2>
            </div>

            <div className="header-right">
                <div className="search-bar glass">
                    <Search size={18} />
                    <input type="text" placeholder="Rechercher..." />
                </div>

                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="dot"></span>
                </button>

                <div className="user-profile">
                    <div className="avatar">TH</div>
                    <div className="user-info">
                        <span className="user-name">Thierry</span>
                        <span className="user-role">Community Manager</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
