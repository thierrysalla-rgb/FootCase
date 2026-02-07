import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Plus, UserPlus, Trash2, Edit2, Search, Users, Camera, BadgeCheck, UserCog, Trophy } from 'lucide-react';
import './Staff.css';

const Staff = () => {
    const { staff, addStaff, updateStaff, deleteStaff, isAdmin } = useData();

    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingStaffId, setEditingStaffId] = useState(null);

    const [newMember, setNewMember] = useState({
        name: '',
        role: 'Adjoint',
        photo: ''
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewMember({ ...newMember, photo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newMember.name) return;

        if (editingStaffId) {
            updateStaff(editingStaffId, newMember);
        } else {
            addStaff(newMember);
        }

        setNewMember({ name: '', role: 'Adjoint', photo: '' });
        setEditingStaffId(null);
        setShowForm(false);
    };

    const handleEdit = (member) => {
        setNewMember({
            name: member.name,
            role: member.role,
            photo: member.photo
        });
        setEditingStaffId(member.id);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingStaffId(null);
        setNewMember({ name: '', role: 'Adjoint', photo: '' });
    };

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const roles = ['Entraîneur Principal', 'Adjoint', 'Entraîneur Gardiens', 'Préparateur Physique', 'Dirigeant'];

    return (
        <div className="staff-view">
            <div className="view-actions">
                <div className="search-box glass">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un membre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {isAdmin && (
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        <UserCog size={20} />
                        <span>Ajouter un membre</span>
                    </button>
                )}
            </div>


            {showForm && (
                <div className="modal-overlay">
                    <div className="modal glass border-animate">
                        <h3>{editingStaffId ? 'Modifier le Membre' : 'Nouveau Membre Staff'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nom complet</label>
                                <input
                                    type="text"
                                    required
                                    value={newMember.name}
                                    onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                    placeholder="Ex: Jean Dupont"
                                />
                            </div>
                            <div className="form-group avatar-upload">
                                <label>Photo / Avatar</label>
                                <div className="avatar-preview-container">
                                    <div className="avatar-preview glass">
                                        {newMember.photo ? (
                                            <img src={newMember.photo} alt="Preview" />
                                        ) : (
                                            <Camera size={24} />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        id="staff-avatar-input"
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="staff-avatar-input" className="btn-secondary mini">
                                        Choisir une image
                                    </label>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Rôle</label>
                                <select
                                    value={newMember.role}
                                    onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                                >
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseForm}>Annuler</button>
                                <button type="submit" className="btn-primary">
                                    {editingStaffId ? 'Mettre à jour' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="staff-grid">
                {filteredStaff.length > 0 ? (
                    filteredStaff.map(member => (
                        <div key={member.id} className="staff-card glass">
                            <div className="staff-header">
                                <div className="role-badge">
                                    {member.role === 'Entraîneur Principal' ? <Trophy size={14} /> : <BadgeCheck size={14} />}
                                    <span>{member.role}</span>
                                </div>
                                {isAdmin && (
                                    <div className="staff-actions">
                                        <button className="edit-btn" onClick={() => handleEdit(member)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="delete-btn" onClick={() => deleteStaff(member.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="staff-avatar">
                                {member.photo ? (
                                    <img src={member.photo} alt={member.name} className="avatar-img" />
                                ) : (
                                    member.name.charAt(0)
                                )}
                            </div>
                            <div className="staff-info">
                                <h4>{member.name}</h4>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state glass">
                        <Users size={48} />
                        <p>Aucun membre du staff pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Staff;
