import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Plus, UserPlus, Trash2, Edit2, Search, Users, Camera } from 'lucide-react';
import './Players.css';

const Players = () => {
    const { players, addPlayer, updatePlayer, deletePlayer, isAdmin } = useData();

    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPlayerId, setEditingPlayerId] = useState(null);

    const [newPlayer, setNewPlayer] = useState({
        name: '',
        number: '',
        position: 'Milieu',
        photo: ''
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewPlayer({ ...newPlayer, photo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newPlayer.name) return;

        if (editingPlayerId) {
            updatePlayer(editingPlayerId, newPlayer);
        } else {
            addPlayer(newPlayer);
        }

        setNewPlayer({ name: '', number: '', position: 'Milieu', photo: '' });
        setEditingPlayerId(null);
        setShowForm(false);
    };

    const handleEdit = (player) => {
        setNewPlayer({
            name: player.name,
            number: player.number,
            position: player.position,
            photo: player.photo
        });
        setEditingPlayerId(player.id);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingPlayerId(null);
        setNewPlayer({ name: '', number: '', position: 'Milieu', photo: '' });
    };

    const filteredPlayers = players.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const positions = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'];

    return (
        <div className="players-view">
            <div className="view-actions">
                <div className="search-box glass">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un joueur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {isAdmin && (
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        <UserPlus size={20} />
                        <span>Ajouter un joueur</span>
                    </button>
                )}
            </div>


            {showForm && (
                <div className="modal-overlay">
                    <div className="modal glass border-animate">
                        <h3>{editingPlayerId ? 'Modifier le Joueur' : 'Nouveau Joueur'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nom complet</label>
                                <input
                                    type="text"
                                    required
                                    value={newPlayer.name}
                                    onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })}
                                    placeholder="Ex: Lucas Martin"
                                />
                            </div>
                            <div className="form-group avatar-upload">
                                <label>Avatar / Photo</label>
                                <div className="avatar-preview-container">
                                    <div className="avatar-preview glass">
                                        {newPlayer.photo ? (
                                            <img src={newPlayer.photo} alt="Preview" />
                                        ) : (
                                            <Camera size={24} />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        id="avatar-input"
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="avatar-input" className="btn-secondary mini">
                                        Choisir une image
                                    </label>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Numéro</label>
                                    <input
                                        type="number"
                                        value={newPlayer.number}
                                        onChange={e => setNewPlayer({ ...newPlayer, number: e.target.value })}
                                        placeholder="10"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Poste</label>
                                    <select
                                        value={newPlayer.position}
                                        onChange={e => setNewPlayer({ ...newPlayer, position: e.target.value })}
                                    >
                                        {positions.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseForm}>Annuler</button>
                                <button type="submit" className="btn-primary">
                                    {editingPlayerId ? 'Mettre à jour' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="players-grid">
                {filteredPlayers.length > 0 ? (
                    filteredPlayers.map(player => (
                        <div key={player.id} className="player-card glass">
                            <div className="player-header">
                                <div className="player-number">{player.number || '?'}</div>
                                {isAdmin && (
                                    <div className="player-actions">
                                        <button className="edit-btn" onClick={() => handleEdit(player)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="delete-btn" onClick={() => deletePlayer(player.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="player-avatar">
                                {player.photo ? (
                                    <img src={player.photo} alt={player.name} className="avatar-img" />
                                ) : (
                                    player.name.charAt(0)
                                )}
                            </div>
                            <div className="player-info">
                                <h4>{player.name}</h4>
                                <p className="position">{player.position}</p>
                            </div>
                            <div className="player-stats">
                                <div className="stat">
                                    <span className="label">Buts</span>
                                    <span className="value">{player.goals}</span>
                                </div>
                                <div className="stat">
                                    <span className="label">Passes</span>
                                    <span className="value">{player.assists}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state glass">
                        <Users size={48} />
                        <p>Aucun joueur trouvé. Commencez par en ajouter un !</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Players;
