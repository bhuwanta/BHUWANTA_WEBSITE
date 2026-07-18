import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { generateExcelBuffer, generatePDFBuffer, LeadReportData } from '@/lib/reports/generator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function formatLead(lead: any): LeadReportData {
  return {
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    source: lead.source_page || 'Unknown',
    message: lead.message || '-',
    project: lead.project || '-',
    downloads: lead.downloaded_item || '-',
    date: new Date(lead.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  };
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET && 
      authHeader !== `Bearer ${process.env.CRON_SECRET}` && 
      process.env.NODE_ENV === 'production'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const nowUtc = new Date();
    const nowIst = new Date(nowUtc.getTime() + (5.5 * 60 * 60 * 1000));
    const istHour = nowIst.getUTCHours();
    
    const midnightIst = new Date(nowIst);
    midnightIst.setUTCHours(0, 0, 0, 0);

    const attachments: any[] = [];
    const dateStr = nowIst.toISOString().split('T')[0];
    let reportPeriod = '';
    let emailHtml = '';

    const getUtcStr = (istDate: Date) => new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000)).toISOString();

    if (istHour >= 17) {
      // 6 PM Logic
      reportPeriod = "6 PM Evening Report";
      
      const { data: allTimeLeads } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (allTimeLeads) {
        const allTime = allTimeLeads.map(formatLead);
        
        const startOfTodayUtc = getUtcStr(midnightIst);
        const todayLeadsRaw = allTimeLeads.filter((l: any) => l.created_at >= startOfTodayUtc);
        
        const threePmIst = new Date(midnightIst.getTime() + (15 * 60 * 60 * 1000));
        const threePmUtc = getUtcStr(threePmIst);
        const slotLeadsRaw = allTimeLeads.filter((l: any) => l.created_at >= threePmUtc);

        // 3 PDFs as requested
        attachments.push({ filename: `1_leads_3pm_to_6pm_${dateStr}.pdf`, content: await generatePDFBuffer(slotLeadsRaw.map(formatLead), "Leads (3 PM - 6 PM)") });
        attachments.push({ filename: `2_total_leads_today_${dateStr}.pdf`, content: await generatePDFBuffer(todayLeadsRaw.map(formatLead), "Total Leads Today") });
        attachments.push({ filename: `3_total_leads_all_time_${dateStr}.pdf`, content: await generatePDFBuffer(allTime, "Total Leads All Time") });
        
        emailHtml = `
          <h2>Bhuwanta 6 PM Leads Report</h2>
          <p>Attached are the 3 requested PDF reports.</p>
          ${slotLeadsRaw.length === 0 && todayLeadsRaw.length === 0 ? '<p style="color:red; font-weight:bold;">Notice: No new leads came in today.</p>' : ''}
          <ul>
            <li><strong>3 PM to 6 PM:</strong> ${slotLeadsRaw.length} leads</li>
            <li><strong>Total Leads Today:</strong> ${todayLeadsRaw.length} leads</li>
            <li><strong>Total Leads Till Now:</strong> ${allTime.length} leads</li>
          </ul>
        `;
      }
    } else {
      let startIst = new Date(midnightIst);
      if (istHour >= 14) {
        startIst = new Date(midnightIst.getTime() + (12 * 60 * 60 * 1000)); // 12 PM Today
        reportPeriod = "Afternoon Report (12 PM - 3 PM)";
      } else if (istHour >= 11) {
        startIst = new Date(midnightIst.getTime() + (9 * 60 * 60 * 1000)); // 9 AM Today
        reportPeriod = "Mid-Day Report (9 AM - 12 PM)";
      } else {
        startIst = new Date(midnightIst.getTime() - (6 * 60 * 60 * 1000)); // 6 PM Yesterday
        reportPeriod = "Morning Report (6 PM Yesterday - 9 AM Today)";
      }
      
      const startUtc = getUtcStr(startIst);
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .gte('created_at', startUtc)
        .order('created_at', { ascending: false });

      // Remove early return, allow 0 leads to pass through
      const reportData = leads ? leads.map(formatLead) : [];
      const reportTitle = `Bhuwanta Leads - ${reportPeriod}`;
      
      attachments.push({ filename: `leads_report_${dateStr}.xlsx`, content: await generateExcelBuffer(reportData) });
      attachments.push({ filename: `leads_report_${dateStr}.pdf`, content: await generatePDFBuffer(reportData, reportTitle) });

      emailHtml = `
        <h2>Bhuwanta Leads Report</h2>
        <p>Attached is the leads report for <strong>${reportPeriod}</strong>.</p>
        ${reportData.length === 0 ? '<p style="color:red; font-weight:bold;">Notice: No new leads came in during this period.</p>' : ''}
        <p>Total leads in this report: <strong>${reportData.length}</strong></p>
      `;
    }

    if (attachments.length > 0) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'info@bhuwanta.com';
      const { error: emailError } = await resend.emails.send({
        from: `Bhuwanta Reports <${fromEmail}>`,
        to: ['info@bhuwanta.com'],
        subject: `[Bhuwanta CRM] ${reportPeriod}`,
        html: emailHtml + `<br/><p><small>This is an automated system email.</small></p>`,
        attachments
      });

      if (emailError) {
        console.error('Resend Error:', emailError);
        return NextResponse.json({ error: emailError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, period: reportPeriod, attachmentsGenerated: attachments.length });
  } catch (err: unknown) {
    console.error('Cron Error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
