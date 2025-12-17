let guests = [];


// Search functionality
const searchInput = document.getElementById('searchInput');
const searchResult = document.getElementById('searchResult');

searchInput.addEventListener('input', function () {
    const searchTerm = this.value.trim().toLowerCase();

    if (searchTerm === '') {
        searchResult.classList.remove('show');
        return;
    }

    const guestsFound = [];

    for (const guest of guests) {
        const [firstName, middleName, lastName] = guest.name.toLowerCase().split(' ');
        if (firstName.startsWith(searchTerm) || (middleName && middleName.startsWith(searchTerm)) || (lastName && lastName.startsWith(searchTerm))) {
            guestsFound.push(guest);
        }
        if (guest.extraGuests && guest.extraGuests.length > 0) {
            for (const extra of guest.extraGuests) {
                const [extraFirstName, extraMiddleName, extraLastName] = extra.name.toLowerCase().split(' ');
                if (extraFirstName.startsWith(searchTerm) || (extraMiddleName && extraMiddleName.startsWith(searchTerm)) || (extraLastName && extraLastName.startsWith(searchTerm))) {
                    guestsFound.push({name: extra.name, tableNumber: guest.tableNumber});
                }
            }
        }
    }

    if (guestsFound.length > 0) {
        searchResult.innerHTML = guestsFound.map(found => `
                    <div class="result"><div class="result-name">${found.name}</div>
                    <div class="result-table">Table ${found.tableNumber}</div></div>
                `).join('');
        searchResult.classList.add('show');
    } else {
        searchResult.innerHTML = '<div class="no-result">Guest not found</div>';
        searchResult.classList.add('show');
    }
});

// Generate Name Filter Content
function generateNameContent() {
    const nameContent = document.getElementById('nameContent');
    let flattenedGuests = [];
    for (const guest of guests) {
        flattenedGuests.push({name: guest.name, tableNumber: guest.tableNumber});
        if (guest.extraGuests && guest.extraGuests.length > 0) {
            guest.extraGuests.forEach(extra => {
                flattenedGuests.push({...extra, tableNumber: guest.tableNumber});
            });
        }
        if (guest.extraGuestsCount && guest.extraGuestsCount > 0) {
            for (let i = 1; i <= guest.extraGuestsCount; i++) {
                flattenedGuests.push({name: `${guest.name} plus ${i}`, tableNumber: guest.tableNumber});
            }
        }
    }

    const groupedByLetter = {};
    flattenedGuests.forEach(guest => {
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
                                <span class="table-number">Table ${guest.tableNumber}</span>
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
        if (!groupedByTable[guest.tableNumber]) {
            groupedByTable[guest.tableNumber] = [];
        }
        groupedByTable[guest.tableNumber].push(guest);
    });

    let html = '';
    for (let i = 1; i <= 75; i++) {
        const tableGuests = groupedByTable[i] || [];
        let expandedGuests = [];
        tableGuests.forEach(guest => {
            expandedGuests.push({name: guest.name});
            if (guest.extraGuests && guest.extraGuests.length > 0) {
                guest.extraGuests.forEach(extra => {
                    expandedGuests.push({name: extra.name});
                });
            }
            if (guest.extraGuestsCount && guest.extraGuestsCount > 0) {
                for (let j = 1; j <= guest.extraGuestsCount; j++) {
                    expandedGuests.push({name: `${guest.name} plus ${j}`});
                }
            }
        });
        html += `
                    <div class="table-section">
                        <div class="section-header">Table ${i}</div>
                        <div class="table-guests">
                            ${expandedGuests.length > 0
            ? expandedGuests.map(guest => `
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

async function loadGuests() {
    try {
        const response = await fetch('/api/guests?assigned=true');
        if (response.ok) {
            guests = await response.json();
        }
    } catch (error) {
        console.error('Error loading guests:', error);
    }
}

// Initialize content on page load
loadGuests().then(() => {
    generateNameContent();
    generateTableContent();
});