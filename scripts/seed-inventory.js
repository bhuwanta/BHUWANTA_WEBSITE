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

async function seedInventory() {
  console.log("Starting Inventory seed...");
  
  // Get all projects
  const { data: projects, error: pError } = await supabase.from('s_projects').select('id, name');
  
  if (pError || !projects || projects.length === 0) {
    console.error("Failed to fetch projects or no projects found.");
    return;
  }

  // Delete existing unallocated inventory to avoid clutter if run multiple times
  console.log("Clearing existing unallocated inventory...");
  await supabase.from('s_inventory_plots').delete().is('assigned_wing_id', null);

  const allPlots = [];
  
  // For each project, generate 5-10 random plots
  for (const project of projects) {
    const numPlots = Math.floor(Math.random() * 6) + 5; // 5 to 10 plots
    
    for (let i = 1; i <= numPlots; i++) {
      const size = [1200, 1500, 1800, 2000, 2400][Math.floor(Math.random() * 5)];
      const pricePerSqft = [2000, 2500, 3000, 3500][Math.floor(Math.random() * 4)];
      
      allPlots.push({
        project_id: project.id,
        plot_number: `P-${i * 100 + Math.floor(Math.random() * 99)}`,
        size_sqft: size,
        total_price: size * pricePerSqft,
        min_token_advance: 100000,
        dimensions: size === 1200 ? '30x40' : size === 1500 ? '30x50' : '40x60',
        facing: ['East', 'West', 'North', 'South'][Math.floor(Math.random() * 4)],
        status: 'available'
      });
    }
  }

  // Insert plots
  const { error: insertError } = await supabase.from('s_inventory_plots').insert(allPlots);
  
  if (insertError) {
    console.error("Failed to insert plots:", insertError.message);
  } else {
    console.log(`Successfully seeded ${allPlots.length} plots across ${projects.length} projects!`);
  }
}

seedInventory();
