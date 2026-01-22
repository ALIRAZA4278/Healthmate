import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import File from '@/models/File';
import AiInsight from '@/models/AiInsight';

async function handler(request) {
  try {
    const userId = request.user.userId;
    const { searchParams } = new URL(request.url);

    // Build query filters
    const query = { userId };

    // Filter by family member
    const familyMemberId = searchParams.get('familyMemberId');
    if (familyMemberId) {
      if (familyMemberId === 'self') {
        query.familyMemberId = { $exists: false };
      } else {
        query.familyMemberId = familyMemberId;
      }
    }

    // Filter by date range
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate || endDate) {
      query.testDate = {};
      if (startDate) query.testDate.$gte = new Date(startDate);
      if (endDate) query.testDate.$lte = new Date(endDate);
    }

    // Filter by file type
    const fileType = searchParams.get('fileType');
    if (fileType) {
      query.fileType = fileType;
    }

    // Fetch reports with AI insights
    const reports = await File.find(query)
      .populate('familyMemberId', 'name relation color')
      .sort({ testDate: -1 })
      .lean();

    // Get AI insights for each report
    const reportsWithInsights = await Promise.all(
      reports.map(async (report) => {
        const aiInsight = await AiInsight.findOne({ fileId: report._id }).lean();
        return {
          ...report,
          aiInsight: aiInsight || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: reportsWithInsights.length,
      data: reportsWithInsights,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching reports' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
