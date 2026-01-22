import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import File from '@/models/File';
import AiInsight from '@/models/AiInsight';

// GET single report
async function getHandler(request, { params }) {
  try {
    const userId = request.user.userId;
    const { id } = await params;

    const report = await File.findOne({ _id: id, userId })
      .populate('familyMemberId', 'name relation color')
      .lean();

    if (!report) {
      return NextResponse.json(
        { success: false, message: 'Report not found' },
        { status: 404 }
      );
    }

    // Get AI insight
    const aiInsight = await AiInsight.findOne({ fileId: id }).lean();

    return NextResponse.json({
      success: true,
      data: {
        ...report,
        aiInsight: aiInsight || null,
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

    const report = await File.findOne({ _id: id, userId });

    if (!report) {
      return NextResponse.json(
        { success: false, message: 'Report not found' },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(report.cloudinaryPublicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary delete error:', cloudinaryError);
      // Continue even if Cloudinary delete fails
    }

    // Delete AI insight
    await AiInsight.deleteOne({ fileId: id });

    // Delete file record
    await File.deleteOne({ _id: id });

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
