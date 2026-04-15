import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Briefcase, TrendingUp, Building } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-[82vh] flex flex-col items-center justify-center animate-in fade-in duration-1000 overflow-hidden rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-200/50 mt-2 p-8 lg:p-16">
      
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/bg-laptop.png" 
          alt="Professional Laptop placement" 
          className="w-full h-full object-cover opacity-80" 
        />
        {/* Deep blue gradient overlay for contrast and legibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-slate-900/90 backdrop-blur-[2px]"></div>
      </div>

      {/* Minimal Elegant Hero Content */}
      <div className="relative z-10 w-full max-w-5xl text-center px-4 transition-transform duration-500">
        
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-blue-100 font-semibold tracking-widest text-sm mb-8 shadow-2xl uppercase">
          SDSF Placement Portal
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-xl leading-[1.15] mb-6">
          Campus Placement <br/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-400">
            Management System
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-blue-100/90 font-medium max-w-3xl mx-auto mb-10 drop-shadow-md leading-relaxed">
          The ultimate bridge between talented students and top-tier companies. Discover opportunities, manage applications, and accelerate your career journey seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
          <Link to="/login" className="px-8 py-3.5 bg-blue-600/90 text-white backdrop-blur-sm border border-blue-500/50 rounded-full font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 hover:scale-105 transition-all duration-300 flex items-center gap-2 group">
            Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/register" className="px-8 py-3.5 bg-white/10 text-white backdrop-blur-md border border-white/20 rounded-full font-bold shadow-sm hover:bg-white/20 hover:scale-105 transition-all duration-300">
            Student Registration
          </Link>
        </div>

        {/* Feature Grid Restored with Minimal Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl group hover:-translate-y-2 transition-transform duration-300 hover:shadow-lg hover:border-blue-300/50">
            <div className="w-14 h-14 bg-blue-500/20 text-blue-300 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner border border-white/10">
              <Briefcase size={26} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live Opportunities</h3>
            <p className="text-blue-100/80 font-medium text-sm leading-relaxed">Access real-time placement drives and company recruitment announcements.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl group hover:-translate-y-2 transition-transform duration-300 hover:shadow-lg hover:border-emerald-300/50">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-300 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner border border-white/10">
              <TrendingUp size={26} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Eligibility</h3>
            <p className="text-blue-100/80 font-medium text-sm leading-relaxed">Automatically filters out drives so you only see exactly what you are qualified for.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl group hover:-translate-y-2 transition-transform duration-300 hover:shadow-lg hover:border-cyan-300/50">
            <div className="w-14 h-14 bg-cyan-500/20 text-cyan-300 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner border border-white/10">
              <Building size={26} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Company Insights</h3>
            <p className="text-blue-100/80 font-medium text-sm leading-relaxed">Detailed views on requirements, hiring stages, venues, and packages offered.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
