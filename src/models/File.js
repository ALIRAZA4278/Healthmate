import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
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
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
      enum: {
        values: ['lab_report', 'CBC', 'prescription', 'x-ray', 'ultrasound', 'MRI', 'CT_Scan', 'ECG', 'blood_test', 'urine_test', 'other'],
        message: '{VALUE} is not a valid file type',
      },
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    testDate: {
      type: Date,
      required: [true, 'Test date is required'],
    },
    labHospital: {
      type: String,
      trim: true,
      maxlength: [100, 'Lab/Hospital name cannot exceed 100 characters'],
    },
    doctor: {
      type: String,
      trim: true,
      maxlength: [100, 'Doctor name cannot exceed 100 characters'],
    },
    price: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient queries
fileSchema.index({ userId: 1, testDate: -1 });
fileSchema.index({ familyMemberId: 1, testDate: -1 });
fileSchema.index({ userId: 1, fileType: 1 });

const File = mongoose.models.File || mongoose.model('File', fileSchema);

export default File;
