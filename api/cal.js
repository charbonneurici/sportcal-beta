export default async function handler(req, res) {
    const { teams } = req.query;
    if (!teams) return res.status(400).send("Aucune équipe sélectionnée");

    const decodedTeams = Buffer.from(teams, 'base64').toString().split(',');
    
    // Mapping des IDs TheSportsDB (PSG et Toulouse pour le test)
    const teamMapping = {
        'psg': '133739',
        'stade-toulousain': '135311'
    };

    let allEvents = [];

    // On boucle sur les équipes pour appeler l'API
    for (const teamKey of decodedTeams) {
        const id = teamMapping[teamKey];
        if (id) {
            try {
                const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${id}`);
                const data = await response.json();
                if (data.events) {
                    allEvents = [...allEvents, ...data.events];
                }
            } catch (e) {
                console.error("Erreur API:", e);
            }
        }
    }

    // Génération du contenu iCalendar
    let ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'X-WR-CALNAME:SportCal Live',
        'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
        'METHOD:PUBLISH'
    ];

    allEvents.forEach(event => {
        // Nettoyage de la date (YYYY-MM-DD + HH:mm:ss -> AAAAMMDDTHHMMSS)
        const dateRaw = event.strTimestamp || "";
        const dateClean = dateRaw.replace(/[-:]/g, '').split('+')[0];

        if (dateClean) {
            ics.push('BEGIN:VEVENT');
            ics.push(`SUMMARY:${event.strEvent}`);
            ics.push(`DTSTART:${dateClean}Z`);
            ics.push(`DTEND:${dateClean}Z`); // On pourrait ajouter +2h ici
            ics.push(`DESCRIPTION:${event.strLeague} - ${event.strVenue || ''}`);
            ics.push(`UID:${event.idEvent}@sportcal.com`);
            ics.push('END:VEVENT');
        }
    });

    ics.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Cache Vercel de 1h
    res.status(200).send(ics.join('\r\n'));
}
