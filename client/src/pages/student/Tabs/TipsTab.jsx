import React from 'react';
import { Lightbulb, FileText, CheckCircle, Target, BookOpen } from 'lucide-react';

export default function TipsTab() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex border-b border-slate-200 pb-4 items-center justify-between">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500 flex items-center gap-2">
          <Lightbulb className="text-amber-500" /> Preparation & Tips
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Placement Eligibility Tips */}
        <div className="glass-card p-8 border-t-4 border-t-emerald-500 hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
              <Target size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Boosting Eligibility</h3>
          </div>
          <p className="text-slate-600 mb-6 font-medium">Follow these guidelines to maximize your chances of crossing the eligibility threshold for top-tier companies.</p>
          
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-emerald-500 mt-1 shrink-0" size={18} />
              <div>
                <strong className="text-slate-800 block">Maintain a Strong CGPA (7.5+)</strong>
                <span className="text-sm text-slate-600">Most premium product-based companies set their minimum cutoff around 7.5 to 8.0. Focus on core subjects.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-emerald-500 mt-1 shrink-0" size={18} />
              <div>
                <strong className="text-slate-800 block">Clear Active Backlogs Quickly</strong>
                <span className="text-sm text-slate-600">Over 90% of drives strictly require zero active backlogs at the time of application.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-emerald-500 mt-1 shrink-0" size={18} />
              <div>
                <strong className="text-slate-800 block">Acquire Relevant Certifications</strong>
                <span className="text-sm text-slate-600">AWS, Azure, or specialized coding certifications can sometimes offset a slightly lower CGPA.</span>
              </div>
            </li>
             <li className="flex items-start gap-3">
              <CheckCircle className="text-emerald-500 mt-1 shrink-0" size={18} />
              <div>
                <strong className="text-slate-800 block">Master Data Structures & Algorithms</strong>
                <span className="text-sm text-slate-600">The first round for almost every company is a coding assessment based heavily on DSA. Practice daily on platforms like LeetCode.</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Resume Building Tips */}
        <div className="glass-card p-8 border-t-4 border-t-blue-500 hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
              <FileText size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">The Perfect Resume</h3>
          </div>
          <p className="text-slate-600 mb-6 font-medium">Your resume is your first impression. Make it impactful, concise, and ATS-friendly.</p>
          
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <BookOpen className="text-blue-500 mt-1 shrink-0" size={18} />
              <div>
                <strong className="text-slate-800 block">Keep it to One Page</strong>
                <span className="text-sm text-slate-600">Recruiters spend ~6 seconds scanning a resume. Highlight your best projects and keep it brief.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <BookOpen className="text-blue-500 mt-1 shrink-0" size={18} />
              <div>
                <strong className="text-slate-800 block">Use the STAR Method</strong>
                <span className="text-sm text-slate-600">For experience, explain the Situation, Task, Action, and Result. Use metrics (e.g., "Increased performance by 20%").</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <BookOpen className="text-blue-500 mt-1 shrink-0" size={18} />
              <div>
                <strong className="text-slate-800 block">Action Verbs & Keywords</strong>
                <span className="text-sm text-slate-600">Start bullet points with verbs like 'Developed', 'Engineered', 'Led'. Match keywords to the job description.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <BookOpen className="text-blue-500 mt-1 shrink-0" size={18} />
              <div>
                <strong className="text-slate-800 block">Link to Live Projects / GitHub</strong>
                <span className="text-sm text-slate-600">Always include clickable links to your live projects, GitHub repository, and LinkedIn profile.</span>
              </div>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
