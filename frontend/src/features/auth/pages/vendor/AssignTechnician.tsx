import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import VendorLayout from "./VendorLayout";
import { SafeIcon } from "../../components/SafeIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { incidentsApi } from "@/lib/api/incidents";

export default function AssignTechnician() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchTechs = async () => {
      try {
        setLoading(true);
        const data = await incidentsApi.getTechnicians();
        const safeData = Array.isArray(data) ? data : (data?.content ? data.content : []);
        setTechnicians(safeData);
      } catch (err) {
        console.error("Failed to fetch technicians:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTechs();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
        if (notification.type === 'success') {
          navigate("/vendor/assigned");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, navigate]);

  const handleAssign = async () => {
    if (!selectedTech || !id) return;
    try {
      setAssigning(true);
      await incidentsApi.assignTechnician(Number(id), selectedTech);
      setNotification({ message: `Technician successfully assigned to incident #${id}`, type: 'success' });
    } catch (err) {
      setNotification({ message: 'Failed to assign technician.', type: 'error' });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <VendorLayout>
      {notification && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-4 text-sm font-semibold text-white z-50 rounded-lg animate-in slide-in-from-bottom-2 fade-in duration-300 ${
            notification.type === 'success'
              ? 'bg-green-500'
              : 'bg-red-500'
          }`}
        >
          {notification.message}
        </div>
      )}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <SafeIcon name="ArrowLeft" className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Assign Technician</h1>
            <p className="text-slate-500">Incident ID: #{id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Select Available Technician</h2>
            {loading ? (
              <div className="py-10 text-center">Loading technicians...</div>
            ) : technicians.length === 0 ? (
              <div className="py-10 text-center text-slate-400">No technicians found in your organization.</div>
            ) : (
              <div className="grid gap-4">
                {technicians.map((tech) => (
                  <Card
                    key={tech.id}
                    className={`cursor-pointer transition-all border-2 ${selectedTech === tech.id
                        ? "border-blue-600 bg-blue-50/30"
                        : "border-transparent hover:border-slate-200"
                      }`}
                    onClick={() => setSelectedTech(tech.id)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border border-slate-200">
                          <AvatarImage src={tech.image} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                            {tech.name?.split(" ").map((n: string) => n[0]).join("") || 'T'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-slate-900">{tech.name}</div>
                          <div className="text-sm text-slate-500">{tech.contactNo}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                              {tech.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      {selectedTech === tech.id && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <SafeIcon name="Check" className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg border-blue-100">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-base">Assignment Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="text-xs text-slate-500 font-bold uppercase">Incident</div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="font-bold text-slate-900">#{id}</div>
                  </div>
                </div>

                {selectedTech && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="text-xs text-slate-500 font-bold uppercase">Technician</div>
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                      <div className="font-bold text-blue-900">
                        {technicians.find(t => t.id === selectedTech)?.name}
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full h-12 text-base font-bold shadow-md shadow-blue-200"
                  disabled={!selectedTech || assigning}
                  onClick={handleAssign}
                >
                  {assigning ? "Assigning..." : "Confirm Assignment"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
