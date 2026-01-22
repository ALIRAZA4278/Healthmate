import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import FamilyMember from '@/models/FamilyMember';
import File from '@/models/File';
import Vitals from '@/models/Vitals';

// GET single family member
async function getHandler(request, { params }) {
  try {
    const userId = request.user.userId;
    const { id } = await params;

    const familyMember = await FamilyMember.findOne({ _id: id, userId }).lean();

    if (!familyMember) {
      return NextResponse.json(
        { success: false, message: 'Family member not found' },
        { status: 404 }
      );
    }

    // Get reports count
    const reportsCount = await File.countDocuments({ familyMemberId: id });

    // Get recent vitals
    const recentVitals = await Vitals.find({ familyMemberId: id })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        ...familyMember,
        reportsCount,
        recentVitals,
      },
    });
  } catch (error) {
    console.error('Get family member error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching family member' },
      { status: 500 }
    );
  }
}

// PUT update family member
async function putHandler(request, { params }) {
  try {
    const userId = request.user.userId;
    const { id } = await params;
    const body = await request.json();

    const familyMember = await FamilyMember.findOne({ _id: id, userId });

    if (!familyMember) {
      return NextResponse.json(
        { success: false, message: 'Family member not found' },
        { status: 404 }
      );
    }

    const { name, relation, color, dateOfBirth, bloodGroup, allergies, medicalConditions } = body;

    // Update fields
    if (name) familyMember.name = name.trim();
    if (relation) familyMember.relation = relation;
    if (color) familyMember.color = color;
    if (dateOfBirth !== undefined) familyMember.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;
    if (bloodGroup !== undefined) familyMember.bloodGroup = bloodGroup || undefined;
    if (allergies !== undefined) familyMember.allergies = allergies || undefined;
    if (medicalConditions !== undefined) familyMember.medicalConditions = medicalConditions || undefined;

    await familyMember.save();

    return NextResponse.json({
      success: true,
      message: 'Family member updated successfully',
      data: familyMember,
    });
  } catch (error) {
    console.error('Update family member error:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating family member' },
      { status: 500 }
    );
  }
}

// DELETE family member
async function deleteHandler(request, { params }) {
  try {
    const userId = request.user.userId;
    const { id } = await params;

    const familyMember = await FamilyMember.findOne({ _id: id, userId });

    if (!familyMember) {
      return NextResponse.json(
        { success: false, message: 'Family member not found' },
        { status: 404 }
      );
    }

    // Check if family member has associated reports or vitals
    const reportsCount = await File.countDocuments({ familyMemberId: id });
    const vitalsCount = await Vitals.countDocuments({ familyMemberId: id });

    if (reportsCount > 0 || vitalsCount > 0) {
      // Option 1: Prevent deletion (uncomment to use)
      // return NextResponse.json(
      //   { success: false, message: 'Cannot delete family member with associated reports or vitals' },
      //   { status: 400 }
      // );

      // Option 2: Remove family member reference from associated records
      await File.updateMany({ familyMemberId: id }, { $unset: { familyMemberId: 1 } });
      await Vitals.updateMany({ familyMemberId: id }, { $unset: { familyMemberId: 1 } });
    }

    await FamilyMember.deleteOne({ _id: id });

    return NextResponse.json({
      success: true,
      message: 'Family member deleted successfully',
    });
  } catch (error) {
    console.error('Delete family member error:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting family member' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);
