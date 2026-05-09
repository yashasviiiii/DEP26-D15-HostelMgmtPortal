"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import HostelLeavingModal from "@/components/forms/HostelLeavingModal";
import GuestHouseModal from "@/components/forms/GuestHouseModal";
import { DoorOpen, Building2, History, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function StudentForms() {
  const { user } = useAuth();
  const router = useRouter();
  
  const initialLeaveForm = { 
    reason: "", leavingDate: "", returnDate: "", 
    nameOfParents: "", contactOfParents: "", addressDuringLeave: "",
    applicantName: user?.name || "", applicantDepartment: user?.department || "", 
    applicantEntryNo: user?.entryNumber || "", applicantMobileNo: user?.phone || ""
  };
  
  const [leaveForm, setLeaveForm] = useState(initialLeaveForm);
  
  const initialGuestForm = { 
    guestName: "", gender: "", address: "", contactNumber: "", 
    numGuests: "", numRooms: "", occupancyType: "", roomToBeBooked: "", paymentByGuest: false,
    arrivalDate: "", arrivalTime: "", departureDate: "", departureTime: "", purpose: "",
    applicantName: user?.name || "", applicantDepartment: user?.department || "", 
    applicantEntryNo: user?.entryNumber || "", applicantMobileNo: user?.phone || ""
  };
  
  const [guestForm, setGuestForm] = useState(initialGuestForm);

  const [myForms, setMyForms] = useState({ leavingForms: [], guestHouseForms: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("leaving");

  // Filter States
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
  };

  // Modal Toggles
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  // Email Draft Dialog
  const [draftDialog, setDraftDialog] = useState(null); // { gmailUrl }

  useEffect(() => {
    if (user && !user.roomNumber) {
      router.replace("/dashboard/student");
    }
  }, [user, router]);

  const fetchMyForms = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/student/forms`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMyForms(data);
      }
    } catch (error) {
      console.error("Failed to fetch forms", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyForms();
  }, []);

  const submitLeaveForm = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${apiUrl}/student/hostel-leaving/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(leaveForm)
    });

    if (res.ok) {
      alert("Leave request submitted successfully.");
      setLeaveForm(initialLeaveForm);
      setShowLeaveModal(false);
      fetchMyForms();
    } else {
      alert("Failed to submit leave request");
    }
  };

  const submitGuestForm = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${apiUrl}/student/guesthouse/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(guestForm)
    });

    const data = await res.json();

    if (res.ok) {
      // Construct email draft details
      alert(data.message || "Mail Sent to Warden");
    } else {
      console.log(data);
      alert(data.message || "Failed to submit guesthouse request");
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  // Filter Logic
  const filteredLeaving = myForms.leavingForms.filter(form => {
    const formDate = new Date(form.leavingDate);
    formDate.setHours(0, 0, 0, 0);
    const from = fromDate ? new Date(fromDate) : null;
    if (from) from.setHours(0, 0, 0, 0);
    const to = toDate ? new Date(toDate) : null;
    if (to) to.setHours(0, 0, 0, 0);

    const isAfterFrom = !from || formDate >= from;
    const isBeforeTo = !to || formDate <= to;
    return isAfterFrom && isBeforeTo;
  });

  const filteredGuest = myForms.guestHouseForms.filter(form => {
    const formDate = new Date(form.arrivalDate);
    formDate.setHours(0, 0, 0, 0);
    const from = fromDate ? new Date(fromDate) : null;
    if (from) from.setHours(0, 0, 0, 0);
    const to = toDate ? new Date(toDate) : null;
    if (to) to.setHours(0, 0, 0, 0);

    const isAfterFrom = !from || formDate >= from;
    const isBeforeTo = !to || formDate <= to;
    return isAfterFrom && isBeforeTo;
  });

  if (!user) return <div className="p-10 text-center text-indigo-600 font-bold animate-pulse">Loading...</div>;
  if (!user.roomNumber) return null;

  return (
    <DashboardLayout role="student" activeTab="forms">
      <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 animate-in fade-in duration-700">
        
        {/* HEADER (Sized to match Notices) */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Applications & Forms</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            Official Requests & <span className="text-indigo-600">Submissions</span>
          </p>
        </div>

        {/* Action Cards (Triggers) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <button 
            onClick={() => setShowLeaveModal(true)}
            className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-blue-200 transition-all text-left overflow-hidden shadow-sm hover:shadow-md"
          >
            <div className="absolute -right-12 -top-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
              <DoorOpen size={180} />
            </div>
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl h-fit w-fit mb-6">
              <DoorOpen size={28}/>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2 uppercase">Hostel Leaving</h2>
            <p className="text-slate-500 text-xs font-medium">Apply for temporary leave or holiday vacations.</p>
            <div className="mt-8 text-[9px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2">
              Apply Now &rarr;
            </div>
          </button>

          <button 
            onClick={() => setShowGuestModal(true)}
            className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 transition-all text-left overflow-hidden shadow-sm hover:shadow-md"
          >
            <div className="absolute -right-12 -top-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
              <Building2 size={180} />
            </div>
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl h-fit w-fit mb-6">
              <Building2 size={28}/>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2 uppercase">Guest House</h2>
            <p className="text-slate-500 text-xs font-medium">Reserve rooms for parents or official guests.</p>
            <div className="mt-8 text-[9px] font-black uppercase text-indigo-500 tracking-widest flex items-center gap-2">
              Book Room &rarr;
            </div>
          </button>

        </div>

        {/* FEED: RENDERING HISTORY */}
        <div className="pt-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <History size={20} className="text-slate-400" />
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">My Submissions</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* TABS CONTROLS */}
              <div className="flex space-x-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit">
                <button 
                  onClick={() => setActiveTab("leaving")}
                  className={`py-2 px-5 font-black uppercase tracking-widest text-[9px] rounded-xl transition-all ${
                    activeTab === "leaving" 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Leaving
                </button>
                <button 
                  onClick={() => setActiveTab("guesthouse")}
                  className={`py-2 px-5 font-black uppercase tracking-widest text-[9px] rounded-xl transition-all ${
                    activeTab === "guesthouse" 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Guest House
                </button>
              </div>

              {/* FILTERS UI */}
              <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-1.5 pl-3">
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">From</span>
                    <input 
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="bg-transparent border-none text-[10px] font-black text-slate-700 focus:ring-0 cursor-pointer p-0"
                    />
                </div>
                <div className="h-3 w-px bg-slate-100" />
                <div className="flex items-center gap-1.5 pr-3">
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">To</span>
                    <input 
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="bg-transparent border-none text-[10px] font-black text-slate-700 focus:ring-0 cursor-pointer p-0"
                    />
                </div>
                {(fromDate || toDate) && (
                  <>
                    <div className="h-3 w-px bg-slate-100" />
                    <button 
                      onClick={clearFilters}
                      className="pr-3 pl-1 text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 transition-colors"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {loading ? (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Loading history...</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Leaving Forms */}
                {activeTab === "leaving" && (
                  filteredLeaving.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No matching requests found</p>
                    </div>
                  ) : (
                    filteredLeaving.map((form) => (
                      <div key={form._id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:border-blue-100 transition-all">
                        <div className="space-y-1 w-full">
                          <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none mb-4">{form.reason}</h3>
                          <div className="pt-4 flex flex-wrap items-center gap-6 border-t border-slate-50 text-[11px] font-medium text-slate-500">
                             <p>Leaving: <span className="text-slate-900 font-bold">{new Date(form.leavingDate).toLocaleDateString()}</span></p>
                             <p>Returning: <span className="text-slate-900 font-bold">{new Date(form.returnDate).toLocaleDateString()}</span></p>
                             {form.duration && <p>Duration: <span className="text-slate-900 font-bold">{form.duration} Days</span></p>}
                          </div>
                          {form.nameOfParents && (
                            <div className="flex flex-wrap items-center gap-6 text-[11px] font-medium text-slate-400 mt-2">
                               <p>Guardian: <span className="text-slate-700 font-bold">{form.nameOfParents}</span></p>
                               <p>Contact: <span className="text-slate-700 font-bold">{form.contactOfParents}</span></p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )
                )}

                {/* Guest Forms */}
                {activeTab === "guesthouse" && (
                  filteredGuest.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No bookings found</p>
                    </div>
                  ) : (
                    filteredGuest
                      .sort((a, b) => new Date(b.arrivalDate) - new Date(a.arrivalDate))
                      .map((form) => (
                        <div key={form._id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:border-indigo-100 transition-all">
                          <div className="space-y-1 w-full">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none mb-4">
                              {form.guestName} <span className="text-[10px] text-slate-400 font-bold tracking-normal ml-2">[{form.purpose}]</span>
                            </h3>
                            <div className="pt-4 flex flex-wrap items-center gap-6 border-t border-slate-50 text-[11px] font-medium text-slate-500">
                               <p>Room: <span className="text-slate-900 font-bold uppercase">{form.roomToBeBooked || form.roomType || 'N/A'}</span></p>
                               <p>Guests: <span className="text-slate-900 font-bold">{form.numGuests}</span></p>
                               <p>Rooms: <span className="text-slate-900 font-bold">{form.numRooms}</span></p>
                            </div>
                            <div className="flex items-center gap-6 text-[11px] font-medium text-slate-400 mt-2 flex-wrap">
                               <p>In: <span className="text-slate-700 font-bold">{new Date(form.arrivalDate).toLocaleDateString()} {form.arrivalTime || ''}</span></p>
                               <p>Out: <span className="text-slate-700 font-bold">{new Date(form.departureDate).toLocaleDateString()} {form.departureTime || ''}</span></p>
                            </div>
                          </div>
                        </div>
                      ))
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <HostelLeavingModal 
        isOpen={showLeaveModal} 
        onClose={() => setShowLeaveModal(false)} 
        form={leaveForm} 
        setForm={setLeaveForm} 
        onSubmit={submitLeaveForm} 
      />
      
      <GuestHouseModal 
        isOpen={showGuestModal} 
        onClose={() => setShowGuestModal(false)}  
        form={guestForm} 
        setForm={setGuestForm} 
        onSubmit={submitGuestForm} 
      />

      {/* Email Draft Panel — Bottom Right */}
      {draftDialog && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-indigo-600">
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-white" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Booking Saved</span>
            </div>
            <button onClick={() => setDraftDialog(null)} className="text-white/70 hover:text-white transition-colors text-lg leading-none">&times;</button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Choose your Google account and open the pre-filled email draft.
            </p>

            {draftDialog.pdfUrl && (
              <a
                href={draftDialog.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
              >
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest flex-1">📄 Download PDF</span>
                <span className="text-[8px] font-bold text-indigo-500 uppercase">Attach to email</span>
              </a>
            )}

            <div>
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Your Email ID</label>
              <input
                type="email"
                value={draftDialog.senderEmail}
                onChange={(e) => setDraftDialog(prev => ({ ...prev, senderEmail: e.target.value }))}
                placeholder="yourname@iitrpr.ac.in"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const email = encodeURIComponent(draftDialog.senderEmail);
                  const url = `${draftDialog.baseGmailUrl}&authuser=${email}`;
                  window.open(url, '_blank');
                  setDraftDialog(null);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-colors"
              >
                Open in Gmail
              </button>
              <button
                onClick={() => setDraftDialog(null)}
                className="px-4 text-[9px] font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}