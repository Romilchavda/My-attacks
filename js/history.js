const historyList = document.getElementById('history-list');
const historyData = JSON.parse(localStorage.getItem('coc_history')) || [];

function renderHistory() {
    if (historyData.length === 0) {
        historyList.innerHTML = `<div style="text-align:center; color:var(--text-dim); margin-top:50px;">No records found. Reset your dashboard to start.</div>`;
        return;
    }

    historyList.innerHTML = '';
    historyData.forEach((week, index) => {
        let card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #30363d; padding-bottom:15px; margin-bottom:15px;">
                <h3 style="font-family:'Rajdhani'; color:var(--accent)">WEEK: ${week.date}</h3>
                <i class="fas fa-trash" style="color:var(--danger); cursor:pointer" onclick="deleteHistory(${index})"></i>
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:10px;">
                ${week.accounts.map(acc => `
                    <div style="background:rgba(0,0,0,0.2); padding:10px; border-radius:12px; display:flex; align-items:center; gap:10px;">
                        <img src="${acc.leagueIcon}" style="width:30px; height:30px;">
                        <div>
                            <div style="font-size:0.7rem; color:var(--text-dim); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:80px;">${acc.name}</div>
                            <div style="font-family:'Rajdhani'; font-weight:bold;">${acc.count} / ${acc.target}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        historyList.appendChild(card);
    });
}

function deleteHistory(index) {
    if(!confirm("Delete this week's record?")) return;
    historyData.splice(index, 1);
    localStorage.setItem('coc_history', JSON.stringify(historyData));
    location.reload();
}

// Backup & Restore
function exportData() {
    const backup = {
        v3: JSON.parse(localStorage.getItem('coc_ultra_v3')),
        hist: JSON.parse(localStorage.getItem('coc_history')),
        up: JSON.parse(localStorage.getItem('coc_upgrades'))
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CoC_Elite_Backup_${new Date().toLocaleDateString()}.json`;
    a.click();
}

function importData(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        const data = JSON.parse(event.target.result);
        if(confirm("Restore data? This will overwrite everything!")) {
            if(data.v3) localStorage.setItem('coc_ultra_v3', JSON.stringify(data.v3));
            if(data.hist) localStorage.setItem('coc_history', JSON.stringify(data.hist));
            if(data.up) localStorage.setItem('coc_upgrades', JSON.stringify(data.up));
            location.reload();
        }
    };
    reader.readAsText(file);
}

renderHistory();