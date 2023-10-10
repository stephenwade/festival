import { SignIn } from '@clerk/remix';

export default function SignInRoute() {
  return (
    <>
      <h2>Sign in</h2>
      <SignIn routing="path" path="/admin/sign-in" />
    </>
  );
}
