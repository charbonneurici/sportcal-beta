export default async function handler(req, res) {
  const { teams } = req.query;
  if (!teams) return res.status(400).send("No teams selected");

  const decodedTeams = Buffer.from(teams, 'base64').toString().split(',');
  
  // Mapping des IDs de TheSportsDB
  const teamMapping = {
    'psg': '133739',
    'xv-france': '135311' // On utilise Toulouse pour le test Top 14 ici
  };

  let allMatches = [];

  // On récupère les matchs pour chaque équipe sélectionnée
  for (const teamKey of decodedTeams) {
    const id = teamMapping[teamKey];
    if (id) {
      try {
        const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${id}`);
        const data = await response.json();
        if (data.events) {
          allMatches = [...allMatches, ...data.events];
        }
      } catch (e) {
        console.error("Erreur API", e);
      }
    }
  }

  // Construction du fichier ICS
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'X-WR-CALNAME:SportCal Live',
    'METHOD:PUBLISH'
  ];

  allMatches.forEach(event => {
    // Nettoyage de la date (TheSportsDB donne YYYY-MM-DD et HH:mm:ss)
    const dateStr = event.strTimestamp.replace(/[-:]/g, '').split('+')[0]; // Format AAAAMMDDTHHMMSS
    
    ics.push('BEGIN:VEVENT');
    ics.push(`SUMMARY:${event.strEvent}`);
    ics.push(`DTSTART:${dateStr}Z`);
    ics.push(`DTEND:${dateStr}Z`); // Idéalement ajouter 2h ici
    ics.push(`DESCRIPTION:${event.strLeague}`);
    ics.push(`UID:${event.idEvent}@sportcal.com`);
    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.send(ics.join('\r\n'));
}
