import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { analyzeMedicalReportFromUrl } from '@/lib/gemini';
import { supabaseAdmin } from '@/lib/supabase';

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
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .eq('user_id', userId)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { success: false, message: 'Report not found' },
        { status: 404 }
      );
    }

    // Run AI analysis from URL
    const aiAnalysis = await analyzeMedicalReportFromUrl(fileUrl, fileType || 'lab_report');

    // Save analysis to database
    const { data: insight, error: insertError } = await supabaseAdmin
      .from('reports')
      .update({
        analysis: aiAnalysis,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .eq('user_id', userId)
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: 'Analysis complete',
      data: { analysis: aiAnalysis },
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { success: false, message: 'Analysis failed: ' + error.message },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
