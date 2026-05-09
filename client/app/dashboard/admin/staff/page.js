"use client";
import { useState, useEffect } from "react";
import API from "@/lib/api";
import { Plus, Mail, User, Building, Trash2, ShieldCheck, ShieldAlert, Phone, UserCircle, Search } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function StaffManagement() {
  const [hostels, setHostels] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingStaff, setFetchingStaff] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [hostelFilter, setHostelFilter] = useState("all");

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "warden",
    hostelId: "",
    gender: "Male"
  });

  useEffect(() => {
    fetchHostels();
    fetchStaff();
  }, []);

  const fetchHostels = async () => {
    try {
      const res = await API.get("/admin/hostels");
      setHostels(res.data);
      if (res.data.length > 0)
        setForm((prev) => ({ ...prev, hostelId: res.data[0]._id }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStaff = async () => {
    try {
      setFetchingStaff(true);
      const res = await API.get("/admin/staff");
      setStaffList(res.data);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    } finally {
      setFetchingStaff(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!form.email || !form.name || !form.gender) return alert("Fill all fields");

      setLoading(true);
      await API.post("/admin/staff", form);

      alert("✅ Staff Created & Credentials Sent!");
      setForm({ ...form, name: "", email: "" });
      fetchStaff(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this staff member? This action cannot be undone.")) return;

    try {
      await API.delete(`/admin/staff/${id}`);
      setStaffList(staffList.filter(s => s._id !== id));
    } catch (err) {
      alert("Failed to delete staff");
    }
  };

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(search.toLowerCase()) ||
      staff.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "all" || staff.role === roleFilter;

    const matchesHostel =
      hostelFilter === "all" || staff.hostelId?._id === hostelFilter;

    return matchesSearch && matchesRole && matchesHostel;
  });

  return (
    <DashboardLayout role="admin" activeTab="staff">
      <div className="w-full max-w-6xl mx-auto space-y-12 pb-20">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
              Staff Management
            </h1>
            <p className="text-slate-500 font-medium italic lowercase:any">
              Enroll and manage wardens & caretakers across all hostel blocks.
            </p>
          </div>
        </div>

        <div className="space-y-20">

          {/* ENROLLMENT FORM SECTION */}
<section className="max-w-2xl">
  <div className="space-y-6">
    <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em] ml-2">
      Enroll New Staff
    </h2>
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
      <div className="space-y-6">
        
        {/* FULL NAME */}
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Full Name</label>
          <div className="relative mt-1">
            <UserCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>

        {/* DESIGNATED ROLE */}
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Designated Role</label>
          <div className="relative mt-1">
            <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="warden">Warden</option>
              <option value="caretaker">Caretaker</option>
            </select>
          </div>
        </div>

        {/* EMAIL IDENTITY */}
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email Identity</label>
          <div className="relative mt-1">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-500"
              placeholder="warden@iitrpr.ac.in"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        {/* PRIMARY ASSIGNMENT */}
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Primary Assignment</label>
          <div className="relative mt-1">
            <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
              value={form.hostelId}
              onChange={(e) => setForm({ ...form, hostelId: e.target.value })}
            >
              <option value="" disabled>Select a Hostel</option>
              {hostels.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name} {h.type ? `(${h.type})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50"
        >
          <Plus size={16} />
          {loading ? "Syncing..." : "Create and Send Credentials"}
        </button>

      </div>
    </div>
  </div>
</section>

          {/* STAFF DIRECTORY SECTION */}
          <section className="space-y-8">
            <div className="space-y-6 px-2">

              {/* Heading */}
              <div className="space-y-1">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
                  Active Staff Directory
                </h2>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                    {filteredStaff.length} {filteredStaff.length === 1 ? "Record" : "Records"}
                  </span>

                  {(search || roleFilter !== "all" || hostelFilter !== "all") && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setRoleFilter("all");
                        setHostelFilter("all");
                      }}
                      className="text-[10px] font-bold text-rose-500 hover:underline"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">

                {/* Search */}
                <div className="relative group min-w-[240px]">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
                  />
                </div>

                {/* Role Filter */}
                <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
                  {["all", "warden", "caretaker"].map((role) => (
                    <button
                      key={role}
                      onClick={() => setRoleFilter(role)}
                      className={`px-4 py-1.5 text-xs rounded-lg font-bold transition-all ${roleFilter === role
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Hostel Filter */}
                <div className="relative">
                  <select
                    value={hostelFilter}
                    onChange={(e) => setHostelFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer shadow-sm appearance-none pr-10"
                  >
                    <option value="all">All Hostels</option>
                    {hostels.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name} {h.type ? `(${h.type})` : ''}
                      </option>
                    ))}
                  </select>

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Building size={14} />
                  </div>
                </div>
              </div>
            </div>

            {fetchingStaff ? (
              <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium animate-pulse">Accessing directory records...</p>
              </div>
            ) : staffList.length === 0 ? (
              <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium italic lowercase:any">No staff records found in the system.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredStaff.map((staff) => (
                  <div key={staff._id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl ${staff.role === 'warden' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {staff.role === 'warden' ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 tracking-tight">{staff.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{staff.role}</span>
                          <div className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{staff.hostelId?.name || 'Unassigned'}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-medium">{staff.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(staff._id)}
                      className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
