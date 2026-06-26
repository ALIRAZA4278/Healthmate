import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';

// GET single family member
async function getHandler(request, { params }) {
  try {
    const userId = request.user.userId;
    const { id } = await params;

    const { data: familyMember, error } = await supabaseAdmin
      .from('family_members')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !familyMember) {
      return NextResponse.json(
        { success: false, message: 'Family member not found' },
        { status: 404 }
      );
    }

    // Get reports count
    const { count: reportsCount } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('family_member_id', id);

    // Get recent vitals
    const { data: recentVitals } = await supabaseAdmin
      .from('vitals')
      .select('*')
      .eq('user_id', userId)
      .eq('family_member_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        ...familyMember,
        reportsCount: reportsCount || 0,
        recentVitals: recentVitals || [],
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

    // Verify ownership
    const { data: familyMember, error: fetchError } = await supabaseAdmin
      .from('family_members')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !familyMember) {
      return NextResponse.json(
        { success: false, message: 'Family member not found' },
        { status: 404 }
      );
    }

    const { name, relationship, color } = body;

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (name) updates.name = name.trim();
    if (relationship) updates.relationship = relationship;
    if (color) updates.color = color;

    const { data: updated, error } = await supabaseAdmin
      .from('family_members')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Family member updated successfully',
      data: updated,
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

    // Verify ownership
    const { data: familyMember, error: fetchError } = await supabaseAdmin
      .from('family_members')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !familyMember) {
      return NextResponse.json(
        { success: false, message: 'Family member not found' },
        { status: 404 }
      );
    }

    // Delete (cascading deletes should handle related records if set up in Supabase)
    const { error } = await supabaseAdmin
      .from('family_members')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

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
