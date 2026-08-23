import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Read environment variables directly
const envFile = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1];
const supabaseKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl.trim(), supabaseKey.trim());

async function run() {
  try {
    console.log("Adding inventory...");

    // 1. Get or Create Area
    const areaName = 'Warangal Highway';
    let { data: area, error: areaError } = await supabase
      .from('s_areas')
      .select('id, name')
      .ilike('name', areaName)
      .maybeSingle();
      
    if (areaError) throw areaError;

    let areaId;
    if (!area) {
      console.log(`Area '${areaName}' not found. Creating it...`);
      const { data: newArea, error: createAreaError } = await supabase
        .from('s_areas')
        .insert({ name: areaName })
        .select()
        .single();
      if (createAreaError) throw createAreaError;
      areaId = newArea.id;
    } else {
      areaId = area.id;
      console.log(`Found Area: ${area.name} (${areaId})`);
    }

    // 2. Get or Create Project
    const projectName = 'S.V.KANAKA MAPLE HOMES';
    let { data: project, error: projectError } = await supabase
      .from('s_projects')
      .select('id, name')
      .ilike('name', projectName)
      .maybeSingle();

    if (projectError) throw projectError;

    let projectId;
    if (!project) {
      console.log(`Project '${projectName}' not found. Creating it...`);
      const { data: newProject, error: createProjectError } = await supabase
        .from('s_projects')
        .insert({ name: projectName, status: 'Active' })
        .select()
        .single();
      if (createProjectError) throw createProjectError;
      projectId = newProject.id;

      // Link area and project
      await supabase
        .from('s_project_areas')
        .insert({ project_id: projectId, area_id: areaId });
    } else {
      projectId = project.id;
      console.log(`Found Project: ${project.name} (${projectId})`);
      
      // Ensure area is linked
      const { data: linked } = await supabase
        .from('s_project_areas')
        .select('*')
        .eq('project_id', projectId)
        .eq('area_id', areaId)
        .maybeSingle();
        
      if (!linked) {
        await supabase
          .from('s_project_areas')
          .insert({ project_id: projectId, area_id: areaId });
      }
    }

    // 3. Create dummy plots for this project
    console.log("Generating plots for project...");
    
    // Generate 20 dummy plots
    const plotsToInsert = [];
    for (let i = 1; i <= 20; i++) {
      plotsToInsert.push({
        project_id: projectId,
        plot_number: String(i),
        size_sqft: 1800 + Math.floor(Math.random() * 500), // Random size between 1800 and 2300 sqft
        total_price: 2000000 + Math.floor(Math.random() * 1000000), // Random price between 2M and 3M
        min_token_advance: 100000,
        dimensions: '30x60',
        facing: i % 2 === 0 ? 'East' : 'West',
        status: 'available'
      });
    }

    // Insert plots
    const { error: insertError } = await supabase
      .from('s_inventory_plots')
      .upsert(plotsToInsert, { onConflict: 'project_id,plot_number' }); // upsert to avoid duplicate plot numbers

    if (insertError) {
      console.log("Error inserting plots:", insertError.message);
      // It might not have unique constraint on project_id,plot_number, so let's try simple insert if upsert fails
      const { error: insertError2 } = await supabase
        .from('s_inventory_plots')
        .insert(plotsToInsert);
        
      if (insertError2) throw insertError2;
    }

    console.log(`Successfully added ${plotsToInsert.length} plots to ${projectName}!`);
    
  } catch (err) {
    console.error("Script failed:", err);
  }
}

run();
