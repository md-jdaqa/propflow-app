import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata = {
  title: "Create account — PropFlow",
};

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md space-y-4">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold text-heading">
          Create your PropFlow account
        </h1>
        <p className="text-sm text-muted">
          Track properties, tenants, and Schedule E in one place.
        </p>
      </header>
      <SignUpForm />
    </div>
  );
}
