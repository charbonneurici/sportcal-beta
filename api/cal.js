export default async function handler(req, res) {
    const { teams } = req.query;
    if (!teams) return res.status(400).send("No teams selected");
    const decodedTeams = Buffer.from(teams, 'base64').toString().split(',');
    
    // BASE DE DONNÉES ÉTENDUE (Exemple Toulouse sur 3 journées)
    const matchDatabase = [
        // TOULOUSE
        { team: "stade-toulousain", summary: "Toulouse vs La Rochelle", date: "2026-03-28T21:05:00Z" },
        { team: "stade-toulousain", summary: "Bordeaux vs Toulouse", date: "2026-04-04T15:00:00Z" },
        { team: "stade-toulousain", summary: "Toulouse vs Racing 92", date: "2026-04-11T21:05:00Z" },
        
        // LA ROCHELLE
        { team: "stade-rochelais", summary: "Toulouse vs La Rochelle", date: "2026-03-28T21:05:00Z" },
        { team: "stade-rochelais", summary: "La Rochelle vs Castres", date: "2026-04-04T17:00:00Z" },
        
        // MONTAUBAN (Matchs fictifs pour tester)
        { team: "montauban", summary: "Montauban vs Montpellier", date: "2026-03-29T15:00:00Z" },
        { team: "montauban", summary: "Vannes vs Montauban", date: "2026-04-05T14:00:00Z" }
    ];

    const filteredMatches = matchDatabase.filter(m => decodedTeams.includes(m.team));

    let ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'X-WR-CALNAME:Top 14 Rugby',
        'METHOD:PUBLISH',
        'CALSCALE:GREGORIAN'
    ];

    filteredMatches.forEach(event => {
        const startDate = new Date(event.date);
        const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // Bloc de 2h
        const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        ics.push('BEGIN:VEVENT');
        ics.push(`SUMMARY:🏉 ${event.summary}`);
        ics.push(`DTSTART:${formatDate(startDate)}`);
        ics.push(`DTEND:${formatDate(endDate)}`);
        ics.push(`DESCRIPTION:Top 14 - Calendrier Officiel SportCal`);
        ics.push(`UID:${event.team}-${formatDate(startDate)}@sportcal.com`);
        ics.push('END:VEVENT');
    });

    ics.push('END:VCALENDAR');
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600');
    res.status(200).send(ics.join('\r\n'));
}
