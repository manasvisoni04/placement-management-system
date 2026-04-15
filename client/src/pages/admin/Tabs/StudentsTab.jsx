import React, { useState } from 'react';
import { Users, GraduationCap, Mail, FileCode2, ChevronDown, ChevronUp, FileText, Briefcase, Award, Link as LinkIcon, Linkedin, Github } from 'lucide-react';

export default function StudentsTab({ students }) {
  const [expandedStudent, setExpandedStudent] = useState(null);

  const toggleExpand = (id) => {
    if (expandedStudent === id) setExpandedStudent(null);
    else setExpandedStudent(id);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="text-primary-600" /> Registered Students
        </h3>
        <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
          Total: {students.length}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">Student Name</th>
                <th className="p-4 font-semibold">Branch</th>
                <th className="p-4 font-semibold text-center">CGPA</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    No students have registered yet.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <React.Fragment key={student.student_id}>
                    <tr
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${expandedStudent === student.student_id ? 'bg-slate-50' : ''}`}
                      onClick={() => toggleExpand(student.student_id)}
                    >
                      <td className="p-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{student.name}</div>
                            <div className="text-xs text-slate-400 font-medium">ID: STU-{student.student_id.toString().padStart(4, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-slate-100">
                        <span className="flex items-center gap-1.5 text-slate-600 font-medium text-sm">
                          <FileCode2 size={16} className="text-slate-400" />
                          {student.branch}
                        </span>
                      </td>
                      <td className="p-4 text-center border-b border-slate-100">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-sm font-bold ${student.cgpa >= 8.0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          <GraduationCap size={16} className="mr-1" />
                          {student.cgpa}
                        </span>
                      </td>
                      <td className="p-4 border-b border-slate-100">
                        <a href={`mailto:${student.email}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                          <Mail size={16} />
                          {student.email}
                        </a>
                      </td>
                      <td className="p-4 text-right border-b border-slate-100">
                        <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
                          {expandedStudent === student.student_id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Content Area */}
                    {expandedStudent === student.student_id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan="5" className="p-0 border-b border-slate-200">
                          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-200">

                            {/* Left Column */}
                            <div className="space-y-6">
                              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><GraduationCap size={14} className="text-indigo-500" /> Academic Profile</h4>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                  <div>
                                    <p className="text-slate-500 text-xs font-semibold mb-0.5">Roll No</p>
                                    <p className="font-medium text-slate-800">{student.roll_no || <span className="text-slate-400 italic">Not provided</span>}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500 text-xs font-semibold mb-0.5">Enrollment No</p>
                                    <p className="font-medium text-slate-800">{student.enrollment_no || <span className="text-slate-400 italic">Not provided</span>}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500 text-xs font-semibold mb-0.5">Course & Batch</p>
                                    <p className="font-medium text-slate-800">
                                      {student.course ? `${student.course} '${student.batch ? student.batch.toString().slice(-2) : 'XX'}` : <span className="text-slate-400 italic">Not provided</span>}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500 text-xs font-semibold mb-0.5">Department</p>
                                    <p className="font-medium text-slate-800">{student.department || <span className="text-slate-400 italic">Not provided</span>}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Award size={14} className="text-teal-500" /> Skills</h4>
                                {student.skills ? (
                                  <div className="flex flex-wrap gap-2">
                                    {student.skills.split(',').map((skill, idx) => (
                                      <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-semibold shadow-sm">
                                        {skill.trim()}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500 italic">No skills listed</p>
                                )}
                              </div>

                              <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Briefcase size={14} className="text-amber-500" /> Experience</h4>
                                {student.experience ? (
                                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{student.experience}</p>
                                ) : (
                                  <p className="text-sm text-slate-500 italic">No experience added</p>
                                )}
                              </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                              <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Award size={14} className="text-purple-500" /> Certifications</h4>
                                {student.certifications ? (
                                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{student.certifications}</p>
                                ) : (
                                  <p className="text-sm text-slate-500 italic">No certifications added</p>
                                )}
                              </div>

                              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-inner space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><LinkIcon size={14} className="text-slate-500" /> Social Portfolios</h4>

                                <div className="space-y-2">
                                  {student.linkedin_url ? (
                                    <a href={student.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-white p-2 rounded-lg border border-slate-200 hover:border-blue-300">
                                      <Linkedin size={18} /> LinkedIn Profile
                                    </a>
                                  ) : (
                                    <div className="flex items-center gap-2 text-sm text-slate-400 italic bg-white p-2 rounded-lg border border-slate-100">
                                      <Linkedin size={18} className="opacity-50" /> No LinkedIn linked
                                    </div>
                                  )}

                                  {student.github_url ? (
                                    <a href={student.github_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors bg-white p-2 rounded-lg border border-slate-200 hover:border-slate-400">
                                      <Github size={18} /> GitHub Profile
                                    </a>
                                  ) : (
                                    <div className="flex items-center gap-2 text-sm text-slate-400 italic bg-white p-2 rounded-lg border border-slate-100">
                                      <Github size={18} className="opacity-50" /> No GitHub linked
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><FileText size={14} className="text-blue-500" /> Uploaded Resume</h4>
                                {student.resume_url ? (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">Resume available</span>
                                    <a
                                      href={student.resume_url.startsWith('http') ? student.resume_url : `http://localhost:5000${student.resume_url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={e => e.stopPropagation()}
                                      className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                    >
                                      <LinkIcon size={16} /> View/Download PDF
                                    </a>
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500 italic">Student has not uploaded a resume.</p>
                                )}
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
