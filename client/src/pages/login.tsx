import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { FaGoogle, FaApple } from "react-icons/fa";
import { Mail, Phone } from "lucide-react";
import KettlebellLogo from "@/components/ui/kettlebell-logo";

export default function Login() {
  const [, setLocation] = useLocation();

  const handleEmailLogin = () => {
    // For now, redirect to Replit auth - we'll enhance this later
    window.location.href = "/api/login";
  };

  const handlePhoneLogin = () => {
    // Placeholder for phone login implementation
    console.log("Phone login clicked");
  };

  const handleGoogleLogin = () => {
    // For now, redirect to Replit auth which handles OAuth
    window.location.href = "/api/login";
  };

  const handleAppleLogin = () => {
    // Placeholder for Apple login implementation
    console.log("Apple login clicked");
  };

  const handleBack = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm mx-auto text-center space-y-8">
        {/* Logo and Brand Section */}
        <div className="space-y-6">
          <KettlebellLogo className="w-32 h-40 mx-auto" />
          
          <div className="space-y-2">
            <h1 className="text-title1 font-black text-white/90 leading-none tracking-widest">
              BODY BUTLER
            </h1>
            <p className="text-body text-white/70 font-medium">
              Transformation tailored to you
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-headline text-white/90">
            Welcome Back
          </h2>
          <p className="text-body text-white/60">
            Choose how you'd like to sign in
          </p>
        </div>

        {/* Login Options */}
        <div className="space-y-4">
          {/* Email Login */}
          <Button 
            onClick={handleEmailLogin}
            variant="outline"
            className="w-full flex items-center justify-center space-x-3 py-4 glass-card border border-white/30 text-white hover:bg-white/10 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium">Continue with Email</span>
          </Button>

          {/* Phone Login */}
          <Button 
            onClick={handlePhoneLogin}
            variant="outline"
            className="w-full flex items-center justify-center space-x-3 py-4 glass-card border border-white/30 text-white hover:bg-white/10 transition-colors"
          >
            <Phone className="w-5 h-5" />
            <span className="font-medium">Continue with Phone</span>
          </Button>

          {/* Google Login */}
          <Button 
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full flex items-center justify-center space-x-3 py-4 glass-card border border-white/30 text-white hover:bg-white/10 transition-colors"
          >
            <FaGoogle className="w-5 h-5 text-red-400" />
            <span className="font-medium">Continue with Google</span>
          </Button>

          {/* Apple Login */}
          <Button 
            onClick={handleAppleLogin}
            variant="outline"
            className="w-full flex items-center justify-center space-x-3 py-4 glass-card border border-white/30 text-white hover:bg-white/10 transition-colors"
          >
            <FaApple className="w-5 h-5 text-white" />
            <span className="font-medium">Continue with Apple</span>
          </Button>
        </div>

        {/* Back to Welcome */}
        <div className="pt-4">
          <Button 
            onClick={handleBack}
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            ← Back to Welcome
          </Button>
        </div>
      </div>
    </div>
  );
}