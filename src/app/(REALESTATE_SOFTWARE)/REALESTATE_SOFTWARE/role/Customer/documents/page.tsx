import { requireRole } from '../../_shared/auth';
import DocumentsPage from '../../_shared/customer/DocumentsPage';
import PageModuleGuard from '../../_shared/PageModuleGuard';

export default async function CustomerDocumentsPage() {
  await requireRole('customer');
  return (
    <PageModuleGuard moduleKey="customer_documents">
      <DocumentsPage />
    </PageModuleGuard>
  );
}
