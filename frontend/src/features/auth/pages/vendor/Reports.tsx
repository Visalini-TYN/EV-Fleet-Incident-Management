import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import { SafeIcon } from "../../../components/SafeIcon";
import { useIncidents } from "../hooks/use-incidents";
import StatCard from "../components/StatCard";
import VendorLayout from "./VendorLayout";

const COLORS = ['#0052CC', '#E2FB5E', '#CBD5E1', '#FCA5A5'];

export default function Reports() {
    const { data: complaints, loading, error } = useIncidents();

    if (loading) {
        return (
            <VendorLayout>
                <div className="h-[60vh] w-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium animate-pulse">Generating reports...</p>
                    </div>
                </div>
            </VendorLayout>
        );
    }

    // Calculate dynamic stats
    const total = complaints?.length || 0;
    const resolved = complaints?.filter(c => c.status === 'RESOLVED').length || 0;
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : "0";

    // Priority Breakdown
    const priorityBreakdown = [
        { name: 'OPEN', value: complaints?.filter(c => c.status === 'OPEN').length || 0 },
        { name: 'IN PROGRESS', value: complaints?.filter(c => (c.status === 'IN_PROGRESS' || c.status === 'IN_REPAIR')).length || 0 },
        { name: 'RESOLVED', value: complaints?.filter(c => c.status === 'RESOLVED').length || 0 },
    ].filter(p => p.value > 0);

    // Category Breakdown
    const categoryMap: Record<string, number> = {};
    complaints?.forEach(c => {
        categoryMap[c.issueCategory] = (categoryMap[c.issueCategory] || 0) + 1;
    });
    const barData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    return (
        <VendorLayout>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Live Reports</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Real-time data from Complaint API</p>
                </div>
                <button className="btn-primary flex items-center gap-2 text-sm">
                    <SafeIcon name="Download" className="w-4 h-4" />
                    Export Data
                </button>
            </div>

            {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg">{error}</p>}

            <div className="grid grid-cols-4 gap-4">
                <StatCard title="Total Complaints" value={total} />
                <StatCard title="Resolved" value={resolved} />
                <StatCard title="Resolution Rate" value={`${resolutionRate}%`} />
                <StatCard title="Active Issues" value={total - resolved} />
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 saas-card !p-0">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Complaint Categories</h3>
                    </div>
                    <div className="p-6 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
                                    width={120}
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar
                                    dataKey="value"
                                    fill="#0052CC"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="saas-card !p-0">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Status Distribution</h3>
                    </div>
                    <div className="p-6 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={priorityBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {priorityBreakdown.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col gap-2 px-4 mt-2">
                            {priorityBreakdown.map((d, i) => (
                                <div key={d.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{d.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-900">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="saas-card bg-slate-50 border-2 border-dashed flex flex-col items-center justify-center py-10">
                <SafeIcon name="History" className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-500">Historical trend data will be available as more complaints are logged.</p>
            </div>
        </div>
        </VendorLayout>
    );
}