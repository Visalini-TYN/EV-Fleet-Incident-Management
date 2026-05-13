import { SafeIcon } from "../../../components/SafeIcon";
import IncidentTable from "../components/IncidentTable";
import { useIncidents } from "../hooks/use-incidents";
import StatCard from "../components/StatCard";
import VendorLayout from "./VendorLayout";

export default function AssignedIncidents() {
    const { data: allIncidents, loading, error } = useIncidents();
    const complaints = allIncidents?.filter(incident => incident.vendorId === "VEND-5001") || [];

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const total = complaints?.length || 0;
    const resolved = complaints?.filter(c => c.status === 'RESOLVED').length || 0;
    const inProgress = complaints?.filter(c => c.status === 'IN_PROGRESS').length || 0;
    const open = complaints?.filter(c => c.status === 'OPEN').length || 0;

    return (
        <VendorLayout>
        <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
                <StatCard title="Total Assigned" value={total} />
                <StatCard title="Open" value={open} />
                <StatCard title="In Progress" value={inProgress} />
                <StatCard title="Resolved" value={resolved} />
            </div>

            <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Assigned Complaints</h1>

                <div className="flex items-center gap-3">
                    <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                        <SafeIcon name="Filter" className="w-5 h-5" />
                    </button>
                    <button className="btn-primary flex items-center gap-2 text-sm">
                        <SafeIcon name="Download" className="w-4 h-4" />
                        Export List
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-center gap-3 text-red-700 text-sm font-bold">
                    <SafeIcon name="AlertCircle" className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="flex items-center gap-4">
                <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue-light cursor-pointer">
                    <option>All Status</option>
                    <option>OPEN</option>
                    <option>IN PROGRESS</option>
                    <option>RESOLVED</option>
                </select>

                <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue-light cursor-pointer">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Custom Range</option>
                </select>
            </div>

            </div>

            <IncidentTable
                data={complaints || []}
                title="Vendor Assigned Complaints"
                showViewAll={false}
            />

            {complaints && complaints.length > 0 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Showing {complaints.length} results</p>

                    <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30">
                            <SafeIcon name="ChevronLeft" className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded text-xs font-bold bg-brand-blue text-white shadow-md">1</button>
                        <button className="p-1.5 rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30">
                            <SafeIcon name="ChevronRight" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
        </VendorLayout>
    );
}