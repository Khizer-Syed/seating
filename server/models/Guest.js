// models/Guest.js
import mongoose from 'mongoose';

const extraGuestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    tableNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 75
    }
}, { _id: false });

const guestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    tableNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 75
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        trim: true
    },
    extraGuests: [extraGuestSchema],
    extraGuestsCount: {
        type: Number,
        default: 0,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster searches
guestSchema.index({ name: 'text' });

// Virtual for total party size
guestSchema.virtual('totalPartySize').get(function() {
    return 1 + this.extraGuests.length + this.extraGuestsCount;
});

// Ensure virtuals are included in JSON
guestSchema.set('toJSON', { virtuals: true });
guestSchema.set('toObject', { virtuals: true });

export default mongoose.model('Guest', guestSchema);