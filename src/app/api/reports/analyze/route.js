import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { analyzeMedicalReport } from '@/lib/openai';
import File from '@/models/File';
import AiInsight from '@/models/AiInsight';

async function handler(request) {
  try {
    const userId = request.user.userId;
    const { reportId, fileUrl, mimeType, fileType } = await request.json();

    if (!reportId || !fileUrl) {
      return NextResponse.json(
        { success: false, message: 'reportId and fileUrl are required' },
        { status: 400 }
      );
    }

    // Verify the report belongs to this user
    const report = await File.findOne({ _id: reportId, userId }).lean();
    if (!report) {
      return NextResponse.json(
        { success: false, message: 'Report not found' },
        { status: 404 }
      );
    }

    // Download file from Cloudinary URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to download file from storage');
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resolvedMimeType = mimeType || response.headers.get('content-type') || 'image/jpeg';

    // Run AI analysis
    const aiAnalysis = await analyzeMedicalReport(buffer, resolvedMimeType, fileType || 'lab_report');

    // Delete old insight if exists
    await AiInsight.deleteOne({ fileId: reportId });

    // Save new insight
    const insight = await AiInsight.create({
      fileId: reportId,
      userId,
      urgencyLevel: aiAnalysis.urgencyLevel || 'normal',
      urgencyReason: aiAnalysis.urgencyReason || '',
      summaryEnglish: aiAnalysis.summaryEnglish,
      summaryUrdu: aiAnalysis.summaryUrdu,
      keyFindings: aiAnalysis.keyFindings || [],
      abnormalValues: aiAnalysis.abnormalValues || [],
      normalValues: aiAnalysis.normalValues || [],
      questionsToAsk: aiAnalysis.questionsToAsk || [],
      foodRecommendations: aiAnalysis.foodRecommendations || { avoid: [], recommended: [] },
      homeRemedies: aiAnalysis.homeRemedies || [],
      lifestyleRecommendations: aiAnalysis.lifestyleRecommendations || [],
      warningSignsToWatch: aiAnalysis.warningSignsToWatch || [],
      followUpRecommendations: aiAnalysis.followUpRecommendations || '',
      disclaimer: aiAnalysis.disclaimer,
    });

    return NextResponse.json({
      success: true,
      message: 'Analysis complete',
      data: insight,
    });
  } catch (error) {
    console.error('Re-analyze error:', error);
    return NextResponse.json(
      { success: false, message: 'Analysis failed: ' + error.message },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
