"use client";

import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AuthPageProps {
  mode: "signin" | "signup";
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSocialLogin = async (providerName: "google" | "github") => {
    setSocialLoading(providerName);
    const provider =
      providerName === "google"
        ? new GoogleAuthProvider()
        : new GithubAuthProvider();

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
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Signed in successfully!");
      }
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
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

        <div className="z-10 flex items-center gap-2">
          <div className="p-2 bg-primary rounded-xl">
            <Command className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight uppercase">LiveCanvas</span>
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
              {mode === "signin" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-muted-foreground">
              {mode === "signin"
                ? "Enter your credentials to access your workspace"
                : "Enter your details to get started with LiveCanvas"}
            </p>
          </div>

          <div className="grid gap-4">
            <Button
              variant="outline"
              className="h-12 text-base font-semibold group"
              onClick={() => handleSocialLogin("google")}
              disabled={socialLoading !== null}
            >
              {socialLoading === "google" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Chrome className="mr-2 h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" />
              )}
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="h-12 text-base font-semibold group"
              onClick={() => handleSocialLogin("github")}
              disabled={socialLoading !== null}
            >
              {socialLoading === "github" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Github className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              )}
              Continue with GitHub
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" && (
                  <a href="#" className="text-xs text-primary hover:underline">
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
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign In" : "Sign Up"}
                  <ArrowRight className="ml-2 h-4 w-4" />
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
                Already have an account?{" "}
                <a
                  href="/sign-in"
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
