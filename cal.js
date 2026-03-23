{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 export default function handler(req, res) \{\
  const \{ teams \} = req.query;\
  const decodedTeams = Buffer.from(teams || "", 'base64').toString('ascii').split(',');\
\
  // Pour la beta, on met des dates en 2026 (on est en mars 2026 selon mes infos)\
  const matches = [\
    \{ id: 'psg', summary: '\uc0\u9917 \u65039  PSG vs Monaco', start: '20260328T210000Z' \},\
    \{ id: 'xv-france', summary: '\uc0\u55356 \u57289  France vs Pays de Galles', start: '20260321T154500Z' \}\
  ];\
\
  const userMatches = matches.filter(m => decodedTeams.includes(m.id));\
\
  let icsLines = [\
    'BEGIN:VCALENDAR',\
    'VERSION:2.0',\
    'X-WR-CALNAME:SportCal Beta',\
    'METHOD:PUBLISH'\
  ];\
\
  userMatches.forEach(m => \{\
    icsLines.push('BEGIN:VEVENT');\
    icsLines.push(`SUMMARY:$\{m.summary\}`);\
    icsLines.push(`DTSTART:$\{m.start\}`);\
    icsLines.push(`DTEND:$\{m.start\}`); // Dur\'e9e \'e0 affiner\
    icsLines.push(`UID:$\{m.id\}-2026@sportcal.com`);\
    icsLines.push('END:VEVENT');\
  \});\
\
  icsLines.push('END:VCALENDAR');\
\
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');\
  res.setHeader('Content-Disposition', 'attachment; filename="calendar.ics"');\
  return res.status(200).send(icsLines.join('\\r\\n'));\
\}}