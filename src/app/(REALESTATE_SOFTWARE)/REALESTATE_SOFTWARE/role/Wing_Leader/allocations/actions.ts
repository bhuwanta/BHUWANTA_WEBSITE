'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function getWingAllocationsAction() {
  try {
    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    // Get the user's wing(s)
    const { data: wings, error: wingsError } = await supabase
      .from('s_wings')
      .select('id, wing_budget_percentage')
      .eq('wing_leader_id', user.id);
      
    if (wingsError) throw wingsError;
    if (!wings || wings.length === 0) {
      return { success: true, data: [] };
    }

    const wingIds = wings.map(w => w.id);

    // Get all plots assigned to these wings, joining with project to get project name
    const { data: plots, error: plotsError } = await supabase
      .from('s_inventory_plots')
      .select(`
        *,
        project:s_projects (name)
      `)
      .in('assigned_wing_id', wingIds)
      .order('created_at', { ascending: false });

    if (plotsError) throw plotsError;

    // Attach budget info to plots for frontend
    const enrichedPlots = plots.map(plot => {
      const wing = wings.find(w => w.id === plot.assigned_wing_id);
      return {
        ...plot,
        project_name: plot.project?.name || 'Unknown',
        wing_budget_percentage: wing?.wing_budget_percentage || 0
      };
    });

    return {
      success: true,
      data: enrichedPlots
    };
  } catch (error: any) {
    console.error('Error fetching allocations:', error);
    return { success: false, error: error.message };
  }
}
