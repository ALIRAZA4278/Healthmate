import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { supabaseAdmin } from '@/lib/supabase';

// GET single report
async function getHandler(request, { params }) {
  try {
    const userId = request.user.userId;
    const { id } = await params;

    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !report) {
      console.error('[REPORT GET] Error:', error?.message, 'id:', id, 'userId:', userId);
      return NextResponse.json(
        { success: false, message: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: report.id,
        fileName: report.file_name,
        fileType: report.file_type,
        fileUrl: report.file_url,
        testDate: report.test_date,
        labHospital: report.lab_hospital,
        doctor: report.doctor,
        notes: report.notes,
        createdAt: report.created_at,
        aiInsight: report.analysis || null,
      },
    });
  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching report' },
      { status: 500 }
    );
  }
}

// DELETE report
async function deleteHandler(request, { params }) {
  try {
    const userId = request.user.userId;
    const { id } = await params;

    const { data: report, error: fetchError } = await supabaseAdmin
      .from('reports')
      .select('cloudinary_public_id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !report) {
      return NextResponse.json(
        { success: false, message: 'Report not found' },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    if (report.cloudinary_public_id) {
      try {
        await deleteFromCloudinary(report.cloudinary_public_id);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
      }
    }

    // Delete report from Supabase
    const { error: deleteError } = await supabaseAdmin
      .from('reports')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting report' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const DELETE = withAuth(deleteHandler);
