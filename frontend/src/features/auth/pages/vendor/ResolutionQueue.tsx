import { useState } from "react";
import { SafeIcon } from "../../../components/SafeIcon";
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

            <IncidentTable
                data={filteredData}
                title="Queue Details"
                showViewAll={false}
                showTechnician={true}
                showActions={true}
            />
        </div>
        </VendorLayout>
    );
}