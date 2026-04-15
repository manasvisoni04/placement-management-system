import { db, auth } from '../firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';

// Helper to extract ID params using regex
const matchRoute = (route, pattern) => {
  const match = route.match(pattern);
  return match ? match[1] : null;
};

const api = {
  get: async (url) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    try {
      if (url === '/admin/dashboard') {
        const [cRes, dRes, aRes, skRes, stRes, nRes, qRes] = await Promise.all([
          getDocs(collection(db, 'companies')),
          getDocs(collection(db, 'drives')),
          getDocs(collection(db, 'applications')),
          getDocs(collection(db, 'skills')),
          getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
          getDocs(collection(db, 'notifications')),
          getDocs(collection(db, 'queries'))
        ]);
        
        return {
          data: {
            stats: {
              totalCompanies: cRes.docs.length,
              totalStudents: stRes.docs.length,
              totalDrives: dRes.docs.length,
              totalNotifications: nRes.docs.length,
              totalApplications: aRes.docs.length
            },
            companies: cRes.docs.map(d => ({ company_id: d.id, ...d.data() })),
            drives: dRes.docs.map(d => ({ drive_id: d.id, ...d.data() })),
            applications: aRes.docs.map(d => ({ application_id: d.id, ...d.data() })),
            skills: skRes.docs.map(d => ({ skill_id: d.id, ...d.data() })),
            students: stRes.docs.map(d => ({ student_id: d.id, ...d.data() })),
            notifications: nRes.docs.map(d => ({ notification_id: d.id, ...d.data() })),
            queries: qRes.docs.map(d => ({ query_id: d.id, ...d.data() }))
          }
        };
      }

      if (url === '/student/dashboard') {
        const studentDoc = await getDoc(doc(db, 'users', user.uid));
        const studentData = { student_id: user.uid, ...studentDoc.data() };
        
        const [nRes, dRes, skRes, qRes, aRes] = await Promise.all([
          getDocs(collection(db, 'notifications')),
          getDocs(query(collection(db, 'drives'), where('status', '==', 'Open'))),
          getDocs(collection(db, 'skills')),
          getDocs(query(collection(db, 'queries'), where('student_id', '==', user.uid))),
          getDocs(query(collection(db, 'applications'), where('student_id', '==', user.uid)))
        ]);

        const drives = dRes.docs.map(d => ({ drive_id: d.id, ...d.data() }));
        const applications = aRes.docs.map(d => ({ application_id: d.id, ...d.data() }));
        const skillsList = skRes.docs.map(d => ({ skill_id: d.id, ...d.data() }));
        
        const enrichedDrives = drives.map(drive => {
          const driveSkills = skillsList.filter(s => s.company_id === drive.company_id).map(s => s.skill_name);
          const myApp = applications.find(a => a.drive_id === drive.drive_id);
          return {
            ...drive,
            skills: driveSkills,
            isEligible: studentData.cgpa >= (drive.eligibility_cgpa || 0),
            hasApplied: !!myApp,
            applicationStatus: myApp ? myApp.status : null
          };
        });

        const personalNotifications = applications
          .filter(app => app.status === 'Accepted' || app.status === 'Rejected')
          .map((app, idx) => ({
             id: `pn_${idx}`,
             message: `Update on your application: You have been ${app.status.toUpperCase()} for the ${app.job_role} position at ${app.company_name}.`,
             date: app.applied_on,
             type: app.status
          }));

        return {
          data: {
            student: studentData,
            notifications: nRes.docs.map(d => ({ notification_id: d.id, ...d.data() })),
            personalNotifications,
            drives: enrichedDrives,
            queries: qRes.docs.map(d => ({ query_id: d.id, ...d.data() }))
          }
        };
      }
      
      throw new Error(`GET Route not matched in Mock API for ${url}`);
    } catch(err) {
      return Promise.reject({ response: { data: { error: err.message } } });
    }
  },

  post: async (url, data) => {
    const user = auth.currentUser;
    try {
      if (url === '/admin/companies') {
        const res = await addDoc(collection(db, 'companies'), data);
        return { data: { message: 'Company created', id: res.id } };
      }
      if (url === '/admin/drives') { // Need joined data like company_name for UI checks 
        // fetch joining company details
        const cdoc = await getDoc(doc(db, 'companies', data.company_id));
        const cdata = cdoc.data() || {};
        const enrichedDrive = { 
           ...data, 
           status: 'Open',
           company_name: cdata.company_name || 'Unknown',
           job_role: cdata.job_role || 'Unknown',
           package: cdata.package || 'Unknown',
           location: cdata.location || 'Unknown'
        };
        const res = await addDoc(collection(db, 'drives'), enrichedDrive);
        return { data: { message: 'Drive created', id: res.id } };
      }
      if (url === '/admin/skills') {
        const res = await addDoc(collection(db, 'skills'), data);
        return { data: { message: 'Skill linked', id: res.id } };
      }
      if (url === '/admin/notifications') {
        const payload = { message: data.message, date: new Date().toISOString() };
        await addDoc(collection(db, 'notifications'), payload);
        return { data: { message: 'Notification mapped' } };
      }
      if (url === '/student/profile') {
        await updateDoc(doc(db, 'users', user.uid), data);
        return { data: { message: 'Profile updated' } };
      }
      if (url === '/student/queries') {
        const studentDoc = await getDoc(doc(db, 'users', user.uid));
        const sdata = studentDoc.data() || {};
        const payload = { 
           ...data, 
           student_id: user.uid, 
           student_name: sdata.name || 'Unknown',
           branch: sdata.branch || 'Unknown',
           roll_no: sdata.roll_no || 'N/A',
           status: 'Pending', 
           created_at: new Date().toISOString() 
        };
        await addDoc(collection(db, 'queries'), payload);
        return { data: { message: 'Query saved' } };
      }
      
      let match = matchRoute(url, /^\/student\/apply\/(.+)$/);
      if (match) {
        // Find if already applied
        const existingApp = await getDocs(query(collection(db, 'applications'), where('student_id', '==', user.uid), where('drive_id', '==', match)));
        if (!existingApp.empty) throw new Error("Already applied");

        // get student details and drive details to denormalize
        const studentDoc = await getDoc(doc(db, 'users', user.uid));
        const sdata = studentDoc.data() || {};
        const driveDoc = await getDoc(doc(db, 'drives', match));
        const ddata = driveDoc.data() || {};

        const payload = {
          student_id: user.uid,
          drive_id: match,
          status: 'Pending',
          applied_on: new Date().toISOString(),
          student_name: sdata.name,
          email: sdata.email,
          branch: sdata.branch,
          cgpa: sdata.cgpa,
          company_name: ddata.company_name,
          job_role: ddata.job_role
        };
        await addDoc(collection(db, 'applications'), payload);
        return { data: { message: 'Applied successfully' } };
      }

      match = matchRoute(url, /^\/admin\/queries\/(.+)\/reply$/);
      if (match) {
        await updateDoc(doc(db, 'queries', match), { reply: data.reply, status: 'Answered' });
        return { data: { message: 'Reply sent' } };
      }

      throw new Error(`POST Route not matched ${url}`);
    } catch(err) {
      return Promise.reject({ response: { data: { error: err.message } } });
    }
  },

  put: async (url, data) => {
    try {
      let match = matchRoute(url, /^\/admin\/drives\/(.+)\/status$/);
      if (match) {
        await updateDoc(doc(db, 'drives', match), { status: data.status });
        return { data: { message: 'Drive status updated' } };
      }

      match = matchRoute(url, /^\/admin\/applications\/(.+)\/status$/);
      if (match) {
        await updateDoc(doc(db, 'applications', match), { status: data.status });
        return { data: { message: 'Application status updated' } };
      }
      
      throw new Error("PUT Route not matched");
    } catch(err) {
      return Promise.reject({ response: { data: { error: err.message } } });
    }
  },

  delete: async (url) => {
    try {
      if (url === '/student/profile') {
        const user = auth.currentUser;
        await deleteDoc(doc(db, 'users', user.uid));
        user.delete();
        return { data: { message: 'Account deleted' } };
      }
      
      let match = matchRoute(url, /^\/admin\/skills\/(.+)$/);
      if (match) {
        await deleteDoc(doc(db, 'skills', match));
        return { data: { message: 'Deleted' } };
      }
      match = matchRoute(url, /^\/admin\/notifications\/(.+)$/);
      if (match) {
        await deleteDoc(doc(db, 'notifications', match));
        return { data: { message: 'Deleted' } };
      }
      match = matchRoute(url, /^\/admin\/companies\/(.+)$/);
      if (match) {
        await deleteDoc(doc(db, 'companies', match));
        return { data: { message: 'Deleted' } };
      }
      match = matchRoute(url, /^\/admin\/drives\/(.+)$/);
      if (match) {
        await deleteDoc(doc(db, 'drives', match));
        return { data: { message: 'Deleted' } };
      }

      throw new Error("DELETE Route not matched");
    } catch(err) {
      return Promise.reject({ response: { data: { error: err.message } } });
    }
  }
};

export default api;
