import AuthPage from "@/components/AuthPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password - LiveCanvas",
  description: "Reset your LiveCanvas account password",
};

export default function ForgotPasswordPage() {
  return <AuthPage mode="forgot-password" />;
}
