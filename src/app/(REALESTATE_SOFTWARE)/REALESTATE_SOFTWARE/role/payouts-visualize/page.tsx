import { requireAnyRole } from '../_shared/auth';
import VisualizePayoutClient from './VisualizePayoutClient';

export default async function VisualizePayoutPage({ searchParams }: { searchParams: Promise<{ registrationId?: string }> }) {
  await requireAnyRole(['it', 'operation_manager']);
  const { registrationId } = await searchParams;
  return <VisualizePayoutClient registrationId={registrationId || null} />;
}
