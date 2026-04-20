const ACCOUNTS = [
    { id: 1, name: "Romil Chavda-Th17", tag: "PLGQLGLRY" },
    { id: 2, name: "Romil Chavda-Th15", tag: "PRGJC80UU" },
    { id: 3, name: "Romil Chavda-Th14", tag: "LL9P29L9Y" },
    { id: 4, name: "Romil Chavda-Th14", tag: "Q28LGU0VC" },
    { id: 5, name: "Romil Chavda-Th13", tag: "QJY928LPY" },
    { id: 6, name: "Romil Chavda-Th12", tag: "QR28JVGJ8" },
    { id: 7, name: "Mittu-Th12", tag: "QGUYP0J0Q" },
    { id: 8, name: "Mittu-Th9", tag: "G8VY8G220" }
];

let LEAGUE_DATA = [];
let userStats = JSON.parse(localStorage.getItem('coc_ultra_v3')) || {};

async function init() {
    try {
        const res = await fetch('leagues.json');
        LEAGUE_DATA = await res.json();
        
        ACCOUNTS.forEach(acc => {
            if (!userStats[acc.id]) {
                userStats[acc.id] = { count: 0, leagueId: LEAGUE_DATA[0].id };
            }
        });
        render();
    } catch (e) {
        console.error("JSON Load Error:", e);
    }
}

function render() {
    const grid = document.getElementById('account-grid');
    grid.innerHTML = '';

    ACCOUNTS.forEach(acc => {
        const stat = userStats[acc.id];
        const league = LEAGUE_DATA.find(l => l.id == stat.leagueId) || LEAGUE_DATA[0];
        const progress = (stat.count / league.attacks) * 100;
        const color = progress >= 100 ? '#20C607' : '#fcc419';

        grid.innerHTML += `
            <div class="card">
                <div style="display:flex; align-items:center; gap:20px; margin-bottom:20px;">
                    <img src="${league.iconUrls.small}" style="width:65px; height:65px; filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));">
                    <div style="flex-grow:1">
                        <h3 style="font-family:'Rajdhani'; color:var(--accent); font-size:1.4rem;">${acc.name}</h3>
                        
                        <!-- Sirf League Select Rakha Hai -->
                        <select onchange="updateLeague(${acc.id}, this.value)" class="input-field" style="padding:8px; font-size:0.8rem; margin-top:8px; margin-bottom:0; background: rgba(0,0,0,0.3);">
                            ${LEAGUE_DATA.map(l => `<option value="${l.id}" ${l.id == league.id ? 'selected' : ''}>${l.name}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="counter-box">
                    <span class="count-val">${stat.count}</span>
                    <div style="font-size:0.75rem; color:var(--text-dim); letter-spacing:2px; font-weight:600;">Attacks / ${league.attacks}</div>
                </div>

                <div class="btn-group">
                    <button class="btn btn-m" onclick="updateCount(${acc.id}, -1)"><i class="fas fa-minus"></i></button>
                    <button class="btn btn-p" onclick="updateCount(${acc.id}, 1)"><i class="fas fa-plus"></i></button>
                </div>

                <a href="https://link.clashofclans.com/en?action=OpenPlayerProfile&tag=${acc.tag}" target="_blank" style="display:flex; align-items:center; justify-content:center; gap:10px; text-decoration:none; background:#21262d; padding:12px; border-radius:12px; margin-top:20px; color:var(--cyan); font-weight:600; border:1px solid rgba(255,255,255,0.05);">
                    <i class="fas fa-external-link-alt"></i> #${acc.tag}
                </a>

                <div class="p-bar-bg">
                    <div class="p-bar-fill" style="width:${progress}%; background:${color}; box-shadow: 0 0 10px ${color}66;"></div>
                </div>
            </div>
        `;
    });
}

function updateCount(id, change) {
    const league = LEAGUE_DATA.find(l => l.id == userStats[id].leagueId);
    let val = userStats[id].count + change;
    if (val >= 0 && val <= league.attacks) {
        userStats[id].count = val;
        save();
    }
}

function updateLeague(id, lId) {
    userStats[id].leagueId = parseInt(lId);
    save();
}

function save() {
    localStorage.setItem('coc_ultra_v3', JSON.stringify(userStats));
    render();
}

function resetAllData() {
    if(!confirm("⚠️ Weekly counts reset karein aur history me save karein?")) return;
    
    // Archive Logic
    let history = JSON.parse(localStorage.getItem('coc_history')) || [];
    let snapshot = {
        date: new Date().toLocaleDateString('en-GB'),
        accounts: ACCOUNTS.map(acc => {
            let stat = userStats[acc.id];
            let league = LEAGUE_DATA.find(l => l.id == stat.leagueId);
            return {
                name: acc.name,
                count: stat.count,
                target: league ? league.attacks : 0,
                leagueIcon: league ? league.iconUrls.small : ""
            };
        })
    };
    history.unshift(snapshot);
    localStorage.setItem('coc_history', JSON.stringify(history));

    // Reset counts
    ACCOUNTS.forEach(a => userStats[a.id].count = 0);
    save();
}

init();