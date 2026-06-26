import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';

// GET all vitals
async function getHandler(request) {
  try {
    const userId = request.user.userId;
    const { searchParams } = new URL(request.url);

    let query = supabaseAdmin
      .from('vitals')
      .select('*')
      .eq('user_id', userId);

    // Filter by family member
    const familyMemberId = searchParams.get('familyMemberId');
    if (familyMemberId && familyMemberId !== 'self') {
      query = query.eq('family_member_id', familyMemberId);
    } else if (familyMemberId === 'self') {
      query = query.is('family_member_id', null);
    }

    // Filter by date range
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    query = query.order('created_at', { ascending: false });

    const { data: vitals, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      count: vitals?.length || 0,
      data: vitals || [],
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

    const { heartRate, bloodPressure, temperature, date, familyMemberId } = body;

    // Validation
    if (!date) {
      return NextResponse.json(
        { success: false, message: 'Please provide a date' },
        { status: 400 }
      );
    }

    const { data: vital, error } = await supabaseAdmin
      .from('vitals')
      .insert([
        {
          user_id: userId,
          family_member_id: familyMemberId && familyMemberId !== 'self' ? familyMemberId : null,
          heart_rate: heartRate || null,
          blood_pressure: bloodPressure || null,
          temperature: temperature || null,
          created_at: new Date(date).toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

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
