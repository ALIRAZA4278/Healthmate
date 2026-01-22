import mongoose from 'mongoose';

const vitalsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    bloodPressure: {
      systolic: {
        type: Number,
        min: [50, 'Systolic pressure cannot be less than 50'],
        max: [250, 'Systolic pressure cannot exceed 250'],
      },
      diastolic: {
        type: Number,
        min: [30, 'Diastolic pressure cannot be less than 30'],
        max: [150, 'Diastolic pressure cannot exceed 150'],
      },
    },
    bloodSugar: {
      type: Number,
      min: [20, 'Blood sugar cannot be less than 20'],
      max: [600, 'Blood sugar cannot exceed 600'],
    },
    weight: {
      type: Number,
      min: [1, 'Weight cannot be less than 1 kg'],
      max: [500, 'Weight cannot exceed 500 kg'],
    },
    heartRate: {
      type: Number,
      min: [30, 'Heart rate cannot be less than 30'],
      max: [220, 'Heart rate cannot exceed 220'],
    },
    temperature: {
      type: Number,
      min: [35, 'Temperature cannot be less than 35°C'],
      max: [42, 'Temperature cannot exceed 42°C'],
    },
    oxygenLevel: {
      type: Number,
      min: [70, 'Oxygen level cannot be less than 70%'],
      max: [100, 'Oxygen level cannot exceed 100%'],
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient queries
vitalsSchema.index({ userId: 1, date: -1 });
vitalsSchema.index({ familyMemberId: 1, date: -1 });

const Vitals = mongoose.models.Vitals || mongoose.model('Vitals', vitalsSchema);

export default Vitals;
