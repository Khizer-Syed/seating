let allGuests = [];
let draggedElement = null;
let draggedGuestData = null;
let zoomScale = 1;
let extraGuestsCounter = 0;
let editingGuestId = null;
let tableCapacities = {};
// Table positions
const tablePositions = {
    32: {x: 80, y: 150}, 31: {x: 160, y: 150}, 16: {x: 240, y: 150}, 15: {x: 320, y: 150},
    33: {x: 80, y: 230}, 30: {x: 160, y: 230}, 17: {x: 240, y: 230}, 14: {x: 320, y: 230},
    34: {x: 80, y: 310}, 29: {x: 160, y: 310}, 18: {x: 240, y: 310}, 13: {x: 320, y: 310},
    35: {x: 80, y: 390}, 28: {x: 160, y: 390}, 19: {x: 240, y: 390}, 12: {x: 320, y: 390},
    36: {x: 80, y: 470}, 27: {x: 160, y: 470}, 20: {x: 240, y: 470}, 11: {x: 320, y: 470},
    37: {x: 80, y: 550}, 26: {x: 160, y: 550}, 21: {x: 240, y: 550}, 10: {x: 320, y: 550},
    38: {x: 80, y: 630}, 25: {x: 160, y: 630}, 22: {x: 240, y: 630}, 9: {x: 320, y: 630},
    39: {x: 80, y: 710}, 24: {x: 160, y: 710}, 23: {x: 240, y: 710}, 8: {x: 320, y: 710},
    2: {x: 420, y: 280}, 3: {x: 420, y: 350}, 4: {x: 420, y: 420}, 5: {x: 420, y: 490},
    6: {x: 420, y: 560}, 7: {x: 420, y: 630},
    1: {x: 720, y: 280}, 40: {x: 720, y: 350}, 41: {x: 720, y: 420}, 42: {x: 720, y: 490},
    43: {x: 720, y: 560}, 44: {x: 720, y: 630},
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

function getExtraGuests(guest = {}) {
    const extraGuests = [];
    const entries = document.querySelectorAll('.extra-guest-entry');
    entries.forEach(entry => {
        const name = entry.querySelector('.extra-guest-name').value.trim();
        if (name) {
            extraGuests.push({ name, response: guest?.response });
        }
    });
    return extraGuests;
}

function clearExtraGuestFields() {
    document.getElementById('extraGuestsList').innerHTML = '';
    extraGuestsCounter = 0;
}

function initializeFloorPlan() {
    const floorPlan = document.getElementById('floorPlan');

    Object.entries(tablePositions).forEach(([tableNum, pos]) => {
        const isRectangular = [1, 2, 3, 4, 5, 6, 7, 40, 41, 42, 43, 44].includes(parseInt(tableNum));

        const table = document.createElement('div');
        table.className = isRectangular ? 'table-rect' : 'table-circle';
        table.id = `table-${tableNum}`;
        table.dataset.tableNumber = tableNum;
        table.style.left = `${pos.x}px`;
        table.style.top = `${pos.y}px`;
        table.innerHTML = `
                    <div class="table-number">${tableNum}</div>
                    <div class="table-capacity">0/10</div>
                `;

        // Make tables drop targets
        table.addEventListener('dragover', handleDragOver);
        table.addEventListener('drop', handleDrop);
        table.addEventListener('dragleave', handleDragLeave);
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

// Calculate group size
function calculateGroupSize(guest) {
    let size = 1; // Primary guest
    if (guest.extraGuests) {
        size += guest.extraGuests.length;
    }
    if (guest.extraGuestsCount) {
        size += guest.extraGuestsCount;
    }
    return size;
}

// Load unassigned guests
async function loadUnassignedGuests() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin/login';
        return;
    }

    try {
        const response = await fetch('/api/guests', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
            return;
        }

        if (response.ok) {
            allGuests = await response.json();
            renderUnassignedGuests();
            updateTableCapacities();
        }
    } catch (error) {
        console.error('Error loading guests:', error);
        showNotification('Failed to load guests', 'error');
    }
}

// Render unassigned guests
function renderUnassignedGuests() {
    const unassignedList = document.getElementById('unassignedList');
    const unassignedGuests = allGuests.filter(g => !g.tableNumber);

    document.getElementById('unassignedCount').textContent =
        `${unassignedGuests.length} groups (${unassignedGuests.reduce((sum, g) => sum + calculateGroupSize(g), 0)} people)`;

    unassignedList.innerHTML = unassignedGuests.map(guest => {
        const groupSize = calculateGroupSize(guest);
        return `
                    <div class="guest-group" draggable="true" data-guest-id="${guest._id}">
                        <div class="primary-guest">
                            <span class="edit-guest" onclick="editGuest('${guest._id}')">${guest.name} <span title="Edit Guest">✎</span></span>
                            <span class="group-size">${groupSize} ${groupSize === 1 ? 'person' : 'people'}</span>
                        </div>
                        ${guest.extraGuests && guest.extraGuests.length > 0 ? `
                            <div class="extra-guests">
                                ${guest.extraGuests.map((extra) => `
                                    <div class="extra-guest-item">
                                        ${extra.name}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        ${guest.extraGuestsCount > 0 ? `
                            <div class="extra-guests">
                                <div class="extra-guest-item">+ ${guest.extraGuestsCount} more</div>
                            </div>
                        ` : ''}
                    </div>
                `;
    }).join('');

    // Add drag event listeners
    document.querySelectorAll('.guest-group').forEach(el => {
        el.addEventListener('dragstart', handleDragStart);
        el.addEventListener('dragend', handleDragEnd);
    });
}

function editGuest(id) {
    const index = allGuests.findIndex(g => g._id === id);
    if (index !== -1) {
        setTimeout(() => populateEditForm(allGuests[index]), 100);
    }
}

function populateEditForm(guest) {
    editingGuestId = guest._id;
    document.getElementById('modalTitle').textContent = 'Edit Guest';
    document.getElementById('guestName').value = guest.name;
    document.getElementById('tableNumber').value = guest.tableNumber || '';
    document.getElementById('guestEmail').value = guest.email || '';
    document.getElementById('guestPhone').value = guest.phone || '';
    document.getElementById('extraGuestsCount').value = guest.extraGuestsCount || 0;

    // Clear and populate extra guests
    clearExtraGuestFields();
    if (guest.extraGuests && guest.extraGuests.length > 0) {
        guest.extraGuests.forEach(extra => {
            addExtraGuestField(extra.name);
        });
    }
    const deleteButton = document.getElementById('deleteButton');
    deleteButton.onclick = () => removeGuest(guest._id);
    deleteButton.classList.add('show');
    document.getElementById('submitBtn').textContent = 'Update Guest';
    document.getElementById('guestModal').classList.add('show');
}


// Drag handlers
function handleDragStart(e) {
    draggedElement = e.target;
    const guestId = e.target.dataset.guestId;

    const guest = allGuests.find(g => g._id === guestId);

    draggedGuestData = {
        guestId: guestId,
        guest: guest,
        groupSize: calculateGroupSize(guest)
    };

    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedElement = null;
    draggedGuestData = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drop-target');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drop-target');
}

async function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drop-target');

    const tableNumber = parseInt(e.currentTarget.dataset.tableNumber);

    if (!draggedGuestData) return;

    // Assign table
    await assignTable(draggedGuestData, tableNumber);
}

// Assign table via API
async function assignTable(dragData, tableNumber) {
    const token = localStorage.getItem('adminToken');
    const existingCapacity = tableCapacities[tableNumber];
    const guestsToAdd = dragData.groupSize;

    if (existingCapacity + guestsToAdd > 10) {
        showNotification(`Cannot assign to Table ${tableNumber}: capacity exceeded`, 'error');
        return;
    }
    try {

        const response = await fetch(`/api/guests/${dragData.guestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                tableNumber: tableNumber,
                extraGuests: dragData.guest.extraGuests?.map(e => ({
                    ...e,
                    tableNumber: tableNumber
                }))
            })
        });

        if (response.ok) {
            showNotification(`${dragData.guest.name} assigned to Table ${tableNumber}`);
            await loadUnassignedGuests();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to assign table', 'error');
        }
    } catch (error) {
        console.error('Error assigning table:', error);
        showNotification('Failed to assign table', 'error');
    }
}


// Update table capacities
function updateTableCapacities() {
    // Calculate capacity for each table
    tableCapacities = {};

    allGuests.forEach(guest => {
        if (guest.tableNumber) {
            tableCapacities[guest.tableNumber] = (tableCapacities[guest.tableNumber] || 0) + 1;

            if (guest.extraGuestsCount) {
                tableCapacities[guest.tableNumber] += guest.extraGuestsCount;
            }
            if (guest.extraGuests) {
                guest.extraGuests.forEach(extra => {
                    tableCapacities[extra.tableNumber] = (tableCapacities[extra.tableNumber] || 0) + 1;

                });
            }
        }
    });

    // Update UI
    for (let i = 1; i <= 75; i++) {
        const table = document.getElementById(`table-${i}`);
        if (table) {
            const capacity = tableCapacities[i] || 0;
            table.querySelector('.table-capacity').textContent = `${capacity}/10`;

            if (capacity > 0) {
                table.classList.add('occupied');
            } else {
                table.classList.remove('occupied');
            }

            if (capacity === 10) {
                table.classList.add('full');
                table.classList.remove('occupied');
            } else if (capacity > 0 && capacity < 10) {
                table.classList.add('occupied');
                table.classList.remove('full');
            } else {
                table.classList.remove('occupied');
                table.classList.remove('full');
            }
        }
    }
    updateStats();
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function updateStats() {
    document.getElementById('totalGuests').textContent = allGuests.reduce((sum, g) => {
        return sum + 1 + (g.extraGuests ? g.extraGuests.length : 0) + (g.extraGuestsCount || 0);
    }, 0);
    const occupiedTables = allGuests.filter(g => g.tableNumber).map(g => g.tableNumber);
    document.getElementById('occupiedTables').textContent = new Set(occupiedTables).size;
}

function showTableDetails(tableNumber) {
    const tableGuests = allGuests.filter(g => g.tableNumber === tableNumber);
    document.getElementById('tableModalTitle').textContent = `Table ${tableNumber}`;

    // Calculate total seats
    let totalSeats = 0;
    tableGuests.forEach(guest => {
        totalSeats += 1; // Main guest
        totalSeats += (guest.extraGuests || []).length;
        totalSeats += (guest.extraGuestsCount || 0);
    });

    document.getElementById('tableModalStats').textContent =
        `${totalSeats} total seat${totalSeats !== 1 ? 's' : ''}`;

    const guestList = document.getElementById('tableGuestList');
    if (tableGuests.length === 0) {
        guestList.innerHTML = '<p style="text-align: center; color: #8a7a8a;">No guests assigned to this table</p>';
    } else {
        guestList.innerHTML = tableGuests.map(guest => {
            let extraInfo = '';
            if (guest.extraGuests && guest.extraGuests.length > 0) {
                guest.extraGuests.forEach(extra => {
                    extraInfo += `<div class="extra-guest-item"><div>${extra.name}</div></div>`;
                });
            }
            if (guest.extraGuestsCount > 0) {
                extraInfo += `<div class="extra-guest-item"><div>+ ${guest.extraGuestsCount} MORE}</div>`;
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
                            <button class="btn-remove" onclick="removeGuestFromTable('${guest._id}')">VACATE</button>
                        </div>
                    </div>
                    ${extraInfo}
                </div>
            `;
        }).join('');
    }

    document.getElementById('tableModal').classList.add('show');
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
                guests = allGuests.filter(g => g._id !== id);
                await loadUnassignedGuests();
                closeModal();
            }
        } catch (error) {
            console.error('Error removing guest:', error);
            showError('Failed to remove guest. Please try again.');
        }
    }
}

