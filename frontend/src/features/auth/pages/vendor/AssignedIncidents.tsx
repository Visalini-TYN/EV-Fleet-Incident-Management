import { SafeIcon } from "../../components/SafeIcon";
import IncidentTable from "../components/IncidentTable";
import { useIncidents } from "../hooks/use-incidents";
import StatCard from "../components/StatCard";
import VendorLayout from "./VendorLayout";
import { Badge } from "@/components/ui/badge";

export default function AssignedIncidents() {
    const { data: allIncidents, loading, error } = useIncidents();
    const complaints = allIncidents || [];

    if (loading) {
        return (
            <VendorLayout>
                <div className="h-[60vh] w-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium animate-pulse">Loading assigned queue...</p>
                    </div>
                </div>
            </VendorLayout>
        );
    }

    const total = complaints?.length || 0;
    const resolved = complaints?.filter(c => c.status === 'RESOLVED').length || 0;
    const inProgress = complaints?.filter(c => c.status === 'IN_PROGRESS' || c.status === 'IN_REPAIR').length || 0;
    const open = complaints?.filter(c => c.status === 'OPEN').length || 0;

    return (
        <VendorLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <SafeIcon name="ClipboardList" className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Incident Management</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600">{total} Total Tickets</Badge>
                                <span className="text-slate-300 text-xs">•</span>
                                <span className="text-xs text-slate-500 font-medium italic">Showing items assigned to your organization</span>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Assigned" value={total} icon="ClipboardList" />
                    <StatCard title="Open Requests" value={open} icon="Zap" />
                    <StatCard title="In Progress" value={inProgress} icon="Clock" />
                    <StatCard title="Resolved" value={resolved} icon="CheckCircle" />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
                        <select className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm">
                            <option value="">All Status</option>
                            <option value="OPEN">OPEN</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="IN_REPAIR">IN REPAIR</option>
                            <option value="RESOLVED">RESOLVED</option>
                        </select>

                        <select className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm">
                            <option>Priority: All</option>
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                        </select>
                    </div>

                    {error && (
                        <div className="m-4 bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-700 text-sm font-bold">
                            <SafeIcon name="AlertCircle" className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <IncidentTable
                        data={complaints || []}
                        showActions={true}
                        showTechnician={true}
                    />

                    {complaints && complaints.length > 0 && (
                        <div className="flex items-center justify-between p-4 border-t border-slate-50 bg-slate-50/20">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                {complaints.length} tickets found
                            </p>

                            <div className="flex items-center gap-1">
                                <button className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-colors">
                                    <SafeIcon name="ChevronLeft" className="w-4 h-4" />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold bg-blue-600 text-white shadow-md shadow-blue-100">1</button>
                                <button className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-colors">
                                    <SafeIcon name="ChevronRight" className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </VendorLayout>
    );
}
