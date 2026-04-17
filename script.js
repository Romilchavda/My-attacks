const ACCOUNTS = [{
      id: 1,
      name: "Romil Chavda-Th17",
      tag: "PLGQLGLRY"
   },
   {
      id: 2,
      name: "Romil Chavda-Th15",
      tag: "PRGJC80UU"
   },
   {
      id: 3,
      name: "Romil Chavda-Th14",
      tag: "LL9P29L9Y"
   },
   {
      id: 4,
      name: "Romil Chavda-Th14",
      tag: "Q28LGU0VC"
   },
   {
      id: 5,
      name: "Romil Chavda-Th13",
      tag: "QJY928LPY"
   },
   {
      id: 6,
      name: "Romil Chavda-Th12",
      tag: "QR28JVGJ8"
   },
   {
      id: 7,
      name: "Mittu-Th12",
      tag: "QGUYP0J0Q"
   },
   {
      id: 8,
      name: "Mittu-Th9",
      tag: "G8VY8G220"
   }
];

let LEAGUE_DATA = [];
let userStats = JSON.parse(localStorage.getItem('coc_ultra_v3')) || {};

async function initialize() {
   try {
      const res = await fetch('leagues.json');
      LEAGUE_DATA = await res.json();

      ACCOUNTS.forEach(acc => {
         if (!userStats[acc.id]) {
            userStats[acc.id] = {
               count: 0,
               leagueId: LEAGUE_DATA[0].id,
               th: 16 // Default TH
            };
         }
      });
      renderCards();
   } catch (e) {
      console.error("JSON Error:", e);
      alert("Check leagues.json file path!");
   }
}

function renderCards() {
   const grid = document.getElementById('account-grid');
   grid.innerHTML = '';

   ACCOUNTS.forEach(acc => {
      const stat = userStats[acc.id];
      const league = LEAGUE_DATA.find(l => l.id == stat.leagueId) || LEAGUE_DATA[0];
      const progress = (stat.count / league.attacks) * 100;
      const barColor = progress >= 100 ? '#20C607' : '#fcc419';

      grid.innerHTML += `
            <div class="card">
                <div class="card-top">
                    <img src="${league.iconUrls.small}" class="league-img">
                    <div class="acc-info">
                        <h3>${acc.name}</h3>
                        <div class="controls-small">
                            <!-- FIXED TH SELECT HERE -->
                            
                            
                            <select onchange="updateLeague(${acc.id}, this.value)" class="styled-select">
                                ${LEAGUE_DATA.map(l => 
                                    `<option value="${l.id}" ${l.id == league.id ? 'selected' : ''}>${l.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <div class="counter-ui">
                    <span class="count-text">${stat.count}</span>
                    <span class="target-label">TARGET: ${league.attacks} BATTLES</span>
                </div>

                <div class="action-btns">
                    <button class="btn-action btn-minus" onclick="updateCount(${acc.id}, -1)"><i class="fas fa-minus"></i></button>
                    <button class="btn-action btn-plus" onclick="updateCount(${acc.id}, 1)"><i class="fas fa-plus"></i></button>
                </div>
                
                <div class="link-btn">
                  <a href="https://link.clashofclans.com/en?action=OpenPlayerProfile&tag=${acc.tag}" target="_blank" class="visit-link">
                   <i class="fas fa-external-link-alt"></i>
                   <h4>#${acc.tag}</h4>
                  </a>
                </div>

                <div class="prog-wrapper">
                    <div class="prog-fill" style="width: ${progress}%; background-color: ${barColor}"></div>
                </div>
            </div>
        `;
   });
}

function updateCount(id, change) {
   const stat = userStats[id];
   const league = LEAGUE_DATA.find(l => l.id == stat.leagueId);
   let val = stat.count + change;
   if (val >= 0 && val <= league.attacks) {
      stat.count = val;
      sync();
   }
}

function updateLeague(id, lId) {
   userStats[id].leagueId = parseInt(lId);
   sync();
}

function updateTH(id, th) {
   userStats[id].th = parseInt(th);
   sync();
}

function resetAllData() {
    if (confirm("Weekly data reset karein aur History mein save karein?")) {
        // 1. Purana data nikalna
        let history = JSON.parse(localStorage.getItem('coc_history')) || [];
        
        // 2. Current data ka ek snapshot banana
        let snapshot = {
            date: new Date().toLocaleDateString('en-GB'), // Aaj ki date
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

        // 3. History mein add karna
        history.unshift(snapshot); // Naya data sabse upar rahega
        localStorage.setItem('coc_history', JSON.stringify(history));

        // 4. Counts ko reset karna
        ACCOUNTS.forEach(a => userStats[a.id].count = 0);
        sync();
        
        alert("Data History mein save ho gaya hai!");
    }
}

function sync() {
   localStorage.setItem('coc_ultra_v3', JSON.stringify(userStats));
   renderCards();
}

initialize();