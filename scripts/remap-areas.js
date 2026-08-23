import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const areasList = [
  'Warangal Highway',
  'Mumbai Highway',
  'Shabad',
  'Sharkarpally Highway',
  'Bangalore Highway'
];

const projectsMapping = [
  { projectName: 'S.V.KANAKA MAPLE HOMES', areaName: 'Warangal Highway' },
  { projectName: 'TJR TownShip', areaName: 'Mumbai Highway' },
  { projectName: 'VAIBHAV COUNTY', areaName: 'Mumbai Highway' },
  { projectName: 'VIAN VALLY', areaName: 'Shabad' },
];

async function seed() {
  console.log("Starting DB seed...");
  
  // 1. Create Areas
  for (const area of areasList) {
    const { error } = await supabase.from('s_areas').insert({ name: area });
    if (error && error.code !== '23505') console.log(`Error inserting area ${area}:`, error.message);
  }
  console.log("Areas created.");

  // 2. Create Projects & Map them
  for (const m of projectsMapping) {
    // Insert project
    const { data: projectData, error: pError } = await supabase
      .from('s_projects')
      .insert({ name: m.projectName })
      .select('id')
      .single();
      
    if (pError && pError.code !== '23505') {
      console.log(`Error inserting project ${m.projectName}:`, pError.message);
      continue;
    }
    
    // Get project ID (in case it already existed)
    let projectId = projectData?.id;
    if (!projectId) {
      const { data } = await supabase.from('s_projects').select('id').eq('name', m.projectName).single();
      projectId = data?.id;
    }

    // Get Area ID
    const { data: areaData } = await supabase.from('s_areas').select('id').eq('name', m.areaName).single();
    
    if (projectId && areaData?.id) {
      // Map them
      const { error: mapError } = await supabase
        .from('s_project_areas')
        .insert({ project_id: projectId, area_id: areaData.id });
        
      if (mapError && mapError.code !== '23505') {
        console.log(`Error mapping ${m.projectName} -> ${m.areaName}:`, mapError.message);
      } else {
        console.log(`Mapped ${m.projectName} -> ${m.areaName}`);
      }
    }
  }
  
  console.log("Done.");
}

seed();
