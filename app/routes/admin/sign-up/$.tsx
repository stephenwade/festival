import { SignUp } from '@clerk/remix';

export default function SignUpRoute() {
  return (
    <>
      <h2>Sign up</h2>
      <SignUp routing="path" path="/admin/sign-up" />
    </>
  );
}
