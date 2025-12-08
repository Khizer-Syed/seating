let guests = [];
let zoomScale = 1;
let extraGuestsCounter = 0;
let editingGuestId = null;

// Table positions matching the floor plan image
const tablePositions = {
    // Left section - 4 columns
    32: {x: 80, y: 150}, 31: {x: 160, y: 150}, 16: {x: 240, y: 150}, 15: {x: 320, y: 150},
    33: {x: 80, y: 230}, 30: {x: 160, y: 230}, 17: {x: 240, y: 230}, 14: {x: 320, y: 230},
    34: {x: 80, y: 310}, 29: {x: 160, y: 310}, 18: {x: 240, y: 310}, 13: {x: 320, y: 310},
    35: {x: 80, y: 390}, 28: {x: 160, y: 390}, 19: {x: 240, y: 390}, 12: {x: 320, y: 390},
    36: {x: 80, y: 470}, 27: {x: 160, y: 470}, 20: {x: 240, y: 470}, 11: {x: 320, y: 470},
    37: {x: 80, y: 550}, 26: {x: 160, y: 550}, 21: {x: 240, y: 550}, 10: {x: 320, y: 550},
    38: {x: 80, y: 630}, 25: {x: 160, y: 630}, 22: {x: 240, y: 630}, 9: {x: 320, y: 630},
    39: {x: 80, y: 710}, 24: {x: 160, y: 710}, 23: {x: 240, y: 710}, 8: {x: 320, y: 710},

    // Center-left (rectangular tables)
    2: {x: 420, y: 280}, 3: {x: 420, y: 350}, 4: {x: 420, y: 420}, 5: {x: 420, y: 490},
    6: {x: 420, y: 560}, 7: {x: 420, y: 630},

    // Center-right (rectangular tables)
    1: {x: 720, y: 280}, 40: {x: 720, y: 350}, 41: {x: 720, y: 420}, 42: {x: 720, y: 490},
    43: {x: 720, y: 560}, 44: {x: 720, y: 630},

    // Right section - 4 columns
    52: {x: 820, y: 150}, 53: {x: 900, y: 150}, 68: {x: 980, y: 150}, 69: {x: 1060, y: 150},
    51: {x: 820, y: 230}, 54: {x: 900, y: 230}, 67: {x: 980, y: 230}, 70: {x: 1060, y: 230},
    50: {x: 820, y: 310}, 55: {x: 900, y: 310}, 66: {x: 980, y: 310}, 71: {x: 1060, y: 310},
    49: {x: 820, y: 390}, 56: {x: 900, y: 390}, 65: {x: 980, y: 390}, 72: {x: 1060, y: 390},
    48: {x: 820, y: 470}, 57: {x: 900, y: 470}, 64: {x: 980, y: 470}, 73: {x: 1060, y: 470},
    47: {x: 820, y: 550}, 58: {x: 900, y: 550}, 63: {x: 980, y: 550}, 74: {x: 1060, y: 550},
    46: {x: 820, y: 630}, 59: {x: 900, y: 630}, 62: {x: 980, y: 630}, 75: {x: 1060, y: 630},
    45: {x: 820, y: 710}, 60: {x: 900, y: 710}, 61: {x: 980, y: 710},
};

