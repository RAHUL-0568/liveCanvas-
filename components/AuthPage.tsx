"use client";

import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  Github,
  Mail,
  Chrome,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Facebook,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AuthPageProps {
  mode: "signin" | "signup" | "forgot-password";
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSocialLogin = async (providerName: "google" | "github" | "facebook") => {
    setSocialLoading(providerName);
    let provider;
    
    if (providerName === "google") {
      provider = new GoogleAuthProvider();
    } else if (providerName === "github") {
      provider = new GithubAuthProvider();
    } else {
      provider = new FacebookAuthProvider();
    }

    try {
      await signInWithPopup(auth, provider);
      toast.success("Welcome to LiveCanvas!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Social login failed");
    } finally {
      setSocialLoading(null);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
        toast.success("Account created successfully!");
        router.push("/dashboard");
      } else if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Signed in successfully!");
        router.push("/dashboard");
      } else if (mode === "forgot-password") {
        await sendPasswordResetEmail(auth, email);
        toast.success("Password reset email sent! Check your inbox.");
        router.push("/sign-in");
      }
    } catch (error: any) {
      let message = "Authentication failed";
      if (error.code === "auth/user-not-found") message = "No account found with this email";
      if (error.code === "auth/wrong-password") message = "Incorrect password";
      if (error.code === "auth/email-already-in-use") message = "Email already in use";
      toast.error(error.message || message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background transition-colors duration-500">
      {/* Left Side: Brand & Visual (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden text-white">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: "url('/auth-hero.jpg')" }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/60" />

        <div className="z-10 flex items-center gap-3">
          <div className="p-2.5 bg-primary/20 backdrop-blur-md rounded-xl border border-white/10 shadow-xl">
            <Command className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">
            Live<span className="text-primary">Canvas</span>
          </span>
        </div>

        <div className="z-10 space-y-6">
          <h1 className="text-5xl font-extrabold tracking-tighter leading-none drop-shadow-lg">
            Design, Code, <br />
            <span className="text-primary">Collaborate.</span>
          </h1>
          <p className="text-zinc-200 text-lg max-w-md drop-shadow-md">
            The ultimate tool for engineering teams. Build diagrams as code, 
            edit markdown, and collaborate in real-time.
          </p>
        </div>

        <div className="z-10 text-sm text-zinc-400 flex gap-6">
          <span>&copy; 2026 LiveCanvas</span>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex items-center justify-center p-8 bg-background relative">
        {/* Mobile Header */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
          <Command className="w-6 h-6 text-primary" />
          <span className="font-bold">LiveCanvas</span>
        </div>

        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              {mode === "signin" 
                ? "Welcome back" 
                : mode === "signup" 
                ? "Create an account" 
                : "Reset password"}
            </h2>
            <p className="text-muted-foreground">
              {mode === "signin"
                ? "Enter your credentials to access your workspace"
                : mode === "signup"
                ? "Enter your details to get started with LiveCanvas"
                : "Enter your email to receive a password reset link"}
            </p>
          </div>

          {mode !== "forgot-password" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="h-12 text-sm font-semibold group px-2"
                  onClick={() => handleSocialLogin("google")}
                  disabled={socialLoading !== null}
                >
                  {socialLoading === "google" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Chrome className="mr-2 h-4 w-4 text-red-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                  )}
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="h-12 text-sm font-semibold group px-2"
                  onClick={() => handleSocialLogin("github")}
                  disabled={socialLoading !== null}
                >
                  {socialLoading === "github" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Github className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                  )}
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  className="h-12 text-sm font-semibold group px-2"
                  onClick={() => handleSocialLogin("facebook")}
                  disabled={socialLoading !== null}
                >
                  {socialLoading === "facebook" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Facebook className="mr-2 h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                  )}
                  Facebook
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
              />
            </div>
            {mode !== "forgot-password" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <a href="/forgot-password" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </a>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "signin" 
                    ? "Sign In" 
                    : mode === "signup" 
                    ? "Sign Up" 
                    : "Send Reset Link"}
                  {mode === "forgot-password" ? (
                    <Mail className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <a
                  href="/sign-up"
                  className="text-primary font-semibold hover:underline"
                >
                  Sign up
                </a>
              </>
            ) : (
              <>
                {mode === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <a
                      href="/sign-in"
                      className="text-primary font-semibold hover:underline"
                    >
                      Sign in
                    </a>
                  </>
                ) : (
                  <a
                    href="/sign-in"
                    className="text-primary font-semibold hover:underline inline-flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to sign in
                  </a>
                )}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
