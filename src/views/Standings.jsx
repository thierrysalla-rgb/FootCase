import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Trophy, Plus, Trash2 } from 'lucide-react';
import { calculateStandings } from '../utils/standingsUtils';
import './Standings.css';

const Standings = () => {
    const { matches, leagueMatches, addLeagueMatch, deleteLeagueMatch, teams, addTeam, deleteTeam, isAdmin } = useData();

    const [showForm, setShowForm] = useState(false);
    const [showTeamForm, setShowTeamForm] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [selectedPhase, setSelectedPhase] = useState('Phase 1');
    const [newResult, setNewResult] = useState({ home: '', away: '', homeScore: 0, awayScore: 0, phase: 'Phase 1' });

    const phases = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'];

    const standings = calculateStandings(matches, leagueMatches, selectedPhase);

    const currentLeagueMatches = leagueMatches.filter(m => m.phase === selectedPhase);

    const handleAddResult = (e) => {
        e.preventDefault();
        if (!newResult.home || !newResult.away) return;
        addLeagueMatch(newResult);
        addTeam(newResult.home);
        addTeam(newResult.away);
        setNewResult({ home: '', away: '', homeScore: 0, awayScore: 0, phase: selectedPhase });
        setShowForm(false);
    };

    return (
        <div className="standings-view">
            <div className="view-actions">
                <div className="title-section">
                    <h3>Classement Général</h3>
                    <div className="phase-selector glass">
                        {phases.map(p => (
                            <button
                                key={p}
                                className={`phase-btn ${selectedPhase === p ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedPhase(p);
                                    setNewResult(prev => ({ ...prev, phase: p }));
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                {isAdmin && (
                    <>
                        <button className="btn-primary" onClick={() => setShowForm(true)}>
                            <Plus size={20} />
                            <span>Saisir un résultat de ligue</span>
                        </button>
                        <button className="btn-secondary" onClick={() => setShowTeamForm(true)} style={{ marginLeft: '1rem' }}>
                            <span>Gérer les équipes</span>
                        </button>
                    </>
                )}
            </div>


            {
                showTeamForm && (
                    <div className="modal-overlay">
                        <div className="modal glass border-animate">
                            <h3>Liste des Équipes</h3>
                            <div className="team-manager-list" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {teams.sort().map(t => (
                                    <div key={t} className="glass" style={{ padding: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px' }}>
                                        <span style={{ fontWeight: 600 }}>{t}</span>
                                        {t !== 'CASE2' && (
                                            <button
                                                onClick={() => deleteTeam(t)}
                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="form-group">
                                <label>Ajouter une équipe</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={newTeamName}
                                        onChange={e => setNewTeamName(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && (addTeam(newTeamName), setNewTeamName(''))}
                                        placeholder="Nom de l'équipe..."
                                    />
                                    <button className="btn-primary" onClick={() => { addTeam(newTeamName); setNewTeamName(''); }}>Ajouter</button>
                                </div>
                            </div>
                            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                                <button className="btn-primary full-width" onClick={() => setShowTeamForm(false)}>Fermer</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showForm && (
                    <div className="modal-overlay">
                        <div className="modal glass border-animate">
                            <h3>Résultat autre match</h3>
                            <form onSubmit={handleAddResult}>
                                <div className="form-group full">
                                    <label>Phase de Championnat</label>
                                    <select
                                        value={newResult.phase}
                                        onChange={e => setNewResult({ ...newResult, phase: e.target.value })}
                                    >
                                        {phases.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Équipe Domicile</label>
                                        <input
                                            type="text"
                                            required
                                            list="teams-list"
                                            value={newResult.home}
                                            onChange={e => setNewResult({ ...newResult, home: e.target.value })}
                                            placeholder="Sélectionner ou saisir..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Score</label>
                                        <input type="number" required value={newResult.homeScore} onChange={e => setNewResult({ ...newResult, homeScore: parseInt(e.target.value) || 0 })} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Équipe Extérieur</label>
                                        <input
                                            type="text"
                                            required
                                            list="teams-list"
                                            value={newResult.away}
                                            onChange={e => setNewResult({ ...newResult, away: e.target.value })}
                                            placeholder="Sélectionner ou saisir..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Score</label>
                                        <input type="number" required value={newResult.awayScore} onChange={e => setNewResult({ ...newResult, awayScore: parseInt(e.target.value) || 0 })} />
                                    </div>
                                </div>

                                <datalist id="teams-list">
                                    {teams.sort().map(t => <option key={t} value={t} />)}
                                </datalist>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
                                    <button type="submit" className="btn-primary">Ajouter</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            <div className="table-container glass">
                <table className="standings-table">
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th className="team-col">Équipe</th>
                            <th>P</th>
                            <th>V</th>
                            <th>N</th>
                            <th>D</th>
                            <th>BM</th>
                            <th>BE</th>
                            <th>+/-</th>
                            <th className="pts-col">Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((team, index) => (
                            <tr key={index} className={team.name === 'CASE2' ? 'our-row' : ''}>
                                <td className="pos">{index + 1}</td>
                                <td className="team-col">{team.name}</td>
                                <td>{team.p}</td>
                                <td>{team.w}</td>
                                <td>{team.d}</td>
                                <td>{team.l}</td>
                                <td>{team.gf}</td>
                                <td>{team.ga}</td>
                                <td>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                                <td className="pts-col">{team.pts}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {
                currentLeagueMatches.length > 0 && (
                    <div className="league-results-list animate-fade-in" style={{ marginTop: '2rem' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Résultats enregistrés ({selectedPhase})</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {currentLeagueMatches.map(m => (
                                <div key={m.id} className="glass" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                        <span style={{ flex: 1, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.home}</span>
                                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '4px', minWidth: '50px', textAlign: 'center', border: '1px solid var(--border-color)' }}>{m.homeScore} - {m.awayScore}</span>
                                        <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.away}</span>
                                    </div>
                                    {isAdmin && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Supprimer le résultat ${m.home} ${m.homeScore}-${m.awayScore} ${m.away} ?`)) {
                                                    deleteLeagueMatch(m.id);
                                                }
                                            }}
                                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '1rem', display: 'flex', alignItems: 'center', padding: '4px' }}
                                            title="Supprimer ce résultat"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Standings;
