export const calculateStandings = (matches, leagueMatches, selectedPhase) => {
    const table = {};

    // Initialise CASE2 par défaut
    table['CASE2'] = { name: 'CASE2', p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };

    // Process our matches (Filtered by Phase)
    const phaseMatches = matches.filter(m => m.type === 'Championnat' && m.phase === selectedPhase);
    phaseMatches.forEach(m => {
        const home = 'CASE2';
        const away = m.opponent;

        if (!table[away]) table[away] = { name: away, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };

        table[home].p++;
        table[away].p++;
        table[home].gf += m.ourScore || 0;
        table[home].ga += m.opponentScore || 0;
        table[away].gf += m.opponentScore || 0;
        table[away].ga += m.ourScore || 0;

        if (m.ourScore > m.opponentScore) {
            table[home].w++; table[home].pts += 3;
            table[away].l++;
        } else if (m.ourScore < m.opponentScore) {
            table[away].w++; table[away].pts += 3;
            table[home].l++;
        } else {
            table[home].d++; table[home].pts += 1;
            table[away].d++; table[away].pts += 1;
        }
    });

    // Process other league matches (Filtered by Phase)
    leagueMatches.filter(m => m.phase === selectedPhase).forEach(m => {
        if (!table[m.home]) table[m.home] = { name: m.home, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
        if (!table[m.away]) table[m.away] = { name: m.away, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };

        table[m.home].p++;
        table[m.away].p++;
        table[m.home].gf += m.homeScore || 0;
        table[m.home].ga += m.awayScore || 0;
        table[m.away].gf += m.awayScore || 0;
        table[m.away].ga += m.homeScore || 0;

        if (m.homeScore > m.awayScore) {
            table[m.home].w++; table[m.home].pts += 3;
            table[m.away].l++;
        } else if (m.homeScore < m.awayScore) {
            table[m.away].w++; table[m.away].pts += 3;
            table[m.home].l++;
        } else {
            table[m.home].d++; table[m.home].pts += 1;
            table[m.away].d++; table[m.away].pts += 1;
        }
    });

    // Calculate GD and sort
    return Object.values(table).map(t => ({
        ...t,
        gd: t.gf - t.ga
    })).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
};
