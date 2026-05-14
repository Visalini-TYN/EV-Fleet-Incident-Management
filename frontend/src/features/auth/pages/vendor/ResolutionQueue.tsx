import { useState } from "react";
import { SafeIcon } from "../../components/SafeIcon";
import IncidentTable from "../components/IncidentTable";
import { useIncidents } from "../hooks/use-incidents";
import StatCard from "../components/StatCard";
import VendorLayout from "./VendorLayout";

const tabs = [
    { id: "all", name: "Resolution Queue", count: 0 },
    { id: "pending", name: "Pending Review", count: 0 },
];

export default function ResolutionQueue() {
    const [activeTab, setActiveTab] = useState("all");
    const { data: complaints, loading, error } = useIncidents();

    if (loading) {
        return (
            <VendorLayout>
                <div className="h-[60vh] w-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium animate-pulse">Loading queue...</p>
                    </div>
                </div>
            </VendorLayout>
        );
    }

    const filteredData = activeTab === "pending"
        ? (complaints?.filter(c => c.status === 'IN_PROGRESS') || [])
        : (complaints || []);

    const total = complaints?.length || 0;
    const resolved = complaints?.filter(c => c.status === 'RESOLVED').length || 0;
    const inProgress = complaints?.filter(c => c.status === 'IN_PROGRESS').length || 0;
    const open = complaints?.filter(c => c.status === 'OPEN').length || 0;

    return (
        <VendorLayout>
            <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                    <StatCard title="Total Queue" value={total} />
                    <StatCard title="Open" value={open} />
                    <StatCard title="In Progress" value={inProgress} />
                    <StatCard title="Resolved" value={resolved} />
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-slate-900">Resolution Queue</h1>

                        <div className="flex items-center gap-3">
                            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                                <SafeIcon name="Filter" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

                    <div className="flex items-center border-b border-slate-200 gap-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? "text-brand-blue" : "text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    {tab.name}
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-brand-blue-light text-brand-blue" : "bg-slate-100 text-slate-500"
                                        }`}>
                                        {tab.id === 'all' ? complaints?.length || 0 : complaints?.filter(c => c.status === 'IN_PROGRESS').length || 0}
                                    </span>
                                </span>
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full"></div>
                                )}
                            </button>
                        ))}
                    </div>

                </div>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Queue Details</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Incident ID</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Incident Details</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Assigned Technician</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.length > 0 ? filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">#{item.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{item.issueCategory}</div>
                                            <div className="text-slate-500 text-xs mt-0.5">{item.description || item.issueDescription || 'No description provided'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${item.technicianName || item.technicianId ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {item.technicianName ? item.technicianName.charAt(0) : (item.technicianId ? 'T' : '-')}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-medium ${item.technicianName || item.technicianId ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                                                        {item.technicianName || (item.technicianId ? `Tech #${item.technicianId}` : 'Unassigned')}
                                                    </span>
                                                    {item.technicianId && (
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase">ID: {item.technicianId}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-10 text-center text-slate-400">
                                            No incidents in the resolution queue.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </VendorLayout>
    );
}