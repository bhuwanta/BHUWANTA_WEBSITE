import { requireRole } from '../../_shared/auth';
import WalletPage from '../../_shared/wallet/WalletPage';

export default async function GoverningCouncilWalletPage() {
  await requireRole('governing_council');
  return <WalletPage />;
}
