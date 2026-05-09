"use client";
import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/lib/api";
import NoticeForm from "@/components/NoticeForm";
import toast from "react-hot-toast";
import { 
  Bell, Search, Info, TriangleAlert, CalendarDays, 
  Pin, RotateCcw, Filter, ChevronDown, CalendarRange, Trash2
} from "lucide-react";

const CATEGORIES = ["Academic", "Maintenance", "Events", "Other"];

export default function NoticeDashboard() {
  const [notices, setNotices] = useState([]);
  const [noticeSearch, setNoticeSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedContentId, setExpandedContentId] = useState(null);
  const [expandedAttachmentsId, setExpandedAttachmentsId] = useState(null);

  // Analysis Calculations
  const stats = useMemo(() => ({
    total: notices.length,
    urgent: notices.filter(n => n.category === "Urgent").length,
    pinned: notices.filter(n => n.isPinned).length,
    recent: notices.filter(n => (new Date() - new Date(n.createdAt)) / 36e5 < 24).length,
    weekly: notices.filter(n => {
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      return new Date(n.createdAt) > weekAgo;
    }).length
  }), [notices]);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notices");
      setNotices(res.data);
    } catch (err) {
      console.error("Failed to fetch", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      await API.delete(`/notices/${id}`);
      setNotices(notices.filter(n => n._id !== id));
      toast.success("Notice deleted successfully");
    } catch (err) { toast.error("Failed to delete notice"); }
  };

  const handlePinNotice = async (id, currentPin) => {
    try {
      if (!currentPin && stats.pinned >= 3) {
        toast.error("Maximum 3 notices can be pinned at a time");
        return;
      }
      await API.patch(`/notices/${id}`, { isPinned: !currentPin });
      fetchNotices();
      toast.success(currentPin ? "Notice unpinned" : "Notice pinned successfully");
    } catch (err) { toast.error("Failed to update pin status"); }
  };

  const filteredNotices = useMemo(() => {
    return notices
      .filter((n) => {
        // Category
        if (activeCategory !== "All" && n.category !== activeCategory) return false;

        // Search
        const search = noticeSearch.toLowerCase();
        if (
          !n.title.toLowerCase().includes(search) &&
          !n.content.toLowerCase().includes(search)
        ) return false;

        // Pinned
        if (showPinnedOnly && !n.isPinned) return false;

        // Date
        if (dateFilter) {
          const filterDate = new Date(dateFilter);
          filterDate.setHours(0, 0, 0, 0);
          
          const createdDate = new Date(n.createdAt);
          createdDate.setHours(0, 0, 0, 0);
          
          if (createdDate < filterDate) return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          (b.isPinned - a.isPinned) ||
          new Date(b.createdAt) - new Date(a.createdAt)
      );
  }, [notices, activeCategory, noticeSearch, dateFilter, showPinnedOnly]);

  const getCategoryStyles = (cat) => {
    switch (cat) {
      case 'Urgent': return 'bg-rose-50/80 border-rose-100 text-rose-700';
      case 'Maintenance': return 'bg-amber-50/80 border-amber-100 text-amber-700';
      case 'Academic': return 'bg-indigo-50/80 border-indigo-100 text-indigo-700';
      case 'Events': return 'bg-emerald-50/80 border-emerald-100 text-emerald-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <DashboardLayout role="caretaker">
      <div className="max-w-6xl mx-auto space-y-6 pb-8 px-4 animate-in fade-in duration-700">
        
        {/* HEADER & STATS */}
        <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6 w-full pt-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase mb-2">Notice Board</h1>
            <p className="text-slate-500 font-medium text-sm">Broadcast announcements and pin critical updates.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {[
              { label: "Total", val: stats.total, color: "text-indigo-500", bg: "bg-indigo-500/10", icon: Bell },
              { label: "Pinned", val: stats.pinned, color: "text-amber-500", bg: "bg-amber-500/10", icon: Pin },
              { label: "This Week", val: stats.weekly, color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CalendarRange },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm bg-white text-slate-800 transition-all hover:shadow-md">
                <div className={`p-2 rounded-xl flex items-center justify-center ${s.bg}`}>
                  <s.icon size={16} className={s.color} />
                </div>
                <div className="flex flex-col justify-center translate-y-[1px]">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{s.label}</span>
                  <span className="text-xl font-black leading-none tracking-tighter">{s.val}</span>
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-sm flex items-center gap-2 ml-2"
            >
              <span>➕</span> New Notice
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search notices..." 
              className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm transition-all"
              value={noticeSearch} 
              onChange={(e) => setNoticeSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <div className="relative flex-1 md:flex-none">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select 
                className="w-full md:w-40 bg-white border border-slate-100 rounded-2xl py-3 pl-10 pr-10 text-[11px] font-black uppercase tracking-wider appearance-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm cursor-pointer transition-all"
                value={activeCategory} 
                onChange={(e) => setActiveCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={14} />
              </div>
            </div>

            <input
              type="date"
              className="bg-white border border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold text-slate-600 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            
            <button
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
              className={`px-4 py-3 rounded-2xl text-[11px] font-black uppercase border shadow-sm transition whitespace-nowrap ${
                showPinnedOnly
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-white text-slate-600 border-slate-100"
              }`}
            >
              <Pin size={12} className="inline mr-1 -mt-0.5" />
              Pinned
            </button>

            {(noticeSearch || activeCategory !== "All" || dateFilter || showPinnedOnly) && (
              <button  
                onClick={() => {
                  setNoticeSearch("");
                  setActiveCategory("All");
                  setDateFilter("");
                  setShowPinnedOnly(false);
                }}
                className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl hover:bg-indigo-100 transition-all flex items-center gap-2 border border-indigo-100 shadow-sm"
              >
                <RotateCcw size={16} />
                <span className="text-[10px] font-black uppercase hidden lg:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* NOTICES LIST */}
        <div className="space-y-4">
          {filteredNotices.map((notice) => (
            <div
              key={notice._id}
              className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md ${notice.isPinned ? 'ring-1 ring-amber-500/20' : ''}`}
            >
              <div className="flex flex-col gap-4">
                
                {/* TOP ROW */}
                <div className="flex items-start justify-between gap-3">
                  {/* LEFT */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* CATEGORY BADGE */}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getCategoryStyles(notice.category)}`}>
                        {notice.category}
                      </span>

                      {/* PIN */}
                      {notice.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          <Pin size={10} />
                          Pinned
                        </span>
                      )}
                    </div>

                    {/* TITLE */}
                    <h2 className="text-base font-semibold text-slate-800 leading-snug">
                      {notice.title}
                    </h2>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* DATE */}
                    <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 font-medium mr-2">
                      <CalendarDays size={12} />
                      {new Date(notice.createdAt).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <button
                      onClick={() => handlePinNotice(notice._id, notice.isPinned)}
                      className={`p-2 rounded-lg transition ${
                        notice.isPinned
                          ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                          : "bg-slate-100 text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                      }`}
                      title={notice.isPinned ? "Unpin Notice" : "Pin Notice"}
                    >
                      <Pin size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteNotice(notice._id)}
                      className="p-2 bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete Notice"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="text-sm text-slate-600 leading-relaxed">
                  {expandedContentId === notice._id ? (
                    <p className="whitespace-pre-wrap">{notice.content}</p>
                  ) : (
                    <p className="line-clamp-2 whitespace-pre-wrap">{notice.content}</p>
                  )}

                  {notice.content.length > 120 && (
                    <button
                      onClick={() =>
                        setExpandedContentId(
                          expandedContentId === notice._id ? null : notice._id
                        )
                      }
                      className="text-indigo-600 text-xs font-semibold mt-1 hover:underline"
                    >
                      {expandedContentId === notice._id ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="sm:hidden flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <CalendarDays size={12} />
                    {new Date(notice.createdAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  
                  {/* Empty space filler for layout */}
                  <span className="hidden sm:block"></span>

                  {(notice.attachments?.length > 0 || notice.links?.length > 0) && (
                    <button
                      onClick={() =>
                        setExpandedAttachmentsId(
                          expandedAttachmentsId === notice._id ? null : notice._id
                        )
                      }
                      className="text-indigo-600 font-semibold hover:underline flex items-center gap-1 ml-auto"
                    >
                      Attachments <Info size={12} />
                    </button>
                  )}
                </div>

                {/* ATTACHMENTS */}
                {expandedAttachmentsId === notice._id && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    {notice.attachments?.map((file, idx) => (
                      <a
                        key={idx}
                       href={
  file.url.startsWith("http") 
    ? file.url 
    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${file.url}`
}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg font-medium"
                      >
                        📎 {file.fileName || "File"}
                      </a>
                    ))}

                    {notice.links?.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg font-medium"
                      >
                        🔗 {link.label || "Open"}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredNotices.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm">
              <TriangleAlert className="mx-auto text-slate-200 mb-4" size={40} />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No matching updates found</p>
            </div>
          )}
        </div>
      </div>
      
      <NoticeForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchNotices} 
      />
    </DashboardLayout>
  );
}