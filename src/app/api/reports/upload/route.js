import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { analyzeMedicalReport } from '@/lib/gemini';
import File from '@/models/File';
import AiInsight from '@/models/AiInsight';

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function handler(request) {
  try {
    const userId = request.user.userId;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');
    const fileType = formData.get('fileType') || 'lab_report';
    const testDate = formData.get('testDate');
    const labHospital = formData.get('labHospital');
    const doctor = formData.get('doctor');
    const price = formData.get('price');
    const notes = formData.get('notes');
    const familyMemberId = formData.get('familyMemberId');

    // Validation
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Please upload a file' },
        { status: 400 }
      );
    }

    if (!testDate) {
      return NextResponse.json(
        { success: false, message: 'Please provide test date' },
        { status: 400 }
      );
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'File type not allowed. Please upload JPEG, PNG, WebP, or PDF' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(buffer, 'healthmate/reports');

    // Create file record
    const fileRecord = await File.create({
      userId,
      familyMemberId: familyMemberId && familyMemberId !== 'self' ? familyMemberId : undefined,
      fileName: file.name,
      fileType,
      fileUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      testDate: new Date(testDate),
      labHospital: labHospital || undefined,
      doctor: doctor || undefined,
      price: price || undefined,
      notes: notes || undefined,
    });

    // Analyze with AI (async - don't wait for it to complete)
    let aiAnalysis = null;
    try {
      aiAnalysis = await analyzeMedicalReport(buffer, file.type, fileType);

      // Save AI insight
      await AiInsight.create({
        fileId: fileRecord._id,
        userId,
        summaryEnglish: aiAnalysis.summaryEnglish,
        summaryUrdu: aiAnalysis.summaryUrdu,
        abnormalValues: aiAnalysis.abnormalValues || [],
        questionsToAsk: aiAnalysis.questionsToAsk || [],
        foodRecommendations: aiAnalysis.foodRecommendations || { avoid: [], recommended: [] },
        homeRemedies: aiAnalysis.homeRemedies || [],
        disclaimer: aiAnalysis.disclaimer,
      });
    } catch (aiError) {
      console.error('AI analysis error:', aiError);
      // Continue without AI analysis - it's not critical
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Report uploaded successfully',
        data: {
          file: fileRecord,
          aiInsight: aiAnalysis,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Error uploading report: ' + error.message },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