// Show error banner
function showError(message) {
    const errorBanner = document.getElementById('errorBanner');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorBanner.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Hide error banner
function hideError() {
    const errorBanner = document.getElementById('errorBanner');
    errorBanner.style.display = 'none';
}

// Add extra guest field
function addExtraGuestField(name = '') {
    extraGuestsCounter++;
    const container = document.getElementById('extraGuestsList');
    const div = document.createElement('div');
    div.className = 'extra-guest-entry';
    div.id = `extra-guest-${extraGuestsCounter}`;
    div.innerHTML = `
        <div style="flex: 1;">
            <input type="text" placeholder="Guest name" value="${name}" class="extra-guest-name" style="width: 100%; padding: 12px; border: 2px solid #d4b8c8; border-radius: 8px; font-family: 'Cinzel', serif; font-size: 14px; outline: none;">
        </div>
        <button type="button" class="btn-remove-extra" onclick="removeExtraGuestField(${extraGuestsCounter})">×</button>
    `;
    container.appendChild(div);
}

function removeExtraGuestField(id) {
    const element = document.getElementById(`extra-guest-${id}`);
    if (element) {
        element.remove();
    }
}

function getExtraGuests() {
    const extraGuests = [];
    const entries = document.querySelectorAll('.extra-guest-entry');
    entries.forEach(entry => {
        const name = entry.querySelector('.extra-guest-name').value.trim();
        if (name) {
            extraGuests.push(name);
        }
    });
    return extraGuests;
}

function clearExtraGuestFields() {
    document.getElementById('extraGuestsList').innerHTML = '';
    extraGuestsCounter = 0;
}

function populateEditForm(guest) {
    editingGuestId = guest._id;
    document.getElementById('modalTitle').textContent = 'Edit Guest';
    document.getElementById('guestName').value = guest.name;
    document.getElementById('tableNumber').value = guest.tableNumber;
    document.getElementById('guestEmail').value = guest.email || '';
    document.getElementById('guestPhone').value = guest.phone || '';
    document.getElementById('extraGuestsCount').value = guest.extraGuestsCount || 0;

    // Clear and populate extra guests
    clearExtraGuestFields();
    if (guest.extraGuests && guest.extraGuests.length > 0) {
        guest.extraGuests.forEach(extra => {
            addExtraGuestField(extra);
        });
    }

    document.getElementById('submitBtn').textContent = 'Update Guest';
    document.getElementById('guestModal').classList.add('show');
}

function initializeFloorPlan() {
    const floorPlan = document.getElementById('floorPlan');

    // Create all tables based on positions
    Object.entries(tablePositions).forEach(([tableNum, pos]) => {
        const isRectangular = [1, 2, 3, 4, 5, 6, 7, 40, 41, 42, 43, 44].includes(parseInt(tableNum));

        const table = document.createElement('div');
        table.className = isRectangular ? 'table-rect' : 'table-circle';
        table.id = `table-${tableNum}`;
        table.style.left = `${pos.x}px`;
        table.style.top = `${pos.y}px`;
        table.innerHTML = `<div class="table-number">${tableNum}</div>`;
        table.onclick = () => showTableDetails(parseInt(tableNum));

        floorPlan.appendChild(table);
    });
}

function zoomIn() {
    if (zoomScale < 1.5) {
        zoomScale += 0.1;
        updateZoom();
    }
}

function zoomOut() {
    if (zoomScale > 0.5) {
        zoomScale -= 0.1;
        updateZoom();
    }
}

function updateZoom() {
    const floorPlan = document.getElementById('floorPlan');
    floorPlan.style.transform = `scale(${zoomScale})`;
    document.getElementById('zoomLevel').textContent = `${Math.round(zoomScale * 100)}%`;
}

function updateTableDisplay() {
    // Count guests per table and total seats
    const tableCounts = {};
    const tableSeats = {};

    guests.forEach(guest => {
        tableCounts[guest.tableNumber] = (tableCounts[guest.tableNumber] || 0) + 1;

        // Calculate total seats (main guest + extras)
        let seats = 1; // Main guest
        seats += (guest.extraGuests || []).length;
        seats += (guest.extraGuestsCount || 0);
        tableSeats[guest.tableNumber] = (tableSeats[guest.tableNumber] || 0) + seats;
    });

    // Update each table on the floor plan
    for (let i = 1; i <= 75; i++) {
        const tableElement = document.getElementById(`table-${i}`);
        if (tableElement) {
            const guestCount = tableCounts[i] || 0;
            const seatCount = tableSeats[i] || 0;
            if (seatCount === 10) {
                tableElement.classList.add('full');
                tableElement.classList.remove('occupied');
            } else if (guestCount > 0 && seatCount < 10) {
                tableElement.classList.add('occupied');
                tableElement.classList.remove('full');
            } else {
                tableElement.classList.remove('occupied');
                tableElement.classList.remove('full');
            }
        }
    }

    updateStats();
}

function updateStats() {
    document.getElementById('totalGuests').textContent = guests.reduce((sum, g) => {
        return sum + 1 + (g.extraGuests ? g.extraGuests.length : 0) + (g.extraGuestsCount || 0);
    }, 0);
    const occupiedTables = new Set(guests.map(g => g.tableNumber)).size;
    document.getElementById('occupiedTables').textContent = occupiedTables;
}

function showTableDetails(tableNumber) {
    const tableGuests = guests.filter(g => g.tableNumber === tableNumber);
    document.getElementById('tableModalTitle').textContent = `Table ${tableNumber}`;

    // Calculate total seats
    let totalSeats = 0;
    tableGuests.forEach(guest => {
        totalSeats += 1; // Main guest
        totalSeats += (guest.extraGuests || []).length;
        totalSeats += (guest.extraGuestsCount || 0);
    });

    document.getElementById('tableModalStats').textContent =
        `${tableGuests.length} main guest${tableGuests.length !== 1 ? 's' : ''} • ${totalSeats} total seat${totalSeats !== 1 ? 's' : ''}`;

    const guestList = document.getElementById('tableGuestList');
    if (tableGuests.length === 0) {
        guestList.innerHTML = '<p style="text-align: center; color: #8a7a8a;">No guests assigned to this table</p>';
    } else {
        guestList.innerHTML = tableGuests.map(guest => {
            let extraInfo = '';
            if (guest.extraGuests && guest.extraGuests.length > 0) {
                extraInfo += `<div style="margin-left: 20px; margin-top: 5px; font-size: 12px; color: #8a7a8a;">`;
                guest.extraGuests.forEach(extra => {
                    extraInfo += `<div>+ ${extra}</div>`;
                });
                extraInfo += `</div>`;
            }
            if (guest.extraGuestsCount > 0) {
                extraInfo += `<div style="margin-left: 20px; margin-top: 5px; font-size: 12px; color: #8a7a8a;">+ ${guest.extraGuestsCount} unnamed guest${guest.extraGuestsCount !== 1 ? 's' : ''}</div>`;
            }

            return `
                <div class="guest-item" style="display: block;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span class="guest-name">${guest.name}</span>
                            ${guest.email ? `<div style="font-size: 11px; color: #a88b98; margin-top: 3px;">${guest.email}</div>` : ''}
                            ${guest.phone ? `<div style="font-size: 11px; color: #a88b98;">${guest.phone}</div>` : ''}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-edit" onclick='editGuestFromTable(${JSON.stringify(guest).replace(/'/g, "&#39;")})'>Edit</button>
                            <button class="btn-remove" onclick="removeGuest('${guest._id}')">Remove</button>
                        </div>
                    </div>
                    ${extraInfo}
                </div>
            `;
        }).join('');
    }

    document.getElementById('tableModal').classList.add('show');
}

function editGuestFromTable(guest) {
    closeTableModal();
    setTimeout(() => populateEditForm(guest), 100);
}

function closeTableModal() {
    document.getElementById('tableModal').classList.remove('show');
}

async function removeGuest(id) {
    if (confirm('Are you sure you want to remove this guest?')) {
        const token = localStorage.getItem('adminToken');

        try {
            const response = await fetch(`/api/guests/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/login';
                return;
            }

            if (response.ok) {
                guests = guests.filter(g => g._id !== id);
                updateTableDisplay();
                // Refresh the table modal if it's open
                const modalTitle = document.getElementById('tableModalTitle').textContent;
                const tableNumber = parseInt(modalTitle.split(' ')[1]);
                showTableDetails(tableNumber);
                updateTableDisplay();
            }
        } catch (error) {
            console.error('Error removing guest:', error);
            showError('Failed to remove guest. Please try again.');
        }
    }
}

function openAddModal() {
    editingGuestId = null;
    document.getElementById('modalTitle').textContent = 'Add Guest';
    document.getElementById('submitBtn').textContent = 'Add Guest';
    document.getElementById('guestForm').reset();
    clearExtraGuestFields();
    document.getElementById('extraGuestsCount').value = '0';
    hideError(); // Clear any previous errors
    document.getElementById('guestModal').classList.add('show');
}

function closeModal() {
    document.getElementById('guestModal').classList.remove('show');
    editingGuestId = null;
    hideError();
}

document.getElementById('guestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(); // Clear any previous errors

    const guestData = {
        name: document.getElementById('guestName').value,
        tableNumber: parseInt(document.getElementById('tableNumber').value),
        email: document.getElementById('guestEmail').value || undefined,
        phone: document.getElementById('guestPhone').value || undefined,
        extraGuests: getExtraGuests(),
        extraGuestsCount: parseInt(document.getElementById('extraGuestsCount').value) || 0
    };

    const token = localStorage.getItem('adminToken');

    try {
        let response;

        if (editingGuestId) {
            // Update existing guest
            response = await fetch(`/api/guests/${editingGuestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(guestData)
            });
        } else {
            // Create new guest
            response = await fetch('/api/guests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(guestData)
            });
        }

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
            return;
        }

        if (response.ok) {
            const savedGuest = await response.json();

            if (editingGuestId) {
                // Update guest in array
                const index = guests.findIndex(g => g._id === editingGuestId);
                if (index !== -1) {
                    guests[index] = savedGuest;
                }
            } else {
                // Add new guest to array
                guests.push(savedGuest);
            }

            updateTableDisplay();
            closeModal();
        } else {
            const error = await response.json();
            // Show error banner
            showError(error.error || 'Failed to save guest');
        }
    } catch (error) {
        console.error('Error saving guest:', error);
        showError('Failed to save guest. Please try again.');
    }
});

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            const newGuests = jsonData.map(row => ({
                name: row.name || row.Name || row.NAME,
                tableNumber: parseInt(row.tableNumber || row['Table Number'] || row.table || row.Table || row.TABLE),
                email: row.email || row.Email || row.EMAIL || undefined,
                phone: row.phone || row.Phone || row.PHONE || undefined,
                extraGuestsCount: parseInt(row.extraGuestsCount || row['Extra Guests'] || row.extras || 0) || 0
            }));

            const token = localStorage.getItem('adminToken');

            const response = await fetch('/api/guests/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newGuests)
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/login';
                return;
            }

            if (response.ok) {
                const result = await response.json();
                await loadGuests();
                alert(result.message + (result.errors ? `\n\nErrors:\n${result.errors.join('\n')}` : ''));
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to upload guests');
            }
        } catch (error) {
            console.error('Error processing file:', error);
            alert('Error processing file. Please ensure it has "name" and "tableNumber" columns.');
        }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
}

// Close modals when clicking outside
document.getElementById('guestModal').addEventListener('click', (e) => {
    if (e.target.id === 'guestModal') closeModal();
});

document.getElementById('tableModal').addEventListener('click', (e) => {
    if (e.target.id === 'tableModal') closeTableModal();
});

async function loadGuests() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin/login';
        return;
    }
    try {
        const response = await fetch('/api/guests');
        if (response.ok) {
            guests = await response.json();
            updateTableDisplay();
        }
    } catch (error) {
        console.error('Error loading guests:', error);
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
}

// Initialize
initializeFloorPlan();
loadGuests();