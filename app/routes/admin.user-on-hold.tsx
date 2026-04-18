import { UserOnHoldPageGuard } from './auth-route-guards';

export default function UserOnHold() {
  return (
    <UserOnHoldPageGuard>
      <title>On hold | Festival admin</title>
      <h2>On hold</h2>
      <p>Ask an admin to add your email address to the allowlist.</p>
    </UserOnHoldPageGuard>
  );
}
