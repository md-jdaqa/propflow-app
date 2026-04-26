import { SignInForm } from "@/components/auth/SignInForm";

export const metadata = {
  title: "Sign in — PropFlow",
};

export default function SignInPage() {
  return (
    <div className="w-full max-w-md space-y-4">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold text-heading">Sign in to PropFlow</h1>
        <p className="text-sm text-muted">
          AI-powered property management for landlords.
        </p>
      </header>
      <SignInForm />
    </div>
  );
}
