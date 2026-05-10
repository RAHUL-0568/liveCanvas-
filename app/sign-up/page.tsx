import AuthPage from "@/components/AuthPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - LiveCanvas",
  description: "Create a new LiveCanvas account",
};

export default function SignUpPage() {
  return <AuthPage mode="signup" />;
}
