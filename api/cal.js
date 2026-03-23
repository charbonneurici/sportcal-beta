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
                    allEvents = [...allEvents, ...data.events];
                }
            } catch (e) { console.error("API Error:", e); }
        }
    }

    let ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//SportCal//Rugby//FR',
        'X-WR-CALNAME:Top 14 Live',
        'METHOD:PUBLISH'
    ];

    allEvents.forEach(event => {
        const dateRaw = event.strTimestamp || "";
        const dateClean = dateRaw.replace(/[-:]/g, '').split('+')[0];

        if (dateClean) {
            ics.push('BEGIN:VEVENT');
            ics.push(`SUMMARY:🏉 ${event.strEvent}`);
            ics.push(`DTSTART:${dateClean}Z`);
            ics.push(`DTEND:${dateClean}Z`);
            ics.push(`DESCRIPTION:${event.strLeague}`);
            ics.push(`UID:${event.idEvent}@sportcal.com`);
            ics.push('END:VEVENT');
        }
    });

    ics.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600');
    res.status(200).send(ics.join('\r\n'));
}
