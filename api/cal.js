export default async function handler(req, res) {
    const { teams } = req.query;
    if (!teams) return res.status(400).send("Aucun club sélectionné");

    const decodedTeams = Buffer.from(teams, 'base64').toString().split(',');
    
    const teamMapping = {
        "stade-toulousain": "135311",
        "stade-rochelais": "135317",
        "ubb-bordeaux": "135315",
        "rct-toulon": "135314",
        "racing-92": "135310",
        "stade-francais": "135312",
        "asm-clermont": "135313",
        "lyon-lou": "135316",
        "castres-olympique": "135319",
        "pau-section": "135320",
        "bayonne": "135322",
        "perpignan": "135324",
        "montpellier": "135318",
        "montauban": "135338"
    };

    let allEvents = [];

    for (const teamKey of decodedTeams) {
        const id = teamMapping[teamKey];
        if (id) {
            try {
                const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${id}`);
                const data = await response.json();
                if (data.events) {
                    // Filtrer pour être SÛR que c'est du Rugby (évite Bolton)
                    const rugbyEvents = data.events.filter(e => e.strSport === "Rugby" || e.strLeague.includes("Top 14"));
                    allEvents = [...allEvents, ...rugbyEvents];
                }
            } catch (e) { console.error("API Error:", e); }
        }
    }

    let ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'X-WR-CALNAME:Top 14 Rugby',
        'METHOD:PUBLISH'
    ];

    allEvents.forEach(event => {
        const dateRaw = event.strTimestamp;
        if (!dateRaw) return;

        // Calcul des 2h
        const startDate = new Date(dateRaw);
        const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000));

        const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        ics.push('BEGIN:VEVENT');
        ics.push(`SUMMARY:🏉 ${event.strEvent}`);
        ics.push(`DTSTART:${formatDate(startDate)}`);
        ics.push(`DTEND:${formatDate(endDate)}`);
        ics.push(`DESCRIPTION:${event.strLeague} - ${event.strVenue || ''}`);
        ics.push(`LOCATION:${event.strVenue || 'France'}`);
        ics.push(`UID:${event.idEvent}@sportcal.com`);
        ics.push('END:VEVENT');
    });

    ics.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.status(200).send(ics.join('\r\n'));
}
