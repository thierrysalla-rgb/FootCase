import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';


const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [players, setPlayers] = useState([]);
    const [matches, setMatches] = useState([]);
    const [leagueMatches, setLeagueMatches] = useState([]);
    const [staff, setStaff] = useState([]);
    const [teams, setTeams] = useState(['CASE2']);

    // Auth State change listener
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Initial Fetch from Supabase
    useEffect(() => {
        const fetchData = async () => {
            if (!supabase) {
                console.error("Supabase client not initialized.");
                setLoading(false);
                return;
            }

            try {
                const [p, m, l, s, t] = await Promise.all([
                    supabase.from('players').select('*'),
                    supabase.from('matches').select('*'),
                    supabase.from('league_matches').select('*'),
                    supabase.from('staff').select('*'),
                    supabase.from('teams').select('*')
                ]);

                // Log any errors from Supabase responses
                [p, m, l, s, t].forEach((res, i) => {
                    if (res.error) console.error(`Supabase error (query ${i}):`, res.error);
                });

                if (p.data) setPlayers(p.data);
                if (m.data) setMatches(m.data.map(match => ({
                    ...match,
                    ourScore: match.our_score,
                    opponentScore: match.opponent_score
                })));
                if (l.data) setLeagueMatches(l.data.map(lm => ({
                    ...lm,
                    homeScore: lm.home_score,
                    awayScore: lm.away_score
                })));
                if (s.data) setStaff(s.data);
                if (t.data) setTeams(t.data.map(team => team.name));
            } catch (err) {
                console.error("Critical error fetching data from Supabase:", err);
                // Fallback to localStorage if offline or error
                try {
                    const savedPlayers = localStorage.getItem('u11_players');
                    if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
                } catch (e) {
                    console.error("LocalStorage fallback failed:", e);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const addTeam = async (teamName) => {
        if (!teamName) return;
        const normalized = teamName.trim();
        if (!teams.includes(normalized)) {
            setTeams([...teams, normalized]);
            await supabase.from('teams').insert([{ name: normalized }]);
        }
    };

    const deleteTeam = async (teamName) => {
        if (teamName === 'CASE2') return;
        setTeams(teams.filter(t => t !== teamName));
        await supabase.from('teams').delete().eq('name', teamName);
    };

    const addPlayer = async (player) => {
        const newPlayer = { ...player, id: Date.now(), goals: 0, assists: 0 };
        setPlayers([...players, newPlayer]);
        await supabase.from('players').insert([newPlayer]);
    };

    const updatePlayer = async (id, updates) => {
        setPlayers(players.map(p => p.id === id ? { ...p, ...updates } : p));
        await supabase.from('players').update(updates).eq('id', id);
    };

    const deletePlayer = async (id) => {
        setPlayers(players.filter(p => p.id !== id));
        await supabase.from('players').delete().eq('id', id);
    };

    const addStaff = async (member) => {
        const newMember = { ...member, id: Date.now() };
        setStaff([...staff, newMember]);
        await supabase.from('staff').insert([newMember]);
    };

    const updateStaff = async (id, updates) => {
        setStaff(staff.map(s => s.id === id ? { ...s, ...updates } : s));
        await supabase.from('staff').update(updates).eq('id', id);
    };

    const deleteStaff = async (id) => {
        setStaff(staff.filter(s => s.id !== id));
        await supabase.from('staff').delete().eq('id', id);
    };

    const addMatch = async (match) => {
        const newMatch = {
            ...match,
            id: Date.now(),
            our_score: 0,
            opponent_score: 0,
            lineup: [],
            bench: [],
            events: [],
            status: 'planned',
            location: match.location || '',
            phase: match.phase || ''
        };
        setMatches([...matches, { ...newMatch, ourScore: 0, opponentScore: 0 }]);
        await supabase.from('matches').insert([newMatch]);
    };

    const updateMatch = async (id, updates) => {
        const dbUpdates = { ...updates };
        if (updates.ourScore !== undefined) {
            dbUpdates.our_score = updates.ourScore;
            delete dbUpdates.ourScore;
        }
        if (updates.opponentScore !== undefined) {
            dbUpdates.opponent_score = updates.opponentScore;
            delete dbUpdates.opponentScore;
        }

        setMatches(matches.map(m => m.id === id ? { ...m, ...updates } : m));
        await supabase.from('matches').update(dbUpdates).eq('id', id);
    };

    const deleteMatch = async (id) => {
        setMatches(matches.filter(m => m.id !== id));
        await supabase.from('matches').delete().eq('id', id);
    };

    const addMatchEvent = async (matchId, event) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;

        const updatedEvents = [...match.events, { ...event, id: Date.now() }];
        await updateMatch(matchId, { events: updatedEvents });
    };

    const deleteMatchEvent = async (matchId, eventId) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;

        const updatedEvents = match.events.filter(e => e.id !== eventId);
        await updateMatch(matchId, { events: updatedEvents });
    };

    const playersWithStats = useMemo(() => {
        return players.map(player => {
            let goals = 0;
            let assists = 0;
            matches.forEach(match => {
                match.events?.forEach(event => {
                    if (event.type === 'goal') {
                        if (Number(event.playerId) === player.id) goals++;
                        if (event.assistId && Number(event.assistId) === player.id) assists++;
                    }
                });
            });
            return { ...player, goals, assists };
        });
    }, [players, matches]);

    const addLeagueMatch = async (match) => {
        const newLM = { ...match, id: Date.now(), home_score: match.homeScore, away_score: match.awayScore };
        const { homeScore, awayScore, ...dbMatch } = newLM;
        setLeagueMatches([...leagueMatches, newLM]);
        await supabase.from('league_matches').insert([dbMatch]);
    };

    const deleteLeagueMatch = async (id) => {
        setLeagueMatches(leagueMatches.filter(m => m.id !== id));
        await supabase.from('league_matches').delete().eq('id', id);
    };

    const login = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        user,
        isAdmin: !!user,
        loading,
        login,
        logout,
        players: playersWithStats,

        addPlayer,
        updatePlayer,
        deletePlayer,
        matches,
        addMatch,
        updateMatch,
        deleteMatch,
        addMatchEvent,
        deleteMatchEvent,
        leagueMatches,
        addLeagueMatch,
        deleteLeagueMatch,
        teams,
        addTeam,
        deleteTeam,
        staff,
        addStaff,
        updateStaff,
        deleteStaff,
        restoreAllData
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
};
