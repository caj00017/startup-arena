import { VerifyEmail } from "@/components/verify-email";

export const metadata = { title: "Verify email" };

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto max-w-lg px-5 py-16 sm:py-24">
      <VerifyEmail />
    </div>
  );
}
