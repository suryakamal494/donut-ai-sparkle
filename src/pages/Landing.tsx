import { useNavigate } from "react-router-dom";
import { Sparkles, Building2, Shield, ArrowRight, GraduationCap, BookHeart, Trophy } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-donut-coral via-donut-orange to-donut-pink" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-donut-pink/20 rounded-full blur-2xl" />
      
      {/* Floating Shapes */}
      <div className="absolute top-32 right-1/4 w-4 h-4 bg-white/30 rounded-full animate-pulse" />
      <div className="absolute bottom-40 left-1/3 w-6 h-6 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-1/3 right-32 w-3 h-3 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl animate-scale-in">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl mb-6 shadow-2xl border border-white/30">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">DonutAI</h1>
          <p className="text-xl text-white/80">Smart Education Platform</p>
        </div>

        {/* Portal Selection Cards */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 px-4">
          {/* Superadmin Card */}
          <button
            onClick={() => navigate("/superadmin/dashboard")}
            className="group relative overflow-hidden rounded-3xl p-6 md:p-8 text-left transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
          >
            {/* Card Background */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-2xl border border-white/30" />
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-indigo-500/0 group-hover:from-purple-500/10 group-hover:to-indigo-500/10 transition-all duration-500" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 md:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                Superadmin
                <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Platform management, institutes, global content
              </p>
              
              <div className="mt-4 md:mt-6 flex items-center gap-2 text-sm text-purple-600 font-medium">
                <span>Access Control Panel</span>
              </div>
            </div>
          </button>

          {/* Institute Card */}
          <button
            onClick={() => navigate("/institute/dashboard")}
            className="group relative overflow-hidden rounded-3xl p-6 md:p-8 text-left transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
          >
            {/* Card Background */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-2xl border border-white/30" />
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-donut-coral/0 to-donut-pink/0 group-hover:from-donut-coral/10 group-hover:to-donut-pink/10 transition-all duration-500" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl gradient-button flex items-center justify-center mb-4 md:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                Institute
                <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage batches, teachers, students, timetables & exams
              </p>
              
              <div className="mt-4 md:mt-6 flex items-center gap-2 text-sm font-medium gradient-text">
                <span>Enter Institute Panel</span>
              </div>
            </div>
          </button>

          {/* Teacher Card */}
          <button
            onClick={() => navigate("/teacher/dashboard")}
            className="group relative overflow-hidden rounded-3xl p-6 md:p-8 text-left transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
          >
            {/* Card Background */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-2xl border border-white/30" />
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-cyan-500/0 group-hover:from-teal-500/10 group-hover:to-cyan-500/10 transition-all duration-500" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-teal-500/25 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                Teacher
                <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Daily teaching workspace, lesson plans & assessments
              </p>
              
              <div className="mt-4 md:mt-6 flex items-center gap-2 text-sm font-medium text-teal-600">
                <span>Open Teaching Portal</span>
              </div>
            </div>
          </button>

          {/* Student Card - Completely separate module */}
          <button
            onClick={() => navigate("/student/login")}
            className="group relative overflow-hidden rounded-3xl p-6 md:p-8 text-left transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
          >
            {/* Card Background */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-2xl border border-white/30" />
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-rose-400/0 group-hover:from-amber-400/10 group-hover:to-rose-400/10 transition-all duration-500" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-amber-400/25 group-hover:scale-110 transition-transform duration-300">
                <BookHeart className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                Student
                <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Personalized learning journey with AI guidance
              </p>
              
              <div className="mt-4 md:mt-6 flex items-center gap-2 text-sm font-medium text-amber-600">
                <span>Start Learning</span>
              </div>
            </div>
          </button>
        </div>

        {/* RiTX Competition Card - separate row */}
        <div className="mt-4 px-4">
          <button
            onClick={() => navigate("/ritx")}
            className="group relative overflow-hidden rounded-3xl p-6 md:p-8 text-left transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl w-full"
          >
            <div className="absolute inset-0 bg-white/90 backdrop-blur-2xl border border-white/30" />
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/0 to-indigo-500/0 group-hover:from-fuchsia-500/10 group-hover:to-indigo-500/10 transition-all duration-500" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                  RiTX — Young Innovators Challenge
                  <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Competition management for schools · Admin, Team & Judge portals
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm font-medium text-fuchsia-600">
                <span>Enter</span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-white/60 text-sm">
            Powered by <span className="text-white font-semibold">DonutAI</span> • Smart Education for Everyone
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
