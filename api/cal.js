export default async function handler(req, res) {
    const { teams } = req.query;
    if (!teams) return res.status(400).send("No teams selected");
    const decodedTeams = Buffer.from(teams, 'base64').toString().split(',');
    
    const teamMapping = {
        "stade-toulousain": "135311", "stade-rochelais": "135317", "ubb-bordeaux": "135315",
        "rct-toulon": "135314", "racing-92": "135310", "stade-francais": "135312",
        "asm-clermont": "135313", "lyon-lou": "135316", "castres-olympique": "135319",
        "pau-section": "135320", "bayonne": "135322", "perpignan": "135324",
        "montpellier": "135318", "montauban": "135338"
    };

    let allEvents = [];

    // 1. TENTATIVE API LIVE
    for (const teamKey of decodedTeams) {
        const id = teamMapping[teamKey];
        if (id) {
            try {
                const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${id}`);
                const data = await response.json();
                if (data.events) allEvents = [...allEvents, ...data.events];
            } catch (e) { console.error("API DOWN"); }
        }
    }

    // 2. MODE SECOURS (Si l'API ne renvoie rien, on met des matchs de test pour demain)
    if (allEvents.length === 0) {
        allEvents.push({
            strEvent: "Test : Toulouse vs La Rochelle (Match fictif)",
            strTimestamp: new Date(Date.now() + 86400000).toISOString(), // Demain
            strLeague: "Top 14 - Mode Secours",
            idEvent: "99999"
        });
    }

    // 3. GÉNÉRATION ICS
    let ics = ['BEGIN:VCALENDAR','VERSION:2.0','X-WR-CALNAME:Top 14 Live','METHOD:PUBLISH'];

    allEvents.forEach(event => {
        const startDate = new Date(event.strTimestamp || Date.now());
        const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000));
        const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        ics.push('BEGIN:VEVENT');
        ics.push(`SUMMARY:🏉 ${event.strEvent}`);
        ics.push(`DTSTART:${formatDate(startDate)}`);
        ics.push(`DTEND:${formatDate(endDate)}`);
        ics.push(`UID:${event.idEvent}@sportcal.com`);
        ics.push('END:VEVENT');
    });

    ics.push('END:VCALENDAR');
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.status(200).send(ics.join('\r\n'));
}
