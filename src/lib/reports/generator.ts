import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface LeadReportData {
  name: string;
  phone: string;
  email: string;
  source: string;
  message: string;
  project: string;
  downloads: string;
  date: string;
}

export async function generateExcelBuffer(leads: LeadReportData[]): Promise<Buffer> {
  // If no leads, provide a dummy row so the Excel file isn't completely blank
  const dataForExcel = leads.length > 0 ? leads : [{
    name: 'NO NEW LEADS', phone: '-', email: '-', source: '-', message: '-', project: '-', downloads: '-', date: '-'
  }];

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Leads');

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Source', key: 'source', width: 15 },
    { header: 'Message', key: 'message', width: 40 },
    { header: 'Project', key: 'project', width: 20 },
    { header: 'Downloads', key: 'downloads', width: 30 },
    { header: 'Date', key: 'date', width: 20 }
  ];

  dataForExcel.forEach(lead => {
    worksheet.addRow(lead);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function generatePDFBuffer(leads: LeadReportData[], reportTitle: string): Promise<Buffer> {
  const doc = new jsPDF('l', 'pt', 'a4');

  doc.setFontSize(18);
  doc.text(reportTitle, 40, 40);

  const tableData = leads.length > 0 ? leads.map(l => [
    l.date,
    l.name || '-',
    l.phone || '-',
    l.source || '-',
    l.message || '-',
    l.project || '-',
    l.downloads || '-'
  ]) : [["-", "NO NEW LEADS", "-", "-", "-", "-", "-"]];

  autoTable(doc, {
    startY: 60,
    head: [["Date", "Name", "Phone", "Source", "Message", "Project", "Downloads"]],
    body: tableData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 95] }, // Matches Bhuwanta Navy #1e3a5f
  });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
