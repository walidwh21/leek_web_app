import { UpdatePasswordForm } from "./update-password-form";

export const metadata = {
  title: "Set new password — LEEK",
};

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-8">
      <UpdatePasswordForm />
    </div>
  );
}
