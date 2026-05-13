"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 overflow-hidden transition-colors duration-500">
      
      {/* Dynamic Background Elements - Adaptive to Theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      {/* Glassmorphism Container */}
      <div className="relative z-10 w-full max-w-lg p-8 sm:p-12 rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-700">
        
        {/* Animated Image Container */}
        <div className="relative group mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl animate-float">
            <Image
              src="/image-1080501608487063.jpg"
              alt="404 Illustration"
              fill
              className="object-cover transform transition-transform duration-700 group-hover:scale-110"
              priority
            />
          </div>
        </div>
        
        {/* Text Section */}
        <div className="space-y-4 mb-10 section-fade-in">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 mb-2">
            Error 404
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Lost in Space?
          </h1>
          <p className="text-muted-foreground text-lg max-w-xs mx-auto leading-relaxed">
            The page you're looking for has vanished into the digital void.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full section-fade-in delay-300">
          <Button 
            onClick={() => router.back()}
            variant="outline" 
            size="lg" 
            className="h-14 rounded-2xl border-border bg-background/50 hover:bg-accent hover:text-accent-foreground gap-2 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          
          <Button asChild size="lg" className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] gap-2 transition-all active:scale-95">
            <Link href="/dashboard">
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Decorative Floating Icon */}
      <div className="absolute top-1/4 right-1/4 text-primary/5 animate-float hidden lg:block" style={{ animationDelay: '1s' }}>
          <MoveLeft size={120} />
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .section-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
}
