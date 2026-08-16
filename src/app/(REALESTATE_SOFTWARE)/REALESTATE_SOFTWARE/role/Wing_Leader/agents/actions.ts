'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function getWingAgentsAction() {
  try {
    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    // Get the user's wing(s)
    const { data: wings, error: wingsError } = await supabase
      .from('s_wings')
      .select('id')
      .eq('wing_leader_id', user.id);
      
    if (wingsError) throw wingsError;
    if (!wings || wings.length === 0) {
      return { success: true, data: [] };
    }
    const wingIds = wings.map(w => w.id);

    // Get all agents mapped to these wings
    const { data: agentMappings, error: agentError } = await supabase
      .from('s_wing_agents')
      .select(`
        created_at,
        agent:s_realestate_users (
          id,
          bhuwanta_id,
          full_name,
          phone,
          is_active
        )
      `)
      .in('wing_id', wingIds);

    if (agentError) throw agentError;

    // Flatten data for frontend
    const agents = agentMappings.map((m: any) => ({
      id: m.agent.id,
      bhuwanta_id: m.agent.bhuwanta_id,
      full_name: m.agent.full_name,
      phone: m.agent.phone,
      is_active: m.agent.is_active,
      created_at: m.created_at
    }));

    return {
      success: true,
      data: agents
    };
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return { success: false, error: error.message };
  }
}

export async function createAgentAction(data: {
  fullName: string;
  phone: string;
  password?: string;
}) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createServiceClient();

    // 1. Authenticate Wing Leader and get their wing_id
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const { data: wings, error: wingsError } = await supabase
      .from('s_wings')
      .select('id')
      .eq('wing_leader_id', user.id);
      
    if (wingsError || !wings || wings.length === 0) {
      return { success: false, error: "You do not have a wing assigned to you." };
    }
    const wingId = wings[0].id;

    // 2. Create the user in Supabase Auth using Admin API
    const fakeEmail = `${data.phone.replace(/[^a-zA-Z0-9]/g, '')}@bhuwanta.erp`;
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: fakeEmail,
      email_confirm: true,
      password: data.password || 'Bhuwanta@2026', // Default fallback password
      user_metadata: {
        full_name: data.fullName,
        raw_phone: data.phone
      },
    });

    if (createAuthError) {
      return { success: false, error: `Auth Error: ${createAuthError.message}` };
    }

    const userId = authData.user.id;

    // 3. Insert into s_realestate_users
    const { error: profileError } = await supabaseAdmin
      .from('s_realestate_users')
      .insert({
        id: userId,
        phone: data.phone,
        full_name: data.fullName,
        role: 'agent',
        is_active: true,
      });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { success: false, error: `Profile Error: ${profileError.message}` };
    }

    // 4. Map the new agent to the wing leader's wing
    const { error: mapError } = await supabaseAdmin
      .from('s_wing_agents')
      .insert({
        wing_id: wingId,
        agent_id: userId
      });

    if (mapError) {
      return { success: false, error: `Mapping Error: ${mapError.message}` };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error creating agent:', error);
    return { success: false, error: error.message };
  }
}
