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

  const handleGetStarted = () => {
    setLocation("/onboarding");
  };



  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm mx-auto text-center flex flex-col h-full justify-center space-y-12">
        {/* Logo and Brand Section */}
        <div className="space-y-2">
          <KettlebellLogo className="w-40 h-40 mx-auto" />
          
          <div className="space-y-3">
            <h1 className="text-4xl font-black text-white/90 leading-none tracking-widest">
              BODY BUTLER
            </h1>
            <p className="text-lg text-white/70 font-medium">
              Transformation tailored to you
            </p>
          </div>
        </div>



        {/* Login Section */}
        <div className="space-y-6">
          {/* Social Login Options */}
          <div className="space-y-3">
            {/* Google Login */}
            <Button 
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full flex items-center justify-center space-x-3 py-3 glass-card border border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              <FaGoogle className="w-4 h-4 text-red-400" />
              <span className="font-medium text-sm">Continue with Google</span>
            </Button>

            {/* Apple Login */}
            <Button 
              onClick={handleAppleLogin}
              variant="outline"
              className="w-full flex items-center justify-center space-x-3 py-3 glass-card border border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              <FaApple className="w-4 h-4 text-white" />
              <span className="font-medium text-sm">Continue with Apple</span>
            </Button>
          </div>

          {/* Social Login Divider */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="text-white/60 text-xs">or</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* Email/Phone Login Form */}
          <div className="space-y-4">
            {/* Email or Phone Input */}
            <input
              type="text"
              placeholder="Email or phone number"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500/50 focus:outline-none transition-colors text-sm"
            />
            
            {/* Password Input */}
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-500/50 focus:outline-none transition-colors text-sm"
            />
            
            {/* Forgot Password Link */}
            <div className="text-center">
              <button className="text-white/60 hover:text-white/80 text-xs font-bold transition-colors">
                Forgot your password?
              </button>
            </div>
            
            {/* Login Button */}
            <Button 
              onClick={handleEmailLogin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-colors text-sm"
            >
              LOG IN
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-white/60 text-xs">
              New to Body Butler?{' '}
              <button 
                onClick={handleGetStarted}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}