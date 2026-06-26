import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';

async function handler(request) {
  try {
    const userId = request.user.userId;
    const { searchParams } = new URL(request.url);

    // Build query filters
    let query = supabaseAdmin.from('reports').select('*').eq('user_id', userId);

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

    // Filter by file type
    const fileType = searchParams.get('fileType');
    if (fileType) {
      query = query.eq('file_type', fileType);
    }

    // Order by date descending
    query = query.order('created_at', { ascending: false });

    // Execute query
    const { data: reports, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      count: reports?.length || 0,
      data: reports || [],
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
