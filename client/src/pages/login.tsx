import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { FaGoogle, FaApple } from "react-icons/fa";
import { Mail, Phone } from "lucide-react";

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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-sm mx-auto text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-lg">
            Choose how you'd like to sign in
          </p>
        </div>

        {/* Login Options */}
        <div className="space-y-4">
          {/* Email Login */}
          <Button 
            onClick={handleEmailLogin}
            variant="outline"
            className="w-full flex items-center justify-center space-x-3 py-4 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium">Continue with Email</span>
          </Button>

          {/* Phone Login */}
          <Button 
            onClick={handlePhoneLogin}
            variant="outline"
            className="w-full flex items-center justify-center space-x-3 py-4 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Phone className="w-5 h-5" />
            <span className="font-medium">Continue with Phone</span>
          </Button>

          {/* Google Login */}
          <Button 
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full flex items-center justify-center space-x-3 py-4 border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-colors"
          >
            <FaGoogle className="w-5 h-5 text-red-500" />
            <span className="font-medium">Continue with Google</span>
          </Button>

          {/* Apple Login */}
          <Button 
            onClick={handleAppleLogin}
            variant="outline"
            className="w-full flex items-center justify-center space-x-3 py-4 border-2 border-gray-200 hover:border-gray-800 hover:bg-gray-50 transition-colors"
          >
            <FaApple className="w-5 h-5 text-gray-800" />
            <span className="font-medium">Continue with Apple</span>
          </Button>
        </div>

        {/* Back to Welcome */}
        <div className="pt-4">
          <Button 
            onClick={handleBack}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back to Welcome
          </Button>
        </div>
      </div>
    </div>
  );
}