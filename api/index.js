export default function handler(req, res) {
  const { teams } = req.query;

  // SI L'UTILISATEUR VEUT LE CALENDRIER (Lien généré)
  if (teams) {
    const decodedTeams = Buffer.from(teams, 'base64').toString().split(',');
    const matches = [
      { id: 'psg', summary: '⚽️ PSG vs Monaco', start: '20260328T210000Z' },
      { id: 'xv-france', summary: '🏉 France vs Pays de Galles', start: '20260321T154500Z' }
    ];
    const userMatches = matches.filter(m => decodedTeams.includes(m.id));
    let ics = ['BEGIN:VCALENDAR','VERSION:2.0','X-WR-CALNAME:SportCal','METHOD:PUBLISH'];
    userMatches.forEach(m => {
      ics.push('BEGIN:VEVENT', `SUMMARY:${m.summary}`, `DTSTART:${m.start}`, `DTEND:${m.start}`, 'END:VEVENT');
    });
    ics.push('END:VCALENDAR');
    res.setHeader('Content-Type', 'text/calendar');
    return res.send(ics.join('\r\n'));
  }

  // SI L'UTILISATEUR EST SUR LE SITE (La page d'accueil)
  res.setHeader('Content-Type', 'text/html');
  return res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><title>SportCal Beta 🏆</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 class="text-5xl font-black mb-10 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">SportCal</h1>
        <div class="bg-slate-800 p-8 rounded-3xl border border-slate-700 w-full max-w-md text-left">
            <label class="flex items-center p-4 bg-slate-700/50 rounded-2xl mb-4 cursor-pointer">
                <input type="checkbox" value="psg" class="w-6 h-6 mr-4 accent-emerald-400"> PSG (Foot)
            </label>
            <label class="flex items-center p-4 bg-slate-700/50 rounded-2xl mb-8 cursor-pointer">
                <input type="checkbox" value="xv-france" class="w-6 h-6 mr-4 accent-blue-400"> XV de France (Rugby)
            </label>
            <button onclick="generate()" class="w-full bg-white text-black py-4 rounded-2xl font-bold">Générer mon lien</button>
        </div>
        <div id="res" class="hidden mt-8 p-4 bg-black rounded-xl border border-emerald-500/50 w-full max-w-md">
            <p class="text-xs text-emerald-400 font-bold mb-2 uppercase">Ton lien :</p>
            <code id="url" class="text-blue-300 break-all text-xs"></code>
        </div>
        <script>
            function generate() {
                const ids = Array.from(document.querySelectorAll('input:checked')).map(c => c.value).join(',');
                if(!ids) return alert("Choisis une équipe !");
                const link = window.location.origin + '/api?teams=' + btoa(ids);
                document.getElementById('url').innerText = link;
                document.getElementById('res').classList.remove('hidden');
            }
        </script>
    </body>
    </html>
  `);
}
