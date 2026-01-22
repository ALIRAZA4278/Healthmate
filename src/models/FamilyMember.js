import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    relation: {
      type: String,
      required: [true, 'Relation is required'],
      trim: true,
      enum: {
        values: ['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Cousin', 'Other'],
        message: '{VALUE} is not a valid relation',
      },
    },
    color: {
      type: String,
      default: '#ec4899',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Please enter a valid hex color'],
    },
    customId: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
    },
    allergies: {
      type: String,
      maxlength: [500, 'Allergies text cannot exceed 500 characters'],
    },
    medicalConditions: {
      type: String,
      maxlength: [500, 'Medical conditions text cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient queries
familyMemberSchema.index({ userId: 1, name: 1 });

const FamilyMember = mongoose.models.FamilyMember || mongoose.model('FamilyMember', familyMemberSchema);

export default FamilyMember;
