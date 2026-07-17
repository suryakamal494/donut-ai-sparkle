// Student Login Page - Premium warm design with seamlessly blended illustration
// Responsive: Side-by-side (desktop/tablet), Blended top (mobile) - NO SCROLLING

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, ArrowRight } from "lucide-react";
import DonutLogo from "@/components/shared/DonutLogo";
import { useState } from "react";
import { motion } from "framer-motion";
import aiCompanionIllustration from "@/assets/student/ai-companion-illustration.png";

const StudentLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/student/dashboard");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  const illustrationVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut" as const
      }
    }
  };

  const blobVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-white">
      
      {/* ========== LEFT SIDE: Illustration Area (Desktop/Tablet) ========== */}
      <div className="hidden md:flex md:w-[50%] lg:w-[50%] h-full relative bg-gradient-to-br from-amber-50 via-orange-100/80 to-rose-100/70 items-center justify-center overflow-hidden">
        
        {/* Organic gradient blobs - animated */}
        <motion.div 
          className="absolute inset-0"
          initial="hidden"
          animate="visible"
          variants={blobVariants}
        >
          <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[45%] bg-gradient-to-br from-donut-coral/20 to-donut-pink/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[55%] bg-gradient-to-tl from-amber-200/25 to-orange-100/15 rounded-full blur-3xl" />
          <div className="absolute top-[35%] left-[10%] w-[25%] h-[25%] bg-rose-200/20 rounded-full blur-2xl" />
          <div className="absolute bottom-[20%] left-[40%] w-[20%] h-[20%] bg-amber-100/30 rounded-full blur-2xl" />
        </motion.div>
        
        {/* Floating sparkle particles */}
        <motion.div 
          className="absolute top-[12%] left-[18%] w-2 h-2 bg-donut-coral/40 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-[22%] right-[22%] w-2.5 h-2.5 bg-amber-400/35 rounded-full"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.35, 0.6, 0.35]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        />
        <motion.div 
          className="absolute bottom-[28%] left-[12%] w-2 h-2 bg-rose-300/40 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.65, 0.4]
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        />
        <motion.div 
          className="absolute top-[55%] right-[12%] w-1.5 h-1.5 bg-orange-300/35 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.35, 0.6, 0.35]
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        
        {/* Main illustration - animated entrance */}
        <motion.div 
          className="relative z-10 flex items-center justify-center w-full h-full"
          initial="hidden"
          animate="visible"
          variants={illustrationVariants}
        >
          <div className="relative w-[70%] max-w-[380px] lg:max-w-[420px]">
            {/* Soft glow behind illustration */}
            <div className="absolute inset-0 bg-gradient-radial from-amber-100/50 via-transparent to-transparent rounded-full blur-3xl scale-150" />
            <img 
              src={aiCompanionIllustration} 
              alt="Student with AI learning companion" 
              className="relative w-full h-auto drop-shadow-xl"
              style={{
                maskImage: 'radial-gradient(ellipse 85% 80% at 50% 45%, black 55%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at 50% 45%, black 55%, transparent 100%)'
              }}
            />
          </div>
        </motion.div>
        
        {/* Smooth curved edge transition to form area */}
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white via-white/80 to-transparent" />
      </div>

      {/* ========== MOBILE: Blended Top Illustration ========== */}
      <motion.div 
        className="md:hidden relative w-full h-[28%] min-h-[160px] max-h-[200px] bg-gradient-to-b from-amber-50 via-orange-100/70 to-white overflow-hidden flex-shrink-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        
        {/* Organic gradient blobs */}
        <div className="absolute top-[-25%] left-[-20%] w-[65%] h-[90%] bg-gradient-to-br from-donut-coral/15 to-donut-pink/8 rounded-full blur-3xl" />
        <div className="absolute top-[5%] right-[-15%] w-[45%] h-[70%] bg-gradient-to-tl from-amber-200/20 to-transparent rounded-full blur-3xl" />
        
        {/* Floating particles */}
        <motion.div 
          className="absolute top-[18%] left-[12%] w-1.5 h-1.5 bg-donut-coral/40 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-[28%] right-[18%] w-2 h-2 bg-amber-400/35 rounded-full"
          animate={{ scale: [1, 1.4, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        />
        
        {/* Illustration - animated entrance */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <img 
            src={aiCompanionIllustration} 
            alt="Student with AI companion" 
            className="w-[55%] max-w-[200px] h-auto drop-shadow-lg"
            style={{
              maskImage: 'radial-gradient(ellipse 90% 85% at 50% 40%, black 50%, transparent 95%)',
              WebkitMaskImage: 'radial-gradient(ellipse 90% 85% at 50% 40%, black 50%, transparent 95%)'
            }}
          />
        </motion.div>
        
        {/* Organic curved bottom edge */}
        <div 
          className="absolute -bottom-1 left-0 right-0 h-16 bg-white"
          style={{
            borderRadius: '60% 60% 0 0 / 100% 100% 0 0'
          }}
        />
      </motion.div>

      {/* ========== RIGHT SIDE / BOTTOM: Login Form ========== */}
      <div className="flex-1 flex flex-col bg-white relative overflow-hidden md:h-full">
        
        {/* Back button - animated */}
        <motion.button 
          onClick={() => navigate("/")}
          className="absolute top-3 left-4 md:top-5 md:left-6 z-20 flex items-center gap-1.5 text-muted-foreground/70 hover:text-foreground transition-colors p-2 rounded-xl hover:bg-muted/30"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </motion.button>

        {/* Form container - centered with staggered animations */}
        <div className="flex-1 flex items-center justify-center px-6 md:px-10 lg:px-16">
          <motion.div 
            className="w-full max-w-[360px]"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            
            {/* Branding - compact */}
            <motion.div 
              className="flex items-center gap-2 mb-5 md:mb-6"
              variants={itemVariants}
            >
              <DonutLogo size={36} />
              <span className="text-sm md:text-base font-bold bg-gradient-to-r from-donut-coral to-donut-pink bg-clip-text text-transparent">theDonutAI</span>
            </motion.div>

            {/* Heading - clear and simple */}
            <motion.div 
              className="mb-5 md:mb-6"
              variants={itemVariants}
            >
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1">
                Login
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Your AI learning companion awaits
              </p>
            </motion.div>

            {/* Login form - compact with staggered animations */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Phone number input */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 text-sm font-medium border-r border-muted/30 pr-2.5">
                    +91
                  </span>
                  <Input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-12 md:h-13 pl-14 pr-4 rounded-xl border-muted/40 bg-muted/15 text-base placeholder:text-muted-foreground/40 focus:border-donut-coral focus:ring-2 focus:ring-donut-coral/20 focus:bg-white transition-all"
                  />
                </div>
              </motion.div>

              {/* Password input */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 md:h-13 px-4 pr-11 rounded-xl border-muted/40 bg-muted/15 text-base placeholder:text-muted-foreground/40 focus:border-donut-coral focus:ring-2 focus:ring-donut-coral/20 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Forgot password */}
              <motion.div 
                className="flex justify-end pt-0.5"
                variants={itemVariants}
              >
                <button 
                  type="button"
                  className="text-sm text-donut-coral hover:text-donut-pink transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </motion.div>

              {/* Login button - pill-shaped, asymmetric right-aligned on desktop */}
              <motion.div 
                className="pt-1 md:pt-2 flex justify-center md:justify-end"
                variants={itemVariants}
              >
                <Button 
                  type="submit"
                  className="h-14 px-10 md:px-12 rounded-full text-base font-semibold gradient-button shadow-xl shadow-donut-coral/25 hover:shadow-2xl hover:shadow-donut-coral/35 transition-all duration-300 hover:scale-[1.02] group w-full md:w-auto"
                >
                  <span>Login</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </form>

            {/* Help text - subtle */}
            <motion.div 
              className="mt-6 md:mt-8 text-center md:text-left"
              variants={itemVariants}
            >
              <p className="text-xs text-muted-foreground/60">
                Need help? <span className="text-donut-coral/80 hover:text-donut-coral cursor-pointer transition-colors">Contact your institute</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
