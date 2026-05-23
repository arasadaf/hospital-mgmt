import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserRound,
  ShieldCheck,
  Trash2,
  Stethoscope,
  Calendar,
  ClipboardList,
  LayoutDashboard,
  UserCircle,
  CheckCircle,
  Download,
  Search,
  LogOut, Menu,
  Ban,
  Check,
  Plus,
  X,
  Key
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../store/authStore";
import {
  bodyFont,
  headingFont,
  adminSidebarBg,
  adminActiveTab,
  adminInactiveTab,
  adminPrimaryBtn,
  adminSecondaryBtn,
  adminRedBtn,
  adminGreenBtn,
  metricCard,
  metricCardPending
} from "../styles/Common.js";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const [recentUsers, setRecentUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
    pendingVerifications: 1,
  });

  // Direct Doctor Creation State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    dob: "",
    specialization: "",
    experience: "",
    qualification: "",
    availableDays: [],
    availableTime: ""
  });

  const daysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$*";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewDoctor(prev => ({ ...prev, password }));
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    if (newDoctor.availableDays.length === 0) {
      toast.error("Please select at least one available day.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post("/admin-api/create-doctor", newDoctor);
      toast.success(res.data.message);
      
      setShowAddModal(false);
      setNewDoctor({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        dob: "",
        specialization: "",
        experience: "",
        qualification: "",
        availableDays: [],
        availableTime: ""
      });
      
      // Refresh lists
      getDoctors();
      getStats();
      getRecentUsers();
      setLoading(false);
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Failed to create doctor profile.");
      setLoading(false);
    }
  };

  // FETCH STATS
  const getStats = useCallback(async () => {
    try {
      const res = await axios.get("/admin-api/stats");
      setStats(res.data.payload);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch stats");
    }
  }, []);

  // FETCH RECENT USERS
  const getRecentUsers = useCallback(async () => {
    try {
      const res = await axios.get(
        "/admin-api/recent-users"
      );
      setRecentUsers(res.data.payload);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch recent users");
    }
  }, []);

  // FETCH ALL DOCTORS
  const getDoctors = useCallback(async () => {
    try {
      const res = await axios.get(
        "/admin-api/doctors"
      );
      setDoctors(res.data.payload);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch doctors");
    }
  }, []);

  // FETCH ALL PATIENTS
  const getPatients = useCallback(async () => {
    try {
      const res = await axios.get(
        "/admin-api/patients"
      );
      setPatients(res.data.payload);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch patients");
    }
  }, []);
  
  // FETCH ALL APPOINTMENTS
  const getAppointments = useCallback(async () => {
    try {
      const res = await axios.get(
        "/admin-api/all-appointments"
      );
      setAppointments(res.data.payload);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch appointments");
    }
  }, []);
  
  // FETCH ALL PRESCRIPTIONS
  const getPrescriptions = useCallback(async () => {
    try {
      const res = await axios.get(
        "/admin-api/all-prescriptions"
      );
      setPrescriptions(res.data.payload);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch prescriptions");
    }
  }, []);

  // TOGGLE USER STATUS
  const toggleUserStatus = async (id, role) => {
    try {
      setLoading(true);
      const endpoint = role === "DOCTOR" ? `/admin-api/doctor/${id}` : `/admin-api/patient/${id}`;
      
      const res = await axios.put(`${endpoint}`);
      
      toast.success(res.data.message);
      
      getRecentUsers();
      getDoctors();
      getPatients();
      getStats(); // Refresh stats after status update
      
      setLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("Failed to update user status");
      setLoading(false);
    }
  };

  // DOWNLOAD PRESCRIPTION
  const downloadPrescription = async (prescriptionId) => {
    try {
      const response = await axios.get(
        `/prescription-api/${prescriptionId}/pdf`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prescription-${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Prescription downloaded successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to download prescription PDF");
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      getStats();
      getRecentUsers();
      getDoctors();
      getPatients();
      getAppointments();
      getPrescriptions();
    });
  }, [getStats, getRecentUsers, getDoctors, getPatients, getAppointments, getPrescriptions]);

  // RESET SEARCH QUERY ON TAB CHANGE
  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  // GET FORMATTED DATE FOR HEADER
  const getHeaderDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    return new Date().toLocaleDateString('en-US', options);
  };

  // RENDER SEARCH BAR
  const renderSearchBar = (placeholder) => (
    <div className="relative max-w-sm mb-6">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-white border border-[#d2d2d7] rounded-xl pl-10 pr-4 py-2 text-[13px] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3] transition"
      />
    </div>
  );

  // VIEW RENDERERS
  const renderDashboard = () => (
    <>
      <h2 className={`text-[24px] font-bold tracking-tight mb-6 ${headingFont}`}>Dashboard Summary</h2>
      
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        
        {/* TOTAL PATIENTS */}
        <div 
          className={`${metricCard} cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => setActiveTab("patients")}
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              Total Patients
            </p>
            <div className="bg-[#fafafa] p-1.5 rounded-lg border border-[#e8e8ed]">
              <Users className="text-[#0071e3]" size={14} />
            </div>
          </div>
          <h2 className={`text-[26px] font-bold leading-none ${headingFont}`}>
            {stats.totalPatients}
          </h2>
        </div>

        {/* TOTAL DOCTORS */}
        <div 
          className={`${metricCard} cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => setActiveTab("doctors")}
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              Total Doctors
            </p>
            <div className="bg-[#fafafa] p-1.5 rounded-lg border border-[#e8e8ed]">
              <Stethoscope className="text-[#0071e3]" size={14} />
            </div>
          </div>
          <h2 className={`text-[26px] font-bold leading-none ${headingFont}`}>
            {stats.totalDoctors}
          </h2>
        </div>

        {/* PENDING VERIFICATIONS */}
        <div className={metricCardPending}>
          <div className="flex justify-between items-start mb-4">
            <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              Pending Verifications
            </p>
            <div className="bg-[#fff9f0] p-1.5 rounded-lg border border-[#ff9500]/10">
              <ShieldCheck className="text-[#ff9500]" size={14} />
            </div>
          </div>
          <h2 className={`text-[26px] font-bold leading-none ${headingFont}`}>
            {stats.pendingVerifications}
          </h2>
        </div>

        {/* APPOINTMENTS */}
        <div 
          className={`${metricCard} cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => setActiveTab("appointments")}
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              Appointments
            </p>
            <div className="bg-[#fafafa] p-1.5 rounded-lg border border-[#e8e8ed]">
              <Calendar className="text-[#0071e3]" size={14} />
            </div>
          </div>
          <h2 className={`text-[26px] font-bold leading-none ${headingFont}`}>
            {stats.totalAppointments}
          </h2>
        </div>

        {/* PRESCRIPTIONS */}
        <div 
          className={`${metricCard} cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => setActiveTab("prescriptions")}
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              Prescriptions
            </p>
            <div className="bg-[#fafafa] p-1.5 rounded-lg border border-[#e8e8ed]">
              <ClipboardList className="text-[#0071e3]" size={14} />
            </div>
          </div>
          <h2 className={`text-[26px] font-bold leading-none ${headingFont}`}>
            {stats.totalPrescriptions}
          </h2>
        </div>
      </div>

      {/* RECENTLY JOINED USERS */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8ed] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8e8ed]">
          <h3 className={`text-[16px] font-bold ${headingFont}`}>
            Recently Joined Users
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fafafa] border-b border-[#e8e8ed]">
              <tr>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8ed]">
              {recentUsers.map((u) => (
                <tr key={u._id} className="hover:bg-[#fafafa]/60 transition">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-[#1d1d1f] flex items-center justify-center font-bold text-[12px] uppercase">
                        {u.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#1d1d1f] text-[13px]">{u.name}</div>
                        <div className="text-[11px] text-[#86868b] font-normal">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.role === 'DOCTOR' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <button
                      disabled={loading}
                      onClick={() => toggleUserStatus(u._id, u.role)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-[12px] font-semibold ${
                        u.isActive 
                          ? adminRedBtn
                          : adminGreenBtn
                      }`}
                    >
                      {u.isActive ? <Ban size={13} /> : <Check size={13} />}
                      {u.isActive ? 'Set Inactive' : 'Set Active'}
                    </button>
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                    No recent users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderDoctors = () => {
    const filteredDoctors = doctors.filter(d => 
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8ed] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#e8e8ed] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className={`text-[18px] font-bold ${headingFont}`}>Manage Doctors</h2>
            <span className="bg-[#fafafa] border border-[#e8e8ed] text-[#86868b] px-3 py-1 rounded-full text-[11px] font-bold">
              {doctors.length} Total
            </span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white px-4 py-2 rounded-xl text-[12px] font-semibold transition shadow-sm hover:shadow"
          >
            <Plus size={14} />
            Add Doctor
          </button>
        </div>
        <div className="p-6 pb-0">
          {renderSearchBar("Search doctors...")}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fafafa] border-b border-[#e8e8ed]">
              <tr>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8ed]">
              {filteredDoctors.map((d) => (
                <tr key={d._id} className="hover:bg-[#fafafa]/60 transition">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-[#1d1d1f] flex items-center justify-center font-bold text-[12px] uppercase">
                        {d.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#1d1d1f] text-[13px]">{d.name}</div>
                        <div className="text-[11px] text-[#86868b] font-normal">{d.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-gray-650 text-[13px] font-medium">
                    {d.specialization || "General Physician"}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex flex-col gap-1.5">
                      <span className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        d.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {d.isActive ? 'Active' : 'Suspended'}
                      </span>
                      <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        d.isVerified ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-yellow-50 text-yellow-750 border-yellow-100'
                      }`}>
                        {d.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <button
                      disabled={loading}
                      onClick={() => toggleUserStatus(d._id, 'DOCTOR')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-[12px] font-semibold ${
                        d.isActive 
                          ? adminRedBtn
                          : adminGreenBtn
                      }`}
                    >
                      {d.isActive ? <Ban size={13} /> : <Check size={13} />}
                      {d.isActive ? 'Suspend Doctor' : 'Activate Doctor'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">No doctors found matching query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPatients = () => {
    const filteredPatients = patients.filter(p => 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8ed] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#e8e8ed] flex items-center justify-between">
          <h2 className={`text-[18px] font-bold ${headingFont}`}>Manage patients</h2>
          <span className="bg-[#fafafa] border border-[#e8e8ed] text-gray-600 px-3 py-1 rounded-full text-[11px] font-bold">
            {patients.length} Total
          </span>
        </div>
        <div className="p-6 pb-0">
          {renderSearchBar("Search patients...")}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fafafa] border-b border-[#e8e8ed]">
              <tr>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8ed]">
              {filteredPatients.map((p) => (
                <tr key={p._id} className="hover:bg-[#fafafa]/60 transition">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-[#1d1d1f] flex items-center justify-center font-bold text-[12px] uppercase">
                        {p.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#1d1d1f] text-[13px]">{p.name}</div>
                        <div className="text-[11px] text-[#86868b] font-normal">{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      p.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {p.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <button
                      disabled={loading}
                      onClick={() => toggleUserStatus(p._id, 'PATIENT')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-[12px] font-semibold ${
                        p.isActive 
                          ? adminRedBtn
                          : adminGreenBtn
                      }`}
                    >
                      {p.isActive ? <Ban size={13} /> : <Check size={13} />}
                      {p.isActive ? 'Suspend Patient' : 'Unsuspend'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-400">No patients found matching query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAppointments = () => {
    const filteredAppts = appointments.filter(appt => 
      appt.patientId?.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.doctorId?.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8ed] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#e8e8ed]">
          <h2 className={`text-[18px] font-bold ${headingFont}`}>All Appointments</h2>
        </div>
        <div className="p-6 pb-0">
          {renderSearchBar("Search doctor or patient...")}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fafafa] border-b border-[#e8e8ed]">
              <tr>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8ed]">
              {filteredAppts.map((appt) => (
                <tr key={appt._id} className="hover:bg-[#fafafa]/60 transition">
                  <td className="px-6 py-3.5 text-[13px] text-[#1d1d1f] font-medium">
                    {new Date(appt.appointmentDate).toLocaleDateString()} <br/>
                    <span className="text-[11px] text-gray-400 font-normal">{appt.appointmentTime}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="font-semibold text-[#1d1d1f] text-[13px]">
                      {appt.patientId?.userId?.name || "Unknown"}
                    </div>
                    <div className="text-[11px] text-[#86868b] font-normal">
                      {appt.patientId?.userId?.email}
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-gray-800 text-[13px] font-medium">
                    Dr. {appt.doctorId?.userId?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      appt.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-100' :
                      appt.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-100' :
                      appt.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-yellow-50 text-yellow-700 border-yellow-100'
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAppts.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">No appointments found matching query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPrescriptions = () => {
    const filteredPresc = prescriptions.filter(presc => 
      presc.patientId?.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      presc.doctorId?.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      presc.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8ed] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#e8e8ed]">
          <h2 className={`text-[18px] font-bold ${headingFont}`}>All Prescriptions</h2>
        </div>
        <div className="p-6 pb-0">
          {renderSearchBar("Search doctor, patient or diagnosis...")}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fafafa] border-b border-[#e8e8ed]">
              <tr>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Diagnosis</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8ed]">
              {filteredPresc.map((presc) => (
                <tr key={presc._id} className="hover:bg-[#fafafa]/60 transition">
                  <td className="px-6 py-3.5 text-[#86868b] text-[13px]">
                    {new Date(presc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-[#1d1d1f] text-[13px]">
                    {presc.patientId?.userId?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-[#1d1d1f] text-[13px]">
                    Dr. {presc.doctorId?.userId?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-3.5 text-[#86868b] text-[13px]">
                    {presc.diagnosis}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <button
                      onClick={() => downloadPrescription(presc._id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-[12px] font-semibold ${adminPrimaryBtn}`}
                    >
                      <Download size={13} />
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPresc.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">No prescriptions found matching query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8ed] p-8 max-w-xl">
      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 bg-[#0071e3] rounded-full flex items-center justify-center text-white text-[24px] font-bold">
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
        <div>
          <h2 className={`text-[20px] font-bold ${headingFont}`}>{user?.name || "Admin"}</h2>
          <p className="text-gray-400 text-[12px]">System Administrator</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 py-3 border-t border-[#e8e8ed] text-[13px] gap-2">
          <div className="text-gray-400 font-medium">Email Address</div>
          <div className="sm:col-span-2 text-[#1d1d1f] font-semibold">{user?.email || "admin@example.com"}</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 py-3 border-t border-[#e8e8ed] text-[13px] gap-2">
          <div className="text-gray-400 font-medium">Role</div>
          <div className="sm:col-span-2 text-[#1d1d1f] font-semibold">ADMINISTRATOR</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 py-3 border-t border-[#e8e8ed] text-[13px] gap-2">
          <div className="text-gray-400 font-medium">Status</div>
          <div className="sm:col-span-2 text-green-600 font-bold flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
             Active
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "doctors": return renderDoctors();
      case "patients": return renderPatients();
      case "appointments": return renderAppointments();
      case "prescriptions": return renderPrescriptions();
      case "profile": return renderProfile();
      default: return renderDashboard();
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getActiveTabTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Dashboard";
      case "doctors": return "Manage Doctors";
      case "patients": return "Manage Patients";
      case "appointments": return "Appointments";
      case "prescriptions": return "Prescriptions";
      case "profile": return "Profile";
      default: return "Admin Portal";
    }
  };

  // Sidebar classes: hidden on small screens unless open
  const sidebarClasses = `fixed inset-y-0 left-0 w-60 flex flex-col shrink-0 p-5 z-50 ${adminSidebarBg} transform ${"${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}"} transition-transform duration-300 ease-in-out sm:relative sm:translate-x-0`;

  return (
    <div className={`min-h-screen bg-[#fafafa] flex flex-col md:flex-row antialiased ${bodyFont} overflow-x-hidden`}>
      
      {/* SIDEBAR */}
      <div className={sidebarClasses}>
        {/* LOGO AREA */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-[#0071e3] rounded-xl flex items-center justify-center text-white">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h1 className={`text-[14px] font-bold tracking-tight leading-tight ${headingFont}`}>People Care</h1>
            <p className="text-[9px] text-[#86868b] font-bold uppercase tracking-wider leading-none">International Hospital</p>
          </div>
        </div>
        {/* ADMIN HEADER */}
        <div className="mb-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1 border-b border-[#e8e8ed]">Admin</div>
        </div>
        {/* NAVIGATION LINKS */}
        <nav className="flex-1 space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition font-semibold text-[13px] ${
              activeTab === "dashboard" ? adminActiveTab : adminInactiveTab
            }`}
          >
            <LayoutDashboard size={15} />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab("doctors")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition font-semibold text-[13px] ${
              activeTab === "doctors" ? adminActiveTab : adminInactiveTab
            }`}
          >
            <Stethoscope size={15} />
            Manage Doctors
          </button>

          <button
            onClick={() => setActiveTab("patients")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition font-semibold text-[13px] ${
              activeTab === "patients" ? adminActiveTab : adminInactiveTab
            }`}
          >
            <Users size={15} />
            Manage Patients
          </button>

          <button
            onClick={() => setActiveTab("appointments")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition font-semibold text-[13px] ${
              activeTab === "appointments" ? adminActiveTab : adminInactiveTab
            }`}
          >
            <Calendar size={15} />
            Appointments
          </button>

          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition font-semibold text-[13px] ${
              activeTab === "prescriptions" ? adminActiveTab : adminInactiveTab
            }`}
          >
            <ClipboardList size={15} />
            Prescriptions
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition font-semibold text-[13px] ${
              activeTab === "profile" ? adminActiveTab : adminInactiveTab
            }`}
          >
            <UserCircle size={15} />
            Profile
          </button>
        </nav>
        {/* SIDEBAR FOOTER */}
        <div className="pt-4 border-t border-[#e8e8ed] mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#0071e3] text-white flex items-center justify-center font-bold text-[12px] uppercase">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-[#1d1d1f] text-[12px] leading-tight">{user?.name || "Dr. Aman Mehta"}</div>
              <div className="text-[10px] text-gray-400 font-normal leading-tight">{user?.email || "admin@peoplecare.com"}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 border border-[#d2d2d7] hover:bg-[#f5f5f7] text-[#1d1d1f] rounded-xl py-2 text-[12px] font-semibold transition"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-auto bg-[#fafafa]">
        
        {/* TOP BAR / PORTAL HEADER */}
        <header className="px-6 md:px-10 py-4 bg-white border-b border-[#e8e8ed] flex items-center justify-between shrink-0 relative">
          <button
            className="sm:hidden text-gray-600 hover:text-gray-800 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Admin Portal</p>
              <h2 className="text-[14px] font-bold text-[#1d1d1f] mt-1">{getActiveTabTitle()}</h2>
            </div>
            <div className="border border-[#d2d2d7] rounded-full px-3 py-1 text-[11px] text-gray-500 font-medium bg-[#fafafa]">
              {getHeaderDate()}
            </div>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>

      </div>

      {/* ADD DOCTOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-gray-100 relative my-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2 mb-2">
              <Stethoscope className="text-[#0071e3]" size={24} />
              Register New Doctor
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Create a fully verified doctor profile. The login credentials will be dispatched immediately to the doctor's email.
            </p>

            <form onSubmit={handleCreateDoctor} className="space-y-6">
              {/* SECTION 1: ACCOUNT CREDENTIALS */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">
                  Account Credentials & Settings
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Akhila Priya"
                      value={newDoctor.name}
                      onChange={(e) => setNewDoctor(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="doctor@peoplecare.com"
                      value={newDoctor.email}
                      onChange={(e) => setNewDoctor(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Choose or generate a password"
                        value={newDoctor.password}
                        onChange={(e) => setNewDoctor(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full border border-gray-200 bg-gray-50 rounded-xl pl-4 pr-24 py-2.5 text-[13px] font-mono outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition"
                      />
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="absolute right-2 top-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                      >
                        <Key size={10} />
                        Auto-Gen
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 9876543210"
                      value={newDoctor.phoneNumber}
                      onChange={(e) => setNewDoctor(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PROFESSIONAL INFORMATION */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">
                  Professional Information
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cardiologist, Pediatrician"
                      value={newDoctor.specialization}
                      onChange={(e) => setNewDoctor(prev => ({ ...prev, specialization: e.target.value }))}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Qualification</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MBBS, MD (Cardiology)"
                      value={newDoctor.qualification}
                      onChange={(e) => setNewDoctor(prev => ({ ...prev, qualification: e.target.value }))}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 8"
                      value={newDoctor.experience}
                      onChange={(e) => setNewDoctor(prev => ({ ...prev, experience: e.target.value }))}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={newDoctor.dob}
                      onChange={(e) => setNewDoctor(prev => ({ ...prev, dob: e.target.value }))}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: CONSULTATION AVAILABILITY */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">
                  Consultation Schedule
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Available Days</label>
                    <div className="flex flex-wrap gap-3 mt-1.5 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                      {daysList.map((day) => (
                        <label key={day} className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newDoctor.availableDays.includes(day)}
                            onChange={() => {
                              setNewDoctor(prev => ({
                                ...prev,
                                availableDays: prev.availableDays.includes(day)
                                  ? prev.availableDays.filter(d => d !== day)
                                  : [...prev.availableDays, day]
                              }));
                            }}
                            className="rounded text-[#0071e3] focus:ring-[#0071e3] h-4 w-4"
                          />
                          {day}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Consultation Hours</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 09:00 AM - 05:00 PM"
                      value={newDoctor.availableTime}
                      onChange={(e) => setNewDoctor(prev => ({ ...prev, availableTime: e.target.value }))}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3] transition"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-750 font-bold py-3 rounded-xl transition text-[13px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-[13px] shadow-md shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : "Create Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;