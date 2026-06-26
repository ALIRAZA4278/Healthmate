import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';

// GET all family members
async function getHandler(request) {
  try {
    const userId = request.user.userId;

    const { data: familyMembers, error } = await supabaseAdmin
      .from('family_members')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      count: familyMembers?.length || 0,
      data: familyMembers || [],
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

    const { name, relationship, color } = body;

    // Validation
    if (!name || !relationship) {
      return NextResponse.json(
        { success: false, message: 'Please provide name and relationship' },
        { status: 400 }
      );
    }

    const { data: familyMember, error } = await supabaseAdmin
      .from('family_members')
      .insert([
        {
          user_id: userId,
          name: name.trim(),
          relationship,
          color: color || '#ec4899',
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
