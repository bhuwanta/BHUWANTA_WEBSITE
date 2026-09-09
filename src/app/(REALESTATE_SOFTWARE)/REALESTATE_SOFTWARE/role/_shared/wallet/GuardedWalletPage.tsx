import { notFound } from 'next/navigation';
import WalletPage from './WalletPage';
import { requireCanViewWallet } from './actions';

/** My Wallet behind its module gate. Rendered by every sales tier's
 * route file rather than WalletPage directly — the per-role literal
 * routes (role/lia/wallet, role/director/wallet, …) outrank
 * role/[roleCode]/wallet, so a guard on the dynamic fallback alone
 * would never run for any of them. */
export default async function GuardedWalletPage() {
  const allowed = await requireCanViewWallet();
  if (!allowed.ok) notFound();
  return <WalletPage />;
}
