import React, { useRef } from 'react';
import { useData } from '../store/DataContext';
import { Download, Upload, FileText, Database, ShieldCheck, AlertTriangle } from 'lucide-react';
import { calculateStandings } from '../utils/standingsUtils';
import * as XLSX from 'xlsx';
import './Settings.css';

const Settings = () => {
    const { players, matches, leagueMatches, staff, teams, restoreAllData, isAdmin } = useData();

    const fileInputRef = useRef(null);

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // 1. Sheet Players
        const playersData = players.map(p => ({
            Nom: p.name,
            Numéro: p.number,
            Poste: p.position,
            Buts: p.goals,
            Passes: p.assists
        }));
        const wsPlayers = XLSX.utils.json_to_sheet(playersData);
        XLSX.utils.book_append_sheet(wb, wsPlayers, "Effectif");

        // 2. Sheet Matches
        const matchesData = matches.map(m => ({
            Date: new Date(m.date).toLocaleDateString('fr-FR'),
            Type: m.type,
            Phase: m.phase || '',
            Adversaire: m.opponent,
            Score: `${m.ourScore} - ${m.opponentScore}`,
            Statut: m.status === 'completed' ? 'Terminé' : 'Prévu',
            Lieu: m.location || ''
        }));
        const wsMatches = XLSX.utils.json_to_sheet(matchesData);
        XLSX.utils.book_append_sheet(wb, wsMatches, "Historique Matchs");

        // 3. Sheets for Standings per Phase
        const phases = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'];
        phases.forEach(phase => {
            const phaseStandings = calculateStandings(matches, leagueMatches, phase);
            // Hide "CASE2" if it's the only one and there are no matches in that phase
            if (phaseStandings.length > 1 || phaseStandings[0].p > 0) {
                const standingsData = phaseStandings.map((t, i) => ({
                    Rang: i + 1,
                    Équipe: t.name,
                    MJ: t.p,
                    G: t.w,
                    N: t.d,
                    P: t.l,
                    BP: t.gf,
                    BC: t.ga,
                    Diff: t.gd,
                    Pts: t.pts
                }));
                const wsPhase = XLSX.utils.json_to_sheet(standingsData);
                XLSX.utils.book_append_sheet(wb, wsPhase, `Classement ${phase}`);
            }
        });

        // 4. Sheet League Results (Cleaned - only active results)
        const leagueData = leagueMatches.map(m => ({
            Phase: m.phase,
            Domicile: m.home,
            Score: `${m.homeScore} - ${m.awayScore}`,
            Extérieur: m.away
        }));
        if (leagueData.length > 0) {
            const wsLeague = XLSX.utils.json_to_sheet(leagueData);
            XLSX.utils.book_append_sheet(wb, wsLeague, "Tous les Résultats");
        }

        // 5. Sheet Staff
        const staffData = staff.map(s => ({
            Nom: s.name,
            Rôle: s.role
        }));
        const wsStaff = XLSX.utils.json_to_sheet(staffData);
        XLSX.utils.book_append_sheet(wb, wsStaff, "Encadrement");

        // Write and download
        XLSX.writeFile(wb, `Stats_CASE2_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.xlsx`);
    };

    const exportBackup = () => {
        const data = {
            players,
            matches,
            leagueMatches,
            staff,
            teams,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_case2_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const importBackup = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (window.confirm("Attention : Restaurer une sauvegarde va écraser vos données actuelles. Continuer ?")) {
                    const result = await restoreAllData(data);
                    if (result.success) {
                        alert("✅ Sauvegarde restaurée avec succès et synchronisée dans le cloud !");
                    } else {
                        alert("❌ Erreur lors de la restauration. Vérifiez la console.");
                    }
                }
            } catch (err) {
                alert("❌ Erreur lors de la lecture du fichier de sauvegarde.");
                console.error(err);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="settings-view animate-fade-in">
            <div className="settings-header">
                <Database size={32} color="var(--secondary)" />
                <h3>Gestion des Données</h3>
            </div>

            <div className="settings-grid">
                <div className="settings-card glass">
                    <div className="card-icon">
                        <FileText size={24} color="#217346" />
                    </div>
                    <h4>Export Excel</h4>
                    <p>Téléchargez toutes vos statistiques dans un fichier Excel multi-feuilles pour analyse externe ou impression.</p>
                    <button className="btn-primary" onClick={exportToExcel}>
                        <Download size={18} />
                        Exporter vers Excel
                    </button>
                </div>

                <div className="settings-card glass">
                    <div className="card-icon">
                        <ShieldCheck size={24} color="var(--primary)" />
                    </div>
                    <h4>Sauvegarde Complète</h4>
                    <p>Créez un point de restauration complet (format JSON) pour protéger vos données contre une perte éventuelle.</p>
                    <button className="btn-secondary" onClick={exportBackup}>
                        <Download size={18} />
                        Télécharger la Sauvegarde
                    </button>
                </div>

                {isAdmin && (
                    <div className="settings-card glass danger-zone">
                        <div className="card-icon">
                            <Upload size={24} color="#ef4444" />
                        </div>
                        <h4>Restaurer une Sauvegarde</h4>
                        <p>Importez un fichier de sauvegarde précédemment créé. Attention, cela remplacera toutes vos données actuelles.</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={importBackup}
                            style={{ display: 'none' }}
                            accept=".json"
                        />
                        <button className="btn-danger" onClick={handleImportClick}>
                            <Upload size={18} />
                            Importer un Fichier
                        </button>
                    </div>
                )}

            </div>

            <div className="settings-info glass">
                <AlertTriangle size={20} color="#ff9800" />
                <p>
                    <strong>Note :</strong> Vos données sont désormais synchronisées dans le Cloud via Supabase.
                    Toutes les modifications faites par l'administrateur sont visibles instantanément par tous les utilisateurs.
                </p>
            </div>

        </div>
    );
};

export default Settings;
