import * as XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dummy data array matching our required headers
const dummyData = [
  { 'Plot No.': 101, 'Size SqFt': 1500, 'Total Price': 3000000, 'Min Token Advance': 100000, 'Dimensions': '30x50', 'Facing': 'East' },
  { 'Plot No.': 102, 'Size SqFt': 1500, 'Total Price': 3000000, 'Min Token Advance': 100000, 'Dimensions': '30x50', 'Facing': 'West' },
  { 'Plot No.': 103, 'Size SqFt': 1800, 'Total Price': 3600000, 'Min Token Advance': 150000, 'Dimensions': '30x60', 'Facing': 'North' },
  { 'Plot No.': 104, 'Size SqFt': 2000, 'Total Price': 4000000, 'Min Token Advance': 200000, 'Dimensions': '40x50', 'Facing': 'East' },
  { 'Plot No.': 105, 'Size SqFt': 2400, 'Total Price': 5000000, 'Min Token Advance': 250000, 'Dimensions': '40x60', 'Facing': 'South' },
  { 'Plot No.': 201, 'Size SqFt': 1200, 'Total Price': 2400000, 'Min Token Advance': 50000, 'Dimensions': '30x40', 'Facing': 'East' },
  { 'Plot No.': 202, 'Size SqFt': 1200, 'Total Price': 2400000, 'Min Token Advance': 50000, 'Dimensions': '30x40', 'Facing': 'West' },
  { 'Plot No.': 203, 'Size SqFt': 3000, 'Total Price': 6000000, 'Min Token Advance': 300000, 'Dimensions': '50x60', 'Facing': 'East' }
];

const worksheet = XLSX.utils.json_to_sheet(dummyData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

const outputPath = path.resolve(__dirname, '../Dummy_Inventory.xlsx');

XLSX.writeFile(workbook, outputPath);

console.log(`Dummy Excel file generated successfully at: ${outputPath}`);
