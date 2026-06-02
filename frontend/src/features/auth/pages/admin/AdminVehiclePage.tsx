import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
 DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import AdminLayout from "./AdminLayout";
import { vehiclesApi } from "@/lib/api/vehicles";

export default function AdminVehiclePage() {
  const [openModal, setOpenModal] = useState(false);

  const [vehicles, setVehicles] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // FORM STATE FOR NEW VEHICLE
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [vin, setVin] = useState("");
  const [year, setYear] = useState<string>("");
  const [battery, setBattery] = useState<string>("");
  const [chassisNo, setChassisNo] = useState("");
  const [saving, setSaving] = useState(false);

  // FILTER STATES
  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const vehiclesData = await vehiclesApi.getAll();
      setVehicles(vehiclesData ?? []);
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
      setError("Failed to load vehicles. Please try again later.");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // FILTERED VEHICLES
  const filteredVehicles = vehicles.filter((vehicle: any) => {
    const matchesSearch =
      vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : vehicle.status?.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f8f9ff] text-slate-900 flex flex-col">
        <main className="mx-auto w-full max-w-7xl flex-1 px-8 py-10">
          {/* PAGE HEADER */}
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Admin Vehicle Inventory
              </h1>

              <p className="mt-2 text-slate-500 text-lg">
                Manage and monitor your enterprise electric vehicle fleet
                assets.
              </p>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap gap-3">
              {/* SEARCH */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[#0070c0]"
                />
              </div>

              {/* STATUS FILTER */}
              <div className="flex items-center rounded-xl border bg-slate-100 p-1">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    statusFilter === "ALL"
                      ? "bg-[#005797] text-white shadow-sm"
                      : "text-slate-600 hover:text-[#005797]"
                  }`}
                >
                  All
                </button>

                <button
                  onClick={() => setStatusFilter("ACTIVE")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    statusFilter === "ACTIVE"
                      ? "bg-[#005797] text-white shadow-sm"
                      : "text-slate-600 hover:text-[#005797]"
                  }`}
                >
                  Active
                </button>

                <button
                  onClick={() => setStatusFilter("INACTIVE")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    statusFilter === "INACTIVE"
                      ? "bg-[#005797] text-white shadow-sm"
                      : "text-slate-600 hover:text-[#005797]"
                  }`}
                >
                  Inactive
                </button>
              </div>

              <Button
                variant="outline"
                className="border-[#005797] text-[#005797]"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>

              <Button
                className="bg-[#0070c0] hover:bg-[#005797]"
                onClick={() => setOpenModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-[#0070c0]" />

                <p className="mt-4 text-slate-600">
                  Loading vehicles...
                </p>
              </div>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading &&
            !error &&
            filteredVehicles.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <h3 className="text-lg font-semibold text-slate-700">
                  No vehicles found
                </h3>

                <p className="mt-2 text-slate-500">
                  Try changing your filters or search term.
                </p>
              </div>
            )}

          {/* VEHICLE GRID */}
          {!loading &&
            !error &&
            filteredVehicles.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredVehicles.map(
                  (vehicle: any, index: number) => (
                    <div
                      key={index}
                      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                    >
                      {/* HEADER */}
                      <div className="mb-6 flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900">
                            {vehicle.make}
                          </h3>

                          <p className="text-slate-500">
                            {vehicle.model}
                          </p>
                        </div>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-[#005797]">
                          {vehicle.licensePlate}
                        </span>
                      </div>

                      {/* DETAILS */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">
                            VIN
                          </span>

                          <span className="font-medium text-slate-800">
                            {vehicle.vin}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">
                            Year
                          </span>

                          <span className="font-medium text-slate-800">
                            {vehicle.yearOfManufacture}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">
                            Battery
                          </span>

                          <span className="font-medium text-slate-800">
                            {vehicle.batteryCapacityKwh} kWh
                          </span>
                        </div>

                        <div className="flex justify-between gap-4 text-sm">
                          <span className="whitespace-nowrap text-slate-500">
                            Chassis
                          </span>

                          <span className="text-right font-medium text-slate-800">
                            {vehicle.chassisNo ||
                              "Not recorded"}
                          </span>
                        </div>
                      </div>

                      {/* FOOTER */}
                      <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              vehicle.status === "INACTIVE"
                                ? "bg-red-500"
                                : "bg-green-500"
                            }`}
                          />

                          <span className="text-sm font-medium text-slate-600">
                            {vehicle.status || "ACTIVE"}
                          </span>
                        </div>

                        <button className="text-sm font-semibold text-[#005797] hover:underline">
                          View Details
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
        </main>

        {/* FOOTER */}
        <footer className="border-t bg-white px-8 py-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-800">
                VoltFleet
              </span>

              <span className="text-sm text-slate-500">
                © 2024 VoltFleet Enterprise Solutions.
              </span>
            </div>

            <div className="flex flex-wrap gap-5 text-sm text-slate-500">
              <button className="hover:text-[#005797]">
                Privacy Policy
              </button>

              <button className="hover:text-[#005797]">
                Terms of Service
              </button>

              <button className="hover:text-[#005797]">
                Security Audit
              </button>
            </div>
          </div>
        </footer>

        {/* ADD VEHICLE MODAL */}
        <Dialog
          open={openModal}
          onOpenChange={setOpenModal}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Add New Vehicle
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                placeholder="Make"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="h-11 rounded-md border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-[#0070c0]/20"
              />

              <input
                placeholder="Model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="h-11 rounded-md border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-[#0070c0]/20"
              />

              <input
                placeholder="License Plate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="h-11 rounded-md border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-[#0070c0]/20"
              />

              <input
                placeholder="VIN"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                className="h-11 rounded-md border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-[#0070c0]/20"
              />

              <input
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-11 rounded-md border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-[#0070c0]/20"
              />

              <input
                placeholder="Battery Capacity"
                value={battery}
                onChange={(e) => setBattery(e.target.value)}
                className="h-11 rounded-md border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-[#0070c0]/20"
              />

              <input
                placeholder="Chassis Number"
                value={chassisNo}
                onChange={(e) => setChassisNo(e.target.value)}
                className="h-11 rounded-md border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-[#0070c0]/20 md:col-span-2"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setOpenModal(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>

              <Button
                className="bg-[#0070c0] hover:bg-[#005797]"
                onClick={async () => {
                  // Basic validation
                  if (!make || !model || !licensePlate) return;
                  setSaving(true);
                  try {
                    const payload: any = {
                      make,
                      model,
                      licensePlate,
                      vin,
                      chassisNo,
                      yearOfManufacture: year ? Number(year) : undefined,
                      batteryCapacityKwh: battery ? Number(battery) : undefined,
                      status: "AVAILABLE",
                    };

                    await vehiclesApi.create(payload);
                    // refresh list
                    await fetchVehicles();
                    // close and reset form
                    setOpenModal(false);
                    setMake("");
                    setModel("");
                    setLicensePlate("");
                    setVin("");
                    setYear("");
                    setBattery("");
                    setChassisNo("");
                  } catch (err) {
                    console.error("Failed to save vehicle:", err);
                    setError("Failed to save vehicle. Please try again.");
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Vehicle"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}