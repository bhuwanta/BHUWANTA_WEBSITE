import { createClient } from 'next-sanity';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-05',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function seed() {
  console.log('Creating Autoresponder Settings...');
  await client.createOrReplace({
    _id: 'autoresponder',
    _type: 'autoresponder',
    fromName: 'Bhuwanta Team',
    fromEmail: 'info@bhuwanta.com',
    subjectLine: 'Thank you for your interest in Bhuwanta',
    messageBody: 'We have received your inquiry and our team will get back to you shortly.\n\nIn the meantime, feel free to explore our premium open plot projects on our website.',
  });
  console.log('✅ Autoresponder created');
}

seed().catch(err => console.error(err));
