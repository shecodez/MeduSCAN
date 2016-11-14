'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * PatientMedication Schema
 */
var PatientMedicationSchema = new Schema({
    _id: {
        type: Schema.ObjectId,
        ref: 'Medication'
    },
    given: {
        type: Boolean,
        default: false
    },
    schedule: {
        type: String,
        enum: ['Scheduled', 'PRN', 'Stat/1x', 'IV Fluid']
    },
    dose: { type: Number },
    //TODO: turn time into >> times: [{ type: Date }],
    time: { type:Date },
    frequency: {
        type: String,
        trim: true,
        default: ''
    },
    route: {
        type: String,
        trim: true,
        default: ''
    },
    directions: {
        type: String,
        trim: true,
        default: ''
    },
    triggerScenario: {
        type: Boolean,
        default: false
    },
    scenarioAlertMsg: {
        type: String,
        default: '',
        trim: true
    }
});

mongoose.model('PatientMedication', PatientMedicationSchema);

/**
 * Patient Schema
 */
var PatientSchema = new Schema({
    active: {
        type: Boolean,
        default: true
    },
    pID: {
        //unique: true,
        type: String,
        trim: true
    },

    avatar: {type: String},
    firstName: {
        type: String,
        default: '',
        required: 'Patient first name required',
        trim: true
    },
    lastName: {
        type: String,
        default: '',
        required: 'Patient last name required',
        trim: true
    },

    dob: { type: Date},

    gender: {
        type: String,
        enum: ['Male', 'Female']
    },
    pregnant: { type: Boolean },

    height: { type: Number },
    weight: { type: Number },

    alert: {
        allergy:        { type: Boolean, default: false },
        allergyDetails: { type: String, default: '', trim: true },
        dnr:            { type: Boolean, default: false },
        fallRisk:       { type: Boolean, default: false },
        latexAllergy:   { type: Boolean, default: false },
        restrictedExtremity: { type: Boolean, default: false },
        other:          { type: Boolean, default: false },
        otherDetails:   { type: String, default: '', trim: true }
    },
    scenarioTime: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },

    medications: [PatientMedicationSchema],

    updated: { type: Date },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Patient', PatientSchema);
