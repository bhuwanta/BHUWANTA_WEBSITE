require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
});

async function main() {
  try {
    const existing = await client.fetch('*[_type == "autoresponder"][0]');
    
    if (!existing) {
      console.log('No autoresponder document found, creating one...');
      await client.create({
        _type: 'autoresponder',
        fromName: 'Bhuwanta Team',
        fromEmail: 'info@bhuwanta.com',
        subjectLine: 'Thank you for contacting Bhuwanta',
        messageBody: 'We have received your inquiry and our team will get back to you shortly.\n\nIn the meantime, feel free to explore our premium open plot projects on our website.'
      });
      console.log('Created.');
    } else {
      console.log('Patching existing autoresponder document...');
      await client.patch(existing._id)
        .set({
          messageBody: 'We have received your inquiry and our team will get back to you shortly.\n\nIn the meantime, feel free to explore our premium open plot projects on our website.',
          fromName: 'Bhuwanta Team'
        })
        .commit();
      console.log('Patched.');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
