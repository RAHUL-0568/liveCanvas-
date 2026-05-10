import AuthPage from "@/components/AuthPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - LiveCanvas",
  description: "Sign in to your LiveCanvas account",
};

export default function SignInPage() {
  return <AuthPage mode="signin" />;
}
