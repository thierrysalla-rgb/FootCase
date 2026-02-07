import React, { useMemo } from 'react';
import { useData } from '../store/DataContext';
import { Award, Star, Zap, Trophy, TrendingUp } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import './Stats.css';

const Stats = () => {
    const { players, matches } = useData();

    const topScorers = useMemo(() =>
        [...players].sort((a, b) => b.goals - a.goals || b.assists - a.assists).slice(0, 10),
        [players]
    );

    const topPassers = useMemo(() =>
        [...players].sort((a, b) => b.assists - a.assists || b.goals - a.goals).slice(0, 10),
        [players]
    );

    // Calculate Ranking Evolution
    const { goalsChartData, assistsChartData, playersInTopGoals, playersInTopAssists } = useMemo(() => {
        const playedMatches = [...matches]
            .filter(m => m.events && m.events.some(e => e.type === 'goal'))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (playedMatches.length === 0) return { goalsChartData: [], assistsChartData: [], playersInTopGoals: [], playersInTopAssists: [] };

        const goalsHistory = [];
        const assistsHistory = [];
        const playerGoals = {};
        const playerAssists = {};
        const topGoalsSet = new Set();
        const topAssistsSet = new Set();

        players.forEach(p => {
            playerGoals[p.id] = 0;
            playerAssists[p.id] = 0;
        });

        playedMatches.forEach((match, index) => {
            match.events.forEach(event => {
                if (event.type === 'goal') {
                    playerGoals[event.playerId] = (playerGoals[event.playerId] || 0) + 1;
                    if (event.assistId) {
                        playerAssists[event.assistId] = (playerAssists[event.assistId] || 0) + 1;
                    }
                }
            });

            // Goals Evolution Logic
            const sortedByGoals = [...players]
                .map(p => ({ id: p.id, name: p.name, goals: playerGoals[p.id], assists: playerAssists[p.id] }))
                .sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.name.localeCompare(b.name));

            const goalPoint = { name: `M${index + 1}` };
            sortedByGoals.forEach((p, rankIndex) => {
                if (rankIndex < 5) {
                    goalPoint[p.name] = p.goals;
                    topGoalsSet.add(p.name);
                } else if (topGoalsSet.has(p.name)) {
                    goalPoint[p.name] = p.goals;
                }
            });
            goalsHistory.push(goalPoint);

            // Assists Evolution Logic
            const sortedByAssists = [...players]
                .map(p => ({ id: p.id, name: p.name, goals: playerGoals[p.id], assists: playerAssists[p.id] }))
                .sort((a, b) => b.assists - a.assists || b.goals - a.goals || a.name.localeCompare(b.name));

            const assistPoint = { name: `M${index + 1}` };
            sortedByAssists.forEach((p, rankIndex) => {
                if (rankIndex < 5) {
                    assistPoint[p.name] = p.assists;
                    topAssistsSet.add(p.name);
                } else if (topAssistsSet.has(p.name)) {
                    assistPoint[p.name] = p.assists;
                }
            });
            assistsHistory.push(assistPoint);
        });

        return {
            goalsChartData: goalsHistory,
            assistsChartData: assistsHistory,
            playersInTopGoals: Array.from(topGoalsSet),
            playersInTopAssists: Array.from(topAssistsSet)
        };
    }, [matches, players]);

    // Distinct colors for players in chart
    const colors = [
        '#00e676', '#ffc107', '#3b82f6', '#ef4444', '#8b5cf6',
        '#ec4899', '#06b6d4', '#f97316', '#10b981', '#6366f1',
        '#a855f7', '#f43f5e'
    ];

    return (
        <div className="stats-view animate-fade-in">
            <div className="stats-header">
                <Trophy size={32} color="var(--secondary)" />
                <h3>Classements Individuels</h3>
            </div>

            <div className="stats-grid">
                <div className="stats-card glass">
                    <div className="card-title">
                        <Zap size={20} color="#ff9800" />
                        <h4>Meilleurs Buteurs</h4>
                    </div>
                    <div className="stats-list">
                        {topScorers.length > 0 ? topScorers.map((p, i) => (
                            <div key={p.id} className="stats-item">
                                <div className="rank">{i + 1}</div>
                                <div className="name">{p.name}</div>
                                <div className="value">{p.goals} Buts</div>
                            </div>
                        )) : <p className="empty-txt">Aucune donnée</p>}
                    </div>
                </div>

                <div className="stats-card glass">
                    <div className="card-title">
                        <Star size={20} color="#00bcd4" />
                        <h4>Meilleurs Passeurs</h4>
                    </div>
                    <div className="stats-list">
                        {topPassers.length > 0 ? topPassers.map((p, i) => (
                            <div key={p.id} className="stats-item">
                                <div className="rank">{i + 1}</div>
                                <div className="name">{p.name}</div>
                                <div className="value">{p.assists} Passes</div>
                            </div>
                        )) : <p className="empty-txt">Aucune donnée</p>}
                    </div>
                </div>
            </div>

            <div className="evolution-chart-container glass">
                <div className="card-title">
                    <TrendingUp size={20} color="var(--primary)" />
                    <h4>Évolution des Buts (Top 5)</h4>
                </div>
                <div className="chart-wrapper">
                    {goalsChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={goalsChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    stroke="var(--text-dim)"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, 'dataMax + 1']}
                                    stroke="var(--text-dim)"
                                    fontSize={12}
                                    tickLine={false}
                                    label={{ value: 'Buts', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend iconType="circle" />
                                {playersInTopGoals.map((playerName, index) => (
                                    <Line
                                        key={playerName}
                                        type="monotone"
                                        dataKey={playerName}
                                        stroke={colors[index % colors.length]}
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: colors[index % colors.length] }}
                                        activeDot={{ r: 6 }}
                                        connectNulls
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state-chart">
                            <p>Saisissez des résultats de matchs pour voir l'évolution des buts.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="evolution-chart-container glass" style={{ marginTop: '2rem' }}>
                <div className="card-title">
                    <TrendingUp size={20} color="var(--primary)" />
                    <h4>Évolution des Passes (Top 5)</h4>
                </div>
                <div className="chart-wrapper">
                    {assistsChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={assistsChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    stroke="var(--text-dim)"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, 'dataMax + 1']}
                                    stroke="var(--text-dim)"
                                    fontSize={12}
                                    tickLine={false}
                                    label={{ value: 'Passes', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend iconType="circle" />
                                {playersInTopAssists.map((playerName, index) => (
                                    <Line
                                        key={playerName}
                                        type="monotone"
                                        dataKey={playerName}
                                        stroke={colors[index % colors.length]}
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: colors[index % colors.length] }}
                                        activeDot={{ r: 6 }}
                                        connectNulls
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state-chart">
                            <p>Saisissez des résultats de matchs pour voir l'évolution des passes.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Stats;
