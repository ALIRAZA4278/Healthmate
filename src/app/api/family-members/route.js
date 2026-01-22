import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import FamilyMember from '@/models/FamilyMember';

// GET all family members
async function getHandler(request) {
  try {
    const userId = request.user.userId;

    const familyMembers = await FamilyMember.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: familyMembers.length,
      data: familyMembers,
    });
  } catch (error) {
    console.error('Get family members error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching family members' },
      { status: 500 }
    );
  }
}

// POST new family member
async function postHandler(request) {
  try {
    const userId = request.user.userId;
    const body = await request.json();

    const { name, relation, color, dateOfBirth, bloodGroup, allergies, medicalConditions } = body;

    // Validation
    if (!name || !relation) {
      return NextResponse.json(
        { success: false, message: 'Please provide name and relation' },
        { status: 400 }
      );
    }

    const familyMember = await FamilyMember.create({
      userId,
      name: name.trim(),
      relation,
      color: color || '#ec4899',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      bloodGroup: bloodGroup || undefined,
      allergies: allergies || undefined,
      medicalConditions: medicalConditions || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Family member added successfully',
        data: familyMember,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add family member error:', error);
    return NextResponse.json(
      { success: false, message: 'Error adding family member' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
