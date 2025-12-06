// Sample guest data - Replace with your actual guest list
const guests = [
    { name: "Ahmed Ali", table: 1 },
    { name: "Amina Khan", table: 1 },
    { name: "Bilal Ahmed", table: 2 },
    { name: "Ayesha Siddiqui", table: 1 },
    { name: "Fatima Hassan", table: 3 },
    { name: "Hassan Ibrahim", table: 2 },
    { name: "Zainab Malik", table: 3 },
    { name: "Omar Farooq", table: 4 },
    { name: "Khadija Rahman", table: 4 },
    { name: "Ibrahim Yusuf", table: 5 },
    { name: "Maryam Ahmed", table: 5 },
    { name: "Yusuf Abdullah", table: 6 },
    { name: "Noor Fatima", table: 6 },
    { name: "Ali Hassan", table: 7 },
    { name: "Sara Khan", table: 7 },
    { name: "Mohammed Iqbal", table: 8 },
    { name: "Layla Ahmed", table: 8 },
    { name: "Tariq Mahmood", table: 9 },
    { name: "Hiba Rashid", table: 9 },
    { name: "Usman Malik", table: 10 },
    { name: "Rabia Naveed", table: 10 },
    { name: "Daniyal Sheikh", table: 11 },
    { name: "Eman Zahra", table: 11 },
    { name: "Junaid Siddiqui", table: 12 },
    { name: "Ashna Khan", table: 12 },
    { name: "Khalid Anwar", table: 13 },
    { name: "Nadia Farhan", table: 13 },
    { name: "Samir Abbas", table: 14 },
    { name: "Iqra Hussain", table: 14 },
    { name: "Rashid Ali", table: 15 },
    { name: "Warda Saleem", table: 15 },
];

// Generate additional guests to reach 50 tables
const additionalNames = [
    "Faisal", "Hina", "Imran", "Javeria", "Kashif", "Lubna", "Nabeel", "Qasim",
    "Rehan", "Sana", "Talha", "Very", "Xavier", "Gul", "Pervez"
];
const surnames = ["Ahmed", "Khan", "Malik", "Hassan", "Ali", "Rahman", "Siddiqui", "Farooq"];

for (let i = 16; i <= 50; i++) {
    const firstName = additionalNames[Math.floor(Math.random() * additionalNames.length)];
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    guests.push({ name: `${firstName} ${surname} ${i}`, table: i });
    guests.push({ name: `Guest ${i}A`, table: i });
}

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchResult = document.getElementById('searchResult');

searchInput.addEventListener('input', function() {
    const searchTerm = this.value.trim().toLowerCase();

    if (searchTerm === '') {
        searchResult.classList.remove('show');
        return;
    }

    const found = guests.find(guest =>
        guest.name.toLowerCase().includes(searchTerm)
    );

    if (found) {
        searchResult.innerHTML = `
                    <div class="result-name">${found.name}</div>
                    <div class="result-table">Table ${found.table}</div>
                `;
        searchResult.classList.add('show');
    } else {
        searchResult.innerHTML = '<div class="no-result">Guest not found</div>';
        searchResult.classList.add('show');
    }
});

// Generate Name Filter Content
function generateNameContent() {
    const nameContent = document.getElementById('nameContent');
    const sortedGuests = [...guests].sort((a, b) => a.name.localeCompare(b.name));

    const groupedByLetter = {};
    sortedGuests.forEach(guest => {
        const firstLetter = guest.name[0].toUpperCase();
        if (!groupedByLetter[firstLetter]) {
            groupedByLetter[firstLetter] = [];
        }
        groupedByLetter[firstLetter].push(guest);
    });

    let html = '';
    Object.keys(groupedByLetter).sort().forEach(letter => {
        html += `
                    <div class="alphabet-section">
                        <div class="section-header">${letter}</div>
                        ${groupedByLetter[letter].map(guest => `
                            <div class="guest-item">
                                <span class="guest-name">${guest.name}</span>
                                <span class="table-number">Table ${guest.table}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
    });

    nameContent.innerHTML = html;
}

// Generate Table Filter Content
function generateTableContent() {
    const tableContent = document.getElementById('tableContent');

    const groupedByTable = {};
    guests.forEach(guest => {
        if (!groupedByTable[guest.table]) {
            groupedByTable[guest.table] = [];
        }
        groupedByTable[guest.table].push(guest);
    });

    let html = '';
    for (let i = 1; i <= 50; i++) {
        const tableGuests = groupedByTable[i] || [];
        html += `
                    <div class="table-section">
                        <div class="section-header">Table ${i}</div>
                        <div class="table-guests">
                            ${tableGuests.length > 0
            ? tableGuests.map(guest => `
                                    <div class="table-guest-name">${guest.name}</div>
                                `).join('')
            : '<div class="table-guest-name" style="color: #a88b98; font-style: italic;">No guests assigned</div>'
        }
                        </div>
                    </div>
                `;
    }

    tableContent.innerHTML = html;
}

// Tab switching
function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    const nameContent = document.getElementById('nameContent');
    const tableContent = document.getElementById('tableContent');

    tabs.forEach(t => t.classList.remove('active'));

    if (tab === 'name') {
        tabs[0].classList.add('active');
        nameContent.classList.add('active');
        tableContent.classList.remove('active');
    } else {
        tabs[1].classList.add('active');
        tableContent.classList.add('active');
        nameContent.classList.remove('active');
    }
}

// Initialize content on page load
generateNameContent();
generateTableContent();