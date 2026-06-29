import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Simple .env parser
const envContent = fs.readFileSync('.env', 'utf-8');
const envConfig = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    envConfig[key] = value.trim();
  }
});

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key prefix:", supabaseKey ? supabaseKey.substring(0, 20) : "undefined");

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("\nTesting connection to app_exercises...");
  const { data: exercises, error: errExercises } = await supabase.from('app_exercises').select('*').limit(3);
  if (errExercises) {
    console.error("Error fetching exercises:", errExercises);
  } else {
    console.log(`Successfully fetched exercises. Count: ${exercises ? exercises.length : 0}`);
    console.log("Sample:", exercises);
  }

  console.log("\nTesting connection to app_settings...");
  const { data: settings, error: errSettings } = await supabase.from('app_settings').select('*');
  if (errSettings) {
    console.error("Error fetching settings:", errSettings);
  } else {
    console.log(`Successfully fetched settings. Count: ${settings ? settings.length : 0}`);
    console.log("Sample:", settings);
  }
}

runTest().catch(console.error);
