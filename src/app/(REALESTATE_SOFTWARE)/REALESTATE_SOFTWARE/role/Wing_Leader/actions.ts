'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function getWingLeaderDashboardStatsAction() {
  try {
    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    // Query stats view
    const { data: stats, error } = await supabase
      .from('v_wing_leader_stats')
      .select('*')
      .eq('wing_leader_id', user.id);

    if (error) throw error;

    // Aggregate the stats across all projects
    const totalPlots = stats.reduce((acc, curr) => acc + (Number(curr.total_plots) || 0), 0);
    const totalValue = stats.reduce((acc, curr) => acc + (Number(curr.total_value) || 0), 0);
    const totalBudget = stats.reduce((acc, curr) => acc + (Number(curr.total_budget) || 0), 0);
    const wingBudgetPercentage = stats.length > 0 ? Number(stats[0].wing_budget_percentage) : 0;

    return {
      success: true,
      data: {
        totalPlots,
        totalValue,
        totalBudget,
        wingBudgetPercentage,
        projects: stats // Breakdown by project
      }
    };
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return { success: false, error: error.message };
  }
}
