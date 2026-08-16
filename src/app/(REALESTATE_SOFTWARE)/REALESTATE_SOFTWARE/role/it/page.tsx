import { redirect } from 'next/navigation';

export default function ITRootPage() {
  // Simply redirect to the new user management folder so the UX remains seamless
  redirect('/REALESTATE_SOFTWARE/role/it/users');
}
