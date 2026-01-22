import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import Vitals from '@/models/Vitals';

// PUT update vital
async function putHandler(request, { params }) {
  try {
    const userId = request.user.userId;
    const { id } = await params;
    const body = await request.json();

    const vital = await Vitals.findOne({ _id: id, userId });

    if (!vital) {
      return NextResponse.json(
        { success: false, message: 'Vital not found' },
        { status: 404 }
      );
    }

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

    // Update fields
    if (date) vital.date = new Date(date);
    if (bloodPressure !== undefined) vital.bloodPressure = bloodPressure;
    if (bloodSugar !== undefined) vital.bloodSugar = bloodSugar;
    if (weight !== undefined) vital.weight = weight;
    if (heartRate !== undefined) vital.heartRate = heartRate;
    if (temperature !== undefined) vital.temperature = temperature;
    if (oxygenLevel !== undefined) vital.oxygenLevel = oxygenLevel;
    if (notes !== undefined) vital.notes = notes;
    if (familyMemberId !== undefined) {
      vital.familyMemberId = familyMemberId && familyMemberId !== 'self' ? familyMemberId : undefined;
    }

    await vital.save();

    return NextResponse.json({
      success: true,
      message: 'Vital updated successfully',
      data: vital,
    });
  } catch (error) {
    console.error('Update vital error:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating vital' },
      { status: 500 }
    );
  }
}

// DELETE vital
async function deleteHandler(request, { params }) {
  try {
    const userId = request.user.userId;
    const { id } = await params;

    const vital = await Vitals.findOne({ _id: id, userId });

    if (!vital) {
      return NextResponse.json(
        { success: false, message: 'Vital not found' },
        { status: 404 }
      );
    }

    await Vitals.deleteOne({ _id: id });

    return NextResponse.json({
      success: true,
      message: 'Vital deleted successfully',
    });
  } catch (error) {
    console.error('Delete vital error:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting vital' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);
