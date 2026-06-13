import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log("Testing Resend API with FROM:", process.env.RESEND_FROM_EMAIL);
  
  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'info@bhuwanta.com',
      to: 'info@bhuwanta.com',
      subject: 'Resend API Test',
      html: '<p>Testing Resend API</p>'
    });
    console.log("Success:", data);
  } catch (error) {
    console.error("Resend API Error:", error);
  }
}

test();
