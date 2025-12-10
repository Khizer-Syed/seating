// routes/guests.js
import express from 'express';
import Guest from '../models/Guest.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/guests - Get all guests
router.get('/', async (req, res) => {
    try {
        const { search, table, assigned } = req.query;
        let query = {};

        // Search by name
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'extraGuests.name': { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by table
        if (table) {
            query.tableNumber = parseInt(table);
        }

        if (assigned === 'true') {
            query.tableNumber = { $ne: null };
        }
        const guests = await Guest.find(query).sort({ name: 1 }).collation({ locale: 'en', strength: 2 });
        res.json(guests);
    } catch (error) {
        console.error('Error fetching guests:', error);
        res.status(500).json({ error: 'Failed to fetch guests' });
    }
});

// GET /api/guests/:id - Get single guest
router.get('/:id', async (req, res) => {
    try {
        const guest = await Guest.findById(req.params.id);
        if (!guest) {
            return res.status(404).json({ error: 'Guest not found' });
        }
        res.json(guest);
    } catch (error) {
        console.error('Error fetching guest:', error);
        res.status(500).json({ error: 'Failed to fetch guest' });
    }
});

// POST /api/guests - Add single guest
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, tableNumber, email, phone, extraGuests, extraGuestsCount } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        if (tableNumber && tableNumber < 1 || tableNumber > 75) {
            return res.status(400).json({ error: 'Table number must be between 1 and 75' });
        }

        if (tableNumber) {
            const assignedGuestsAtTable = await Guest.find({ tableNumber });
            const totalSeatsAtTable = assignedGuestsAtTable.reduce((sum, guest) => {
                return sum + 1 + (guest.extraGuests?.length || 0) + (guest.extraGuestsCount || 0);
            }, 0);
            if (totalSeatsAtTable >= 10) {
                return res.status(400).json({ error: 'No seats left at this table' });
            }

            if ((totalSeatsAtTable + 1 + (extraGuestsCount || 0) + (extraGuests.length || 0)) > 10) {
                return res.status(400).json({ error: 'Adding this guest exceeds table capacity.' });
            }
        }

        // Create new guest
        const guest = new Guest({
            name,
            tableNumber,
            email,
            phone,
            extraGuests: extraGuests || [],
            extraGuestsCount: extraGuestsCount || 0
        });

        await guest.save();
        res.status(201).json(guest);
    } catch (error) {
        console.error('Error creating guest:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to create guest' });
    }
});

// PUT /api/guests/:id - Update guest
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { name, tableNumber, email, phone, extraGuests, extraGuestsCount } = req.body;

        // Validation
        if (tableNumber && (tableNumber < 1 || tableNumber > 75)) {
            return res.status(400).json({ error: 'Table number must be between 1 and 75' });
        }

        const updateData = {
            updatedAt: Date.now()
        };

        if (name) updateData.name = name;
        if (tableNumber) updateData.tableNumber = tableNumber;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (extraGuests !== undefined) updateData.extraGuests = extraGuests;
        if (extraGuestsCount !== undefined) updateData.extraGuestsCount = extraGuestsCount;

        const guest = await Guest.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!guest) {
            return res.status(404).json({ error: 'Guest not found' });
        }

        res.json(guest);
    } catch (error) {
        console.error('Error updating guest:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to update guest' });
    }
});

router.put('/removeFromTable/:id', authenticateToken, async (req, res) => {
    try {

        const updateData = {
            updatedAt: Date.now(),
            tableNumber: null
        };

        const guest = await Guest.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!guest) {
            return res.status(404).json({ error: 'Guest not found' });
        }

        res.json(guest);
    } catch (error) {
        console.error('Error removing guest from table:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to update guest' });
    }
});

// DELETE /api/guests/:id - Delete guest
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const guest = await Guest.findByIdAndDelete(req.params.id);

        if (!guest) {
            return res.status(404).json({ error: 'Guest not found' });
        }

        res.json({ message: 'Guest deleted successfully', guest });
    } catch (error) {
        console.error('Error deleting guest:', error);
        res.status(500).json({ error: 'Failed to delete guest' });
    }
});

// POST /api/guests/bulk - Bulk upload guests
router.post('/bulk', authenticateToken, async (req, res) => {
    try {
        const guestsData = req.body;

        if (!Array.isArray(guestsData) || guestsData.length === 0) {
            return res.status(400).json({ error: 'Invalid data format. Expected an array of guests.' });
        }

        // Validate all guests before inserting
        const validGuests = [];
        const errors = [];

        for (let i = 0; i < guestsData.length; i++) {
            const guestData = guestsData[i];

            if (!guestData.name || !guestData.tableNumber) {
                errors.push(`Row ${i + 1}: Name and table number are required`);
                continue;
            }

            if (guestData.tableNumber < 1 || guestData.tableNumber > 75) {
                errors.push(`Row ${i + 1}: Table number must be between 1 and 75`);
                continue;
            }

            validGuests.push({
                name: guestData.name,
                tableNumber: guestData.tableNumber,
                email: guestData.email || undefined,
                phone: guestData.phone || undefined,
                extraGuests: guestData.extraGuests || [],
                extraGuestsCount: guestData.extraGuestsCount || 0
            });
        }

        if (validGuests.length === 0) {
            return res.status(400).json({
                error: 'No valid guests to insert',
                errors
            });
        }

        // Insert all valid guests
        const insertedGuests = await Guest.insertMany(validGuests, { ordered: false });

        res.status(201).json({
            message: `Successfully uploaded ${insertedGuests.length} guests`,
            inserted: insertedGuests.length,
            failed: errors.length,
            errors: errors.length > 0 ? errors : undefined,
            guests: insertedGuests
        });
    } catch (error) {
        console.error('Error bulk uploading guests:', error);
        res.status(500).json({ error: 'Failed to bulk upload guests' });
    }
});

// GET /api/guests/table/:tableNumber - Get all guests at a specific table
router.get('/table/:tableNumber', authenticateToken, async (req, res) => {
    try {
        const tableNumber = parseInt(req.params.tableNumber);

        if (tableNumber < 1 || tableNumber > 75) {
            return res.status(400).json({ error: 'Table number must be between 1 and 75' });
        }

        const guests = await Guest.find({ tableNumber }).sort({ name: 1 });

        // Calculate total seats occupied
        const totalSeats = guests.reduce((sum, guest) => {
            return sum + guest.totalPartySize;
        }, 0);

        res.json({
            tableNumber,
            guests,
            totalSeats,
            guestCount: guests.length
        });
    } catch (error) {
        console.error('Error fetching table guests:', error);
        res.status(500).json({ error: 'Failed to fetch table guests' });
    }
});

export default router;