// --- 1. CONFIGURATION (Inhe sahi se bharein) ---
const GITHUB_USER = "Romilchavda"; // Apna GitHub Username yahan likhein
const REPO_NAME = "My-attacks";   // Apne Repository ka naam yahan likhein
const ASSETS_FOLDER = "assets";   // MP3 folder ka naam

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

let upgrades = JSON.parse(localStorage.getItem('coc_upgrades')) || [];

// --- 2. AUTOMATIC MP3 LOADER ---
async function loadSounds() {
    const soundSelect = document.getElementById('soundSelect');
    if(!soundSelect) return;

    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/${ASSETS_FOLDER}`);
        const files = await response.json();

        // Dropdown clear karein
        soundSelect.innerHTML = '';

        // Filter MP3 files
        const mp3s = files.filter(f => f.name.endsWith('.mp3'));

        if(mp3s.length === 0) {
            soundSelect.innerHTML = '<option value="assets/alarm.mp3">NO MP3 FOUND</option>';
            return;
        }

        mp3s.forEach(file => {
            const option = document.createElement('option');
            option.value = file.path; // Path save hoga: assets/music.mp3
            option.textContent = file.name.replace('.mp3', '').replace(/_/g, ' ').toUpperCase();
            soundSelect.appendChild(option);
        });
    } catch (e) {
        console.error("Sounds load error:", e);
        soundSelect.innerHTML = '<option value="assets/alarm.mp3">DEFAULT ALARM</option>';
    }
}

// Initial Calls
const accSelect = document.getElementById('accSelect');
ACCOUNTS.forEach(acc => {
    accSelect.innerHTML += `<option value="${acc.id}">${acc.name}</option>`;
});
loadSounds();

// --- 3. LOGIC ---

function addUpgrade() {
    const accId = accSelect.value;
    const name = document.getElementById('upName').value;
    const soundFile = document.getElementById('soundSelect').value; // Get selected sound
    const d = parseInt(document.getElementById('days').value) || 0;
    const h = parseInt(document.getElementById('hours').value) || 0;
    const m = parseInt(document.getElementById('mins').value) || 0;

    if (!name) return alert("Pehle batao kya upgrade ho raha hai!");

    const durationMs = (d * 86400 + h * 3600 + m * 60) * 1000;
    const endTime = Date.now() + durationMs;

    const newUp = {
        id: Date.now(),
        accId: accId,
        itemName: name,
        endTime: endTime,
        notified: false,
        sound: soundFile // Sound path save kar liya
    };

    upgrades.push(newUp);
    save();
    render();
    if (Notification.permission !== 'granted') Notification.requestPermission();
}

function render() {
    const list = document.getElementById('upgrades-list');
    if(!list) return;
    list.innerHTML = '';

    upgrades.sort((a, b) => a.endTime - b.endTime).forEach(up => {
        const acc = ACCOUNTS.find(a => a.id == up.accId);
        const timeLeft = up.endTime - Date.now();
        const isDone = timeLeft <= 0;

        if (isDone && !up.notified) {
            triggerAlarm(up.itemName, acc.name, up.sound); // Sound path bheja
            up.notified = true;
            save();
        }

        list.innerHTML += `
            <div class="card ${isDone ? 'completed' : ''}" style="border-color:${isDone?'var(--success)':'#30363d'}">
                <i class="fas fa-trash" style="position:absolute; top:15px; right:15px; color:var(--danger); cursor:pointer;" onclick="deleteUpgrade(${up.id})"></i>
                <span style="font-size:0.7rem; color:var(--text-dim)">${acc.name}</span>
                <div style="font-family:'Rajdhani'; font-weight:bold; font-size:1.2rem; margin:5px 0;">${up.itemName}</div>
                <div style="font-size:2.5rem; font-family:'Rajdhani'; font-weight:800; color:${isDone?'var(--success)':'var(--cyan)'}">
                    ${isDone ? "READY!" : formatTime(timeLeft)}
                </div>
                
                <button class="btn btn-p" style="width:100%; margin-top:15px; height:45px;" onclick="window.open('https://link.clashofclans.com/en?action=OpenPlayerProfile&tag=${acc.tag}', '_blank')">
                    OPEN ACCOUNT
                </button>
            </div>
        `;
    });
}

function formatTime(ms) {
    let s = Math.floor(ms / 1000);
    let d = Math.floor(s / 86400); s %= 86400;
    let h = Math.floor(s / 3600); s %= 3600;
    let m = Math.floor(s / 60);
    let sec = s % 60;
    return `${d}d ${h}h ${m}m ${sec}s`;
}

function triggerAlarm(item, acc, soundPath) {
    // Custom sound play karein
    const audio = new Audio(soundPath || 'assets/alarm.mp3');
    audio.play().catch(e => console.log("Sound play failed: Interaction required."));

    if (window.Notification && Notification.permission === 'granted') {
        new Notification("Upgrade Finished! ✅", {
            body: `${acc}: ${item} complete ho gaya!`,
            icon: "https://cdn-icons-png.flaticon.com/512/3522/3522030.png"
        });
    } else {
        alert(`${acc}: ${item} Ready!`);
    }
}

function deleteUpgrade(id) {
    upgrades = upgrades.filter(u => u.id !== id);
    save();
    render();
}

function save() { localStorage.setItem('coc_upgrades', JSON.stringify(upgrades)); }

setInterval(render, 1000);
render();