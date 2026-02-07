import React from 'react';
import { useData } from '../store/DataContext';
import {
    Users,
    Calendar,
    Trophy,
    TrendingUp,
    ChevronRight,
    ShieldAlert,
    MinusCircle,
    XCircle
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { players, matches } = useData();

    const playedMatches = matches.filter(m => m.ourScore !== undefined || m.opponentScore !== undefined);
    const totalGoals = players.reduce((sum, p) => sum + (p.goals || 0), 0);
    const totalConceded = playedMatches.reduce((sum, m) => sum + (m.opponentScore || 0), 0);
    const wins = playedMatches.filter(m => m.ourScore > m.opponentScore).length;
    const draws = playedMatches.filter(m => m.ourScore === m.opponentScore).length;
    const losses = playedMatches.filter(m => m.ourScore < m.opponentScore).length;

    const generalStats = [
        { label: 'Joueurs', value: players.length.toString(), icon: Users, color: '#3b82f6' },
        { label: 'Matchs Joués', value: playedMatches.length.toString(), icon: Calendar, color: '#10b981' },
    ];

    const scoringStats = [
        { label: 'Buts Inscrits', value: totalGoals.toString(), icon: Trophy, color: '#f59e0b' },
        { label: 'Buts Encaissés', value: totalConceded.toString(), icon: ShieldAlert, color: '#ef4444' },
    ];

    const resultStats = [
        { label: 'Victoires', value: wins.toString(), icon: TrendingUp, color: '#8b5cf6' },
        { label: 'Matchs Nuls', value: draws.toString(), icon: MinusCircle, color: '#94a3b8' },
        { label: 'Défaites', value: losses.toString(), icon: XCircle, color: '#64748b' },
    ];

    const renderStatCard = (stat, index) => (
        <div key={index} className="stat-card glass">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={24} />
            </div>
            <div className="stat-content">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
            </div>
        </div>
    );

    const recentMatches = [...matches]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    const topScorers = [...players]
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 3);

    return (
        <div className="dashboard animate-fade-in">
            <div className="stats-container">
                <div className="stats-row two-cols">
                    {generalStats.map(renderStatCard)}
                </div>
                <div className="stats-row two-cols">
                    {scoringStats.map(renderStatCard)}
                </div>
                <div className="stats-row three-cols">
                    {resultStats.map(renderStatCard)}
                </div>
            </div>

            <div className="dashboard-content">
                <div className="recent-matches glass">
                    <div className="section-header">
                        <h3>Matchs Récents</h3>
                        <button className="text-btn">Voir tout <ChevronRight size={16} /></button>
                    </div>
                    <div className="match-list">
                        {recentMatches.length > 0 ? recentMatches.map(match => (
                            <div key={match.id} className="match-item">
                                <div className="match-info">
                                    <span className="match-date">{new Date(match.date).toLocaleDateString('fr-FR')}</span>
                                    <span className="match-teams">CASE2 vs {match.opponent}</span>
                                </div>
                                <div className={`match-score ${match.ourScore > match.opponentScore ? 'win' : match.ourScore < match.opponentScore ? 'loss' : 'draw'}`}>
                                    {match.ourScore} - {match.opponentScore}
                                </div>
                            </div>
                        )) : <p className="empty-txt">Aucun match enregistré</p>}
                    </div>
                </div>

                <div className="top-performers glass">
                    <div className="section-header">
                        <h3>Meilleurs Buteurs</h3>
                    </div>
                    <div className="performer-list">
                        {topScorers.length > 0 && topScorers[0].goals > 0 ? topScorers.map((p, i) => (
                            <div key={p.id} className="performer-item">
                                <div className="rank">{i + 1}</div>
                                <div className="performer-name">{p.name}</div>
                                <div className="performer-stat">{p.goals} Buts</div>
                            </div>
                        )) : <p className="empty-txt">Pas encore de buteurs</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
