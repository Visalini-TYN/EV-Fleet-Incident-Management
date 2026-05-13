import StatCard from "../components/StatCard";
import IncidentTable from "../components/IncidentTable";
import { useIncidents } from "../hooks/use-incidents";
import { SafeIcon } from "../../../components/SafeIcon";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "New priority complaint assigned",
    description: "Battery failure ticket #1003 added to your queue.",
    time: "3m ago",
    status: "New",
  },
  {
    id: 2,
    title: "Technician on the way",
    description: "David is en route to Tesla M3 / Unit 402.",
    time: "14m ago",
    status: "In Progress",
  },
  {
    id: 3,
    title: "SLA alert triggered",
    description: "Complaint #1001 crossed the critical SLA threshold.",
    time: "35m ago",
    status: "Urgent",
  },
];

export default function Dashboard() {
  const { data } = useIncidents();
  const incidents = data ?? [];
  const topComplaint = incidents[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Active Incidents" value={24} />
        <StatCard title="Critical SLAs" value={6} />
        <StatCard title="Resolved Today" value={18} />
        <StatCard title="Avg Resolution" value={"42m"} />
      </div>

      <IncidentTable data={data ?? []} />
    </div>
  );
}