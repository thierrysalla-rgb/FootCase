import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import {
    Plus,
    Calendar,
    Users,
    Trophy,
    Trash2,
    ChevronRight,
    UserCheck,
    Award,
    ArrowLeft,
    Check
} from 'lucide-react';
import './Matches.css';

const Matches = () => {
    const { players, matches, addMatch, updateMatch, deleteMatch, addMatchEvent, deleteMatchEvent, teams, addTeam, isAdmin } = useData();

    const [showForm, setShowForm] = useState(false);
    const [selectedMatchId, setSelectedMatchId] = useState(null);

    const [newMatch, setNewMatch] = useState({
        opponent: '',
        date: '',
        type: 'Championnat',
        location: '',
        phase: ''
    });

    const selectedMatch = matches.find(m => m.id === selectedMatchId);

    const phases = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'];

    const handleAddMatch = (e) => {
        e.preventDefault();
        if (!newMatch.opponent || !newMatch.date) return;
        addMatch({ ...newMatch, phase: newMatch.type === 'Championnat' ? (newMatch.phase || phases[0]) : '' });
        addTeam(newMatch.opponent);
        setNewMatch({ opponent: '', date: '', type: 'Championnat', location: '', phase: '' });
        setShowForm(false);
    };

    const handleTogglePlayer = (matchId, playerId, type) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;

        let { lineup, bench } = match;

        if (type === 'lineup') {
            if (lineup.includes(playerId)) {
                lineup = lineup.filter(id => id !== playerId);
            } else {
                if (lineup.length >= 8) return; // U11 limit
                lineup = [...lineup, playerId];
                bench = bench.filter(id => id !== playerId);
            }
        } else {
            if (bench.includes(playerId)) {
                bench = bench.filter(id => id !== playerId);
            } else {
                bench = [...bench, playerId];
                lineup = lineup.filter(id => id !== playerId);
            }
        }

        updateMatch(matchId, { lineup, bench });
    };

    const [eventForm, setEventForm] = useState({ scorerId: '', assistId: '' });

    const handleAddGoal = (e) => {
        e.preventDefault();
        if (!eventForm.scorerId) return;
        addMatchEvent(selectedMatchId, {
            type: 'goal',
            playerId: parseInt(eventForm.scorerId),
            assistId: eventForm.assistId ? parseInt(eventForm.assistId) : null
        });
        updateMatch(selectedMatchId, { ourScore: (selectedMatch.ourScore || 0) + 1 });
        setEventForm({ scorerId: '', assistId: '' });
    };

    if (selectedMatch) {
        return (
            <div className="match-detail animate-fade-in">
                <button className="back-btn" onClick={() => setSelectedMatchId(null)}>
                    <ArrowLeft size={20} /> Retour aux matchs
                </button>

                <div className="match-setup-grid">
                    <div className="setup-section glass">
                        <h3>Format de Match (8 vs 8)</h3>
                        <div className="lineup-builder">
                            <div className="pitch glass">
                                <div className="pitch-center"></div>
                                <div className="pitch-lineup">
                                    {selectedMatch.lineup.map(pid => {
                                        const p = players.find(player => player.id === pid);
                                        return (
                                            <div key={pid} className="player-on-pitch">
                                                <div className="player-circle selected">{p?.name.charAt(0)}</div>
                                                <span>{p?.name.split(' ')[0]}</span>
                                            </div>
                                        );
                                    })}
                                    {[...Array(Math.max(0, 8 - selectedMatch.lineup.length))].map((_, i) => (
                                        <div key={i} className="player-on-pitch empty">
                                            <div className="player-circle">?</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="player-selector">
                                <h4>Effectif disponible</h4>
                                <div className="selector-list">
                                    {players.map(p => {
                                        const isSelected = selectedMatch.lineup.includes(p.id);
                                        const isBench = selectedMatch.bench.includes(p.id);
                                        return (
                                            <div key={p.id} className="selector-item">
                                                <span>{p.name}</span>
                                                {isAdmin && (
                                                    <div className="selector-btns">
                                                        <button
                                                            className={`mini-btn ${isSelected ? 'active' : ''}`}
                                                            onClick={() => handleTogglePlayer(selectedMatch.id, p.id, 'lineup')}
                                                        >
                                                            Titu
                                                        </button>
                                                        <button
                                                            className={`mini-btn ${isBench ? 'active' : ''}`}
                                                            onClick={() => handleTogglePlayer(selectedMatch.id, p.id, 'bench')}
                                                        >
                                                            Remp
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="setup-section glass">
                        <div className="match-scoreboard-horizontal">
                            <div className="sb-team our-sb">
                                <span className="team-name">CASE2</span>
                                <input
                                    type="number"
                                    readOnly={!isAdmin}
                                    value={selectedMatch.ourScore}
                                    onChange={e => {
                                        if (!isAdmin) return;
                                        const newVal = parseInt(e.target.value) || 0;
                                        // Auto-sync events: if new score is lower than event count, truncate
                                        if (newVal < selectedMatch.events.length) {
                                            updateMatch(selectedMatch.id, {
                                                ourScore: newVal,
                                                events: selectedMatch.events.slice(0, newVal)
                                            });
                                        } else {
                                            updateMatch(selectedMatch.id, { ourScore: newVal });
                                        }
                                    }}
                                />

                            </div>
                            <div className="sb-divider">-</div>
                            <div className="sb-team opp-sb">
                                <input
                                    type="number"
                                    readOnly={!isAdmin}
                                    value={selectedMatch.opponentScore}
                                    onChange={e => {
                                        if (!isAdmin) return;
                                        updateMatch(selectedMatch.id, { opponentScore: parseInt(e.target.value) || 0 })
                                    }}
                                />

                                <span className="team-name">{selectedMatch.opponent}</span>
                            </div>
                        </div>

                        {(selectedMatch.ourScore > 0 || selectedMatch.events.length > 0) && (
                            <div className="events-section animate-fade-in">
                                <h4>Enregistrer un but ({selectedMatch.ourScore} attendus)</h4>
                                {isAdmin && (
                                    <div className="quick-goal-entry">
                                        <div className="entry-step">
                                            <span className="step-label">1. Qui a marqué ?</span>
                                            <div className="player-grid-mini">
                                                {players.filter(p => selectedMatch.lineup.includes(p.id) || selectedMatch.bench.includes(p.id)).map(p => (
                                                    <button
                                                        key={p.id}
                                                        className={`mini-player-btn ${eventForm.scorerId == p.id ? 'selected' : ''}`}
                                                        onClick={() => setEventForm({ ...eventForm, scorerId: p.id })}
                                                    >
                                                        {p.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {eventForm.scorerId && (
                                            <div className="entry-step animate-fade-in">
                                                <span className="step-label">2. Qui a fait la passe ? (Optionnel)</span>
                                                <div className="player-grid-mini">
                                                    <button
                                                        className={`mini-player-btn ${!eventForm.assistId ? 'selected' : ''}`}
                                                        onClick={() => setEventForm({ ...eventForm, assistId: '' })}
                                                    >
                                                        Sans passe
                                                    </button>
                                                    {players.filter(p => (selectedMatch.lineup.includes(p.id) || selectedMatch.bench.includes(p.id)) && p.id != eventForm.scorerId).map(p => (
                                                        <button
                                                            key={p.id}
                                                            className={`mini-player-btn ${eventForm.assistId == p.id ? 'selected' : ''}`}
                                                            onClick={() => setEventForm({ ...eventForm, assistId: p.id })}
                                                        >
                                                            {p.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {eventForm.scorerId && (
                                            <button
                                                className="btn-primary full-width animate-fade-in"
                                                onClick={() => {
                                                    addMatchEvent(selectedMatch.id, {
                                                        type: 'goal',
                                                        playerId: parseInt(eventForm.scorerId),
                                                        assistId: eventForm.assistId ? parseInt(eventForm.assistId) : null
                                                    });
                                                    setEventForm({ scorerId: '', assistId: '' });
                                                }}
                                            >
                                                VALIDER LE BUT
                                            </button>
                                        )}
                                    </div>
                                )}


                                <div className="events-log">
                                    {selectedMatch.events.map(event => {
                                        const scorer = players.find(p => p.id === event.playerId);
                                        const assist = players.find(p => p.id === event.assistId);
                                        return (
                                            <div key={event.id} className="event-item">
                                                <div className="event-content">
                                                    <Award size={16} color="var(--primary)" />
                                                    <span><strong>{scorer?.name}</strong> {assist ? `(Passe de ${assist.name})` : ''}</span>
                                                </div>
                                                {isAdmin && (
                                                    <button
                                                        className="delete-event-btn"
                                                        onClick={() => deleteMatchEvent(selectedMatch.id, event.id)}
                                                        title="Supprimer ce but"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}

                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {isAdmin && (
                            <div className="match-footer-actions">
                                <button
                                    className="btn-primary full-width finish-btn"
                                    onClick={() => {
                                        updateMatch(selectedMatch.id, { status: 'completed' });
                                        setSelectedMatchId(null);
                                    }}
                                >
                                    <Check size={20} />
                                    VALIDER LE RÉSULTAT ET TERMINER
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="matches-view">
            <div className="view-actions">
                <h3>Matchs de la saison</h3>
                {isAdmin && (
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        <Plus size={20} />
                        <span>Nouveau Match</span>
                    </button>
                )}
            </div>


            {showForm && (
                <div className="modal-overlay">
                    <div className="modal glass border-animate">
                        <h3>Programmer un Match</h3>
                        <form onSubmit={handleAddMatch}>
                            <div className="form-group">
                                <label>Type de Match</label>
                                <select
                                    value={newMatch.type}
                                    onChange={e => setNewMatch({ ...newMatch, type: e.target.value })}
                                >
                                    <option value="Championnat">Championnat</option>
                                    <option value="Amical">Amical</option>
                                    <option value="Tournoi">Tournoi</option>
                                </select>
                            </div>

                            {newMatch.type === 'Championnat' && (
                                <div className="form-group">
                                    <label>Phase de Championnat</label>
                                    <select
                                        value={newMatch.phase || phases[0]}
                                        onChange={e => setNewMatch({ ...newMatch, phase: e.target.value })}
                                    >
                                        {phases.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            )}

                            {newMatch.type === 'Tournoi' && (
                                <div className="form-group">
                                    <label>Lieu du Tournoi</label>
                                    <input
                                        type="text"
                                        value={newMatch.location}
                                        onChange={e => setNewMatch({ ...newMatch, location: e.target.value })}
                                        placeholder="Ville / Stade"
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Adversaire</label>
                                <input
                                    type="text"
                                    required
                                    list="opponents-list"
                                    value={newMatch.opponent}
                                    onChange={e => setNewMatch({ ...newMatch, opponent: e.target.value })}
                                    placeholder="Ex: AS Marcy, OGC Nice..."
                                />
                                <datalist id="opponents-list">
                                    {teams.filter(t => t !== 'CASE2').sort().map(t => <option key={t} value={t} />)}
                                </datalist>
                            </div>
                            <div className="form-group">
                                <label>Date du match</label>
                                <input
                                    type="date"
                                    required
                                    value={newMatch.date}
                                    onChange={e => setNewMatch({ ...newMatch, date: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
                                <button type="submit" className="btn-primary">Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="matches-list">
                {matches.length > 0 ? (
                    [...matches]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map(match => (
                            <div key={match.id} className="match-card glass" onClick={() => setSelectedMatchId(match.id)}>
                                {isAdmin && (
                                    <button
                                        className="delete-match-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm(`Supprimer le match contre ${match.opponent} ?`)) {
                                                deleteMatch(match.id);
                                            }
                                        }}
                                        title="Supprimer le match"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}

                                <div className="match-date-badge">
                                    <Calendar size={14} />
                                    {new Date(match.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                </div>
                                <div className="match-main">
                                    <div className="team our-team">CASE2</div>
                                    <div className="score">
                                        {match.ourScore} - {match.opponentScore}
                                    </div>
                                    <div className="team opp-team">{match.opponent}</div>
                                </div>
                                <div className="match-footer">
                                    <div className="match-tags" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span className="tag" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>{match.type}</span>
                                        {match.phase && <span className="tag-phase" style={{ background: 'rgba(0,230,118,0.1)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>{match.phase}</span>}
                                        {match.location && <span className="tag-location" style={{ background: 'rgba(255,193,7,0.1)', color: '#ffc107', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>{match.location}</span>}
                                    </div>
                                    <span>{match.lineup.length} Joueurs</span>
                                </div>
                            </div>
                        ))
                ) : (
                    <div className="empty-state glass">
                        <Calendar size={48} />
                        <p>Aucun match programmé.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Matches;
