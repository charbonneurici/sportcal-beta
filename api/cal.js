export default function handler(req, res) {
  const { teams } = req.query;
  const decodedTeams = Buffer.from(teams || "", 'base64').toString().split(',');

  // Dates pour la Beta (Mars 2026)
  const matches = [
    { id: 'psg', summary: '⚽️ PSG vs Monaco', start: '20260328T210000Z' },
    { id: 'xv-france', summary: '🏉 France vs Pays de Galles', start: '20260321T154500Z' }
  ];

  const userMatches = matches.filter(m => decodedTeams.includes(m.id));

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'X-WR-CALNAME:SportCal Beta',
    ...userMatches.flatMap(m => [
      'BEGIN:VEVENT',
      `SUMMARY:${m.summary}`,
      `DTSTART:${m.start}`,
      `DTEND:${m.start}`,
      'END:VEVENT'
    ]),
    'END:VCALENDAR'
  ].join('\r\n');

  res.setHeader('Content-Type', 'text/calendar');
  res.send(ics);
}
