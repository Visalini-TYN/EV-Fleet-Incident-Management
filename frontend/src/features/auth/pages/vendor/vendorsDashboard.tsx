import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import IncidentTable from "../components/IncidentTable";
import { useIncidents } from "../hooks/use-incidents";
import { incidentsApi } from "@/lib/api/incidents";
import { SafeIcon } from "../../../components/SafeIcon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
    const { data } = useIncidents();
    const [technicians, setTechnicians] = useState<any[]>([]);
    const incidents = data ?? [];
    
    useEffect(() => {
        const fetchTechs = async () => {
            try {
                const data = await incidentsApi.getTechnicians();
                setTechnicians(data.slice(0, 5)); // Just top 5 for dashboard
            } catch (err) {
                console.error(err);
            }
        };
        fetchTechs();
    }, []);

    const activeCount = incidents.filter(i => i.status !== 'RESOLVED').length;
    const resolvedToday = incidents.filter(i => i.status === 'RESOLVED').length;
    const openIncidents = incidents.filter(i => i.status === 'OPEN').length;

    // Derived notifications from real data
    const recentActivity = incidents
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 3)
        .map(inc => ({
            id: inc.id,
            title: inc.status === 'OPEN' ? "New Assignment" : `Status Update: ${inc.status}`,
            description: `Incident #${inc.id} - ${inc.issueCategory || 'General Issue'}`,
            time: "Recently",
            icon: inc.status === 'OPEN' ? "Bell" : "Clock",
            color: inc.status === 'OPEN' ? "blue" : "amber"
        }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vendor Command Center</h1>
                    <p className="text-slate-500 mt-1">Real-time overview of fleet incidents and field operations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                        <SafeIcon name="Download" className="w-4 h-4" />
                        Export Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
                        <SafeIcon name="Plus" className="w-4 h-4" />
                        New Log
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Active Incidents" 
                    value={activeCount} 
                    icon="ClipboardList"
                />
                <StatCard 
                    title="Open Requests" 
                    value={openIncidents} 
                    icon="Zap"
                />
                <StatCard 
                    title="Resolved Today" 
                    value={resolvedToday} 
                    icon="CheckCircle"
                />
                <StatCard 
                    title="Available Techs" 
                    value={technicians.length} 
                    icon="User"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-slate-50/50">
                            <CardTitle className="text-lg font-bold text-slate-800">Recent Incident Feed</CardTitle>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-bold px-3">Live</Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            <IncidentTable data={incidents.slice(0, 5)} showActions={true} showTechnician={true} />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 bg-slate-50/50">
                            <CardTitle className="text-lg font-bold text-slate-800">Technician Roster</CardTitle>
                            <button className="text-xs font-bold text-blue-600 hover:underline">View Team</button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {technicians.map((tech) => (
                                    <div key={tech.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                {tech.name?.split(" ").map((n: string) => n[0]).join("") || 'T'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{tech.name}</p>
                                                <p className="text-[10px] text-slate-500">{tech.contactNo}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-700 border-green-200 uppercase text-[9px] font-bold">
                                            Available
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-slate-200/60 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <SafeIcon name="Bell" className="w-5 h-5 text-blue-600" />
                                Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recentActivity.length > 0 ? recentActivity.map((notif) => (
                                <div key={notif.id} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center bg-${notif.color}-100 text-${notif.color}-600`}>
                                        <SafeIcon name={notif.icon} className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-bold text-slate-900 truncate">{notif.title}</p>
                                            <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{notif.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{notif.description}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-6 text-center text-slate-400 text-xs italic">No recent activity.</div>
                            )}
                            <button className="w-full py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-blue-200 mt-2">
                                View All Notifications
                            </button>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <CardContent className="p-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
                                <SafeIcon name="Info" className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Performance Milestone</h3>
                            <p className="text-slate-400 text-xs leading-relaxed">
                                Your organization has maintained a 98% SLA compliance rate this month. Keep up the excellent response times!
                            </p>
                            <button className="mt-4 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                                Review detailed stats
                                <SafeIcon name="ChevronRight" className="w-3 h-3" />
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}