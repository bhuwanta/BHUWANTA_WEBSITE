import { requireRole } from '../../_shared/auth';
import DocumentsPage from '../../_shared/customer/DocumentsPage';

export default async function CustomerDocumentsPage() {
  await requireRole('customer');
  return <DocumentsPage />;
}
