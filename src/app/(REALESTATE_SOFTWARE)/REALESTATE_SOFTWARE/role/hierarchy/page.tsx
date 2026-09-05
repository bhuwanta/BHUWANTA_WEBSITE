import { requireRole } from '../_shared/auth';
import HierarchyPageClient from './HierarchyPageClient';

export default async function ITHierarchyPage() {
  await requireRole('it');
  return <HierarchyPageClient />;
}
