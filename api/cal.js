// api/cal.js
export default async function handler(req, res) {
    const { teams } = req.query;
    if (!teams) return res.status(400).send("Aucun club sélectionné");

    // Décodage des IDs de clubs
    const decodedTeams = Buffer.from(teams, 'base64').toString().split(',');
    
    // BASE DE DONNÉES EN DUR (Zéro API, Zéro erreur de Cardiff)
    // J'ai mis des matchs tests pour les 14 clubs pour la Beta
    const matchDatabase = [
        { team: "stade-toulousain", summary: "Stade Toulousain vs La Rochelle", date: "2026-03-28T21:00:00Z" },
        { team: "stade-rochelais", summary: "La Rochelle vs Stade Toulousain", date: "2026-03-28T21:00:00Z" },
        { team: "ubb-bordeaux", summary: "Bordeaux-Bègles vs Toulon", date: "2026-03-29T15:00:00Z" },
        { team: "rct-toulon", summary: "Toulon vs Bordeaux-Bègles", date: "2026-03-29T15:00:00Z" },
        { team: "racing-92", summary: "Racing 92 vs Stade Français", date: "2026-03-28T17:00:00Z" },
        { team: "stade-francais", summary: "Stade Français vs Racing 92", date: "2026-03-28T17:00:00Z" },
        { team: "asm-clermont", summary: "Clermont vs Lyon", date: "2026-03-29T17:00:00Z" },
        { team: "lyon-lou", summary: "Lyon vs Clermont", date: "2026-03-29T17:00:00Z" },
        { team: "castres-olympique", summary: "Castres vs Pau", date: "2026-03-28T15:00:00Z" },
        { team: "pau-section", summary: "Pau vs Castres", date: "2026-03-28T15:00:00Z" },
        { team: "bayonne", name: "Bayonne vs Perpignan", date: "2026-03-28T15:00:00Z" },
        { team: "perpignan", name: "Perpignan vs Bayonne", date: "2026-03-28T15:00:00Z" },
        { team: "montpellier", name: "Montpellier vs Montauban", date: "2026-03-29T15:00:00Z" },
        { team: "montauban", name: "US Montauban vs Montpellier", date: "2026-03-29T15:00:00Z" }
    ];

    // Filtrage des matchs selon la sélection de l'utilisateur
    const filteredMatches = matchDatabase.filter(m => decodedTeams.includes(m.team));

    // Génération du contenu iCalendar
    let ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//SportCal//Rugby//FR',
        'X-WR-CALNAME:Top 14 Stable',
        'METHOD:PUBLISH',
        'CALSCALE:GREGORIAN'
    ];

    filteredMatches.forEach(event => {
        // Calcul des dates (début et +2h)
        const startDate = new Date(event.date);
        const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // + 2 heures

        // Formatage pour iCal (AAAAMMDDTHHMMSSZ)
        const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        ics.push('BEGIN:VEVENT');
        ics.push(`SUMMARY:🏉 ${event.summary}`);
        ics.push(`DTSTART:${formatDate(startDate)}`);
        ics.push(`DTEND:${formatDate(endDate)}`); // Le créneau de 2h
        ics.push(`DESCRIPTION:Top 14 - Mode Stable`);
        ics.push(`UID:${event.team}-${formatDate(startDate)}@sportcal.com`);
        ics.push('END:VEVENT');
    });

    ics.push('END:VCALENDAR');

    // Réponse
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600'); // Cache Vercel 1h
    res.status(200).send(ics.join('\r\n'));
}
