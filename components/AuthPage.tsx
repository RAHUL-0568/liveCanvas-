"use client";

import React, { useEffect, useRef } from "react";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";
import "firebaseui/dist/firebaseui.css";

interface AuthPageProps {
  mode: "signin" | "signup";
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const uiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // FirebaseUI only works in the browser
    const initFirebaseUI = async () => {
      const firebaseui = await import("firebaseui");
      
      // Use singleton instance of FirebaseUI
      const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

      const uiConfig = {
        signInSuccessUrl: "/dashboard",
        signInOptions: [
          {
            provider: EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: true,
          },
          GoogleAuthProvider.PROVIDER_ID,
        ],
        credentialHelper: firebaseui.auth.CredentialHelper.NONE,
        // Set sign-in or sign-up flow
        callbacks: {
          signInSuccessWithAuthResult: () => {
            // Redirect to dashboard after success
            window.location.assign("/dashboard");
            return false;
          },
        },
        signInFlow: "popup",
      };

      if (uiContainerRef.current) {
        ui.start(uiContainerRef.current, uiConfig);
      }
    };

    initFirebaseUI();

    // Clean up on unmount
    return () => {
      // Note: AuthUI.getInstance().reset() or similar if needed
    };
  }, [mode]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" 
              ? "Sign in to your account to continue" 
              : "Sign up to start collaborating on LiveCanvas"}
          </p>
        </div>
        
        <div id="firebaseui-auth-container" ref={uiContainerRef}></div>
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          {mode === "signin" ? (
            <p>
              Don&apos;t have an account?{" "}
              <a href="/sign-up" className="font-medium text-primary hover:underline">
                Sign up
              </a>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <a href="/sign-in" className="font-medium text-primary hover:underline">
                Sign in
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
