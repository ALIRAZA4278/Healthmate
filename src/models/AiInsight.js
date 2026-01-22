import mongoose from 'mongoose';

const aiInsightSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: [true, 'File ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    summaryEnglish: {
      type: String,
      required: [true, 'English summary is required'],
    },
    summaryUrdu: {
      type: String,
      required: [true, 'Urdu summary is required'],
    },
    abnormalValues: [{
      type: String,
    }],
    questionsToAsk: [{
      question: {
        type: String,
        required: true,
      },
    }],
    foodRecommendations: {
      avoid: [{
        type: String,
      }],
      recommended: [{
        type: String,
      }],
    },
    homeRemedies: [{
      remedy: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    }],
    disclaimer: {
      type: String,
      default: 'This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with your healthcare provider for proper diagnosis and treatment.',
    },
  },
  {
    timestamps: true,
  }
);

// Create index for efficient lookups
aiInsightSchema.index({ fileId: 1 });
aiInsightSchema.index({ userId: 1 });

const AiInsight = mongoose.models.AiInsight || mongoose.model('AiInsight', aiInsightSchema);

export default AiInsight;