async function removeGuestFromTable(id) {
    if (confirm('Are you sure you want to remove this guest?')) {
        const token = localStorage.getItem('adminToken');

        try {
            const response = await fetch(`/api/guests/removeFromTable/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({tableNumber: null})
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/login';
                return;
            }

            if (response.ok) {
                const savedGuest = await response.json();

                if (id) {
                    // Update guest in array
                    const index = allGuests.findIndex(g => g._id === id);
                    if (index !== -1) {
                        allGuests[index] = savedGuest;
                    } else {
                        allGuests.push(savedGuest);
                    }
                }
                // Refresh the table modal if it's open
                const modalTitle = document.getElementById('tableModalTitle').textContent;
                const tableNumber = parseInt(modalTitle.split(' ')[1]);
                showTableDetails(tableNumber);
                await loadUnassignedGuests();
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
    const editingGuestIndex = allGuests.findIndex(g => g._id === editingGuestId);
    const guestData = {
        name: document.getElementById('guestName').value,
        tableNumber: parseInt(document.getElementById('tableNumber').value) || undefined,
        email: document.getElementById('guestEmail').value || undefined,
        phone: document.getElementById('guestPhone').value || undefined,
        extraGuests: getExtraGuests(editingGuestId ? allGuests[editingGuestIndex] : null),
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
                const index = allGuests.findIndex(g => g._id === editingGuestId);
                if (index !== -1) {
                    allGuests[index] = savedGuest;
                }
            } else {
                // Add new guest to array
                allGuests.push(savedGuest);
            }

            await loadUnassignedGuests();
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

function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
}



// Initialize
initializeFloorPlan();
loadUnassignedGuests();