import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import Vitals from '@/models/Vitals';

// GET all vitals
async function getHandler(request) {
  try {
    const userId = request.user.userId;
    const { searchParams } = new URL(request.url);

    // Build query
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
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const vitals = await Vitals.find(query)
      .populate('familyMemberId', 'name relation color')
      .sort({ date: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      count: vitals.length,
      data: vitals,
    });
  } catch (error) {
    console.error('Get vitals error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching vitals' },
      { status: 500 }
    );
  }
}

// POST new vital
async function postHandler(request) {
  try {
    const userId = request.user.userId;
    const body = await request.json();

    const {
      date,
      bloodPressure,
      bloodSugar,
      weight,
      heartRate,
      temperature,
      oxygenLevel,
      notes,
      familyMemberId,
    } = body;

    // Validation
    if (!date) {
      return NextResponse.json(
        { success: false, message: 'Please provide date' },
        { status: 400 }
      );
    }

    // Check if at least one vital is provided
    const hasVitals =
      bloodPressure?.systolic ||
      bloodPressure?.diastolic ||
      bloodSugar ||
      weight ||
      heartRate ||
      temperature ||
      oxygenLevel;

    if (!hasVitals) {
      return NextResponse.json(
        { success: false, message: 'Please provide at least one vital measurement' },
        { status: 400 }
      );
    }

    const vital = await Vitals.create({
      userId,
      familyMemberId: familyMemberId && familyMemberId !== 'self' ? familyMemberId : undefined,
      date: new Date(date),
      bloodPressure: bloodPressure || undefined,
      bloodSugar: bloodSugar || undefined,
      weight: weight || undefined,
      heartRate: heartRate || undefined,
      temperature: temperature || undefined,
      oxygenLevel: oxygenLevel || undefined,
      notes: notes || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Vital added successfully',
        data: vital,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add vital error:', error);
    return NextResponse.json(
      { success: false, message: 'Error adding vital' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
