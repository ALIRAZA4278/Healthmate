import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { analyzeMedicalReport } from '@/lib/gemini';
import { supabaseAdmin } from '@/lib/supabase';

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
    console.log('[UPLOAD] Uploading to Cloudinary...');
    const cloudinaryResult = await uploadToCloudinary(buffer, 'healthmate/reports');

    // Save report to Supabase
    console.log('[UPLOAD] Saving report to Supabase...');
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .insert([
        {
          user_id: userId,
          family_member_id: familyMemberId && familyMemberId !== 'self' ? familyMemberId : null,
          file_name: file.name,
          file_type: fileType,
          file_url: cloudinaryResult.secure_url,
          cloudinary_public_id: cloudinaryResult.public_id,
          test_date: new Date(testDate).toISOString(),
          lab_hospital: labHospital || null,
          doctor: doctor || null,
          notes: notes || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (reportError) {
      console.error('[UPLOAD] Error saving report:', reportError);
      throw reportError;
    }

    // Run AI analysis
    let aiAnalysis = null;
    try {
      console.log('[UPLOAD] Starting AI analysis...');
      aiAnalysis = await analyzeMedicalReport(buffer, file.type, fileType);
      if (aiAnalysis) {
        await supabaseAdmin
          .from('reports')
          .update({ analysis: aiAnalysis })
          .eq('id', report.id);
        console.log('[UPLOAD] AI analysis saved.');
      }
    } catch (aiError) {
      console.error('[UPLOAD] AI analysis error:', aiError.message);
    }

    console.log('[UPLOAD] Report uploaded successfully');

    return NextResponse.json(
      {
        success: true,
        message: 'Report uploaded successfully',
        data: {
          id: report.id,
          fileName: report.file_name,
          fileUrl: report.file_url,
          testDate: report.test_date,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[UPLOAD] Upload error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Error uploading report: ' + error.message },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
