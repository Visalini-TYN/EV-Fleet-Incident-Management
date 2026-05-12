import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "@/features/auth/pages/admin/AdminLayout";
import {
  assignVehicle,
  fetchUsers,
  fetchVehicles,
  updateUserStatus,
  type ApprovalStatus,
  type UserRecord,
  type VehicleRecord,
} from "@/lib/api/admin";

type StatusFilter = "ALL" | ApprovalStatus;

const PAGE_SIZE = 5;

const normalizeStatus = (status?: string) =>
  (status || "PENDING").toUpperCase() as ApprovalStatus;

const getPageNumbers = (current: number, total: number, windowSize = 5) => {
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, start + windowSize - 1);
  if (end - start + 1 < windowSize) {
    start = Math.max(1, end - windowSize + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const getDisplayName = (user: UserRecord) =>
  user.fullName || user.companyName || user.email;

export default function AdminOnboardingPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadUsers = async (status?: ApprovalStatus) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUsers(status);
      const nextUsers = Array.isArray(data) ? data : [];
      setUsers(nextUsers);
      if (nextUsers.length > 0) {
        setSelectedUserId((prev) => {
          const stillExists = nextUsers.some((user) => user.id === prev);
          return stillExists ? prev : nextUsers[0].id;
        });
      } else {
        setSelectedUserId(null);
      }
    } catch (err) {
      setError("Failed to load users.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers(statusFilter === "ALL" ? undefined : statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await fetchVehicles();
        const list = Array.isArray(data) ? data : [];
        setVehicles(list);
        if (list.length > 0) {
          setSelectedVehicleId((prev) => prev ?? list[0].id);
        }
      } catch {
        setVehicles([]);
      }
    };

    void loadVehicles();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const filteredUsers = useMemo(() => {
    if (statusFilter === "ALL") return users;
    return users.filter(
      (user) => normalizeStatus(user.approvalStatus) === statusFilter,
    );
  }, [users, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const selectedUser = users.find((user) => user.id === selectedUserId) || null;
  const selectedStatus = normalizeStatus(selectedUser?.approvalStatus);
  const selectedAccountType =
    selectedUser?.userType?.toUpperCase() === "ORGANIZATION"
      ? "Organization"
      : "Individual";

  const handleUpdateStatus = async (
    targetId: number,
    nextStatus: ApprovalStatus,
  ) => {
    setActionMessage(null);
    try {
      await updateUserStatus(targetId, nextStatus);
      setActionMessage(`Status updated to ${nextStatus}.`);
      await loadUsers(statusFilter === "ALL" ? undefined : statusFilter);
    } catch {
      setActionMessage("Failed to update status.");
    }
  };

  const handleAssignVehicle = async () => {
    if (!selectedUser || !selectedVehicleId) return;
    setActionMessage(null);
    try {
      await assignVehicle(selectedVehicleId, selectedUser.id);
      setActionMessage("Vehicle assigned successfully.");
    } catch {
      setActionMessage("Failed to assign vehicle.");
    }
  };

  return (
    <AdminLayout>
      <div className="overflow-hidden rounded-xl border border-[#c0c7d3]/20 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#c0c7d3]/20 bg-white p-6">
          <h3 className="text-sm font-semibold">User Registry</h3>
          <div className="flex gap-2">
            {([
              { label: "All", value: "ALL" },
              { label: "Pending", value: "PENDING" },
              { label: "Approved", value: "APPROVED" },
            ] as const).map((item) => (
              <button
                key={item.value}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${statusFilter === item.value
                    ? "bg-[#005797] text-white"
                    : "border border-[#717783] text-[#414751] hover:bg-[#eceef5]"
                  }`}
                onClick={() => setStatusFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="border-b border-[#c0c7d3]/20 bg-red-50 px-6 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#f1f3fb]">
                <th className="px-6 py-4 text-xs font-semibold text-[#717783]">User Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#717783]">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#717783]">Account Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#717783]">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#717783]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c0c7d3]/20">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-[#717783]" colSpan={5}>
                    Loading users...
                  </td>
                </tr>
              ) : pagedUsers.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-[#717783]" colSpan={5}>
                    No users found.
                  </td>
                </tr>
              ) : (
                pagedUsers.map((user) => {
                  const status = normalizeStatus(user.approvalStatus);
                  const accountType =
                    user.userType?.toUpperCase() === "ORGANIZATION"
                      ? "Organization"
                      : "Individual";
                  const isSelected = user.id === selectedUserId;
                  return (
                    <tr
                      key={user.id}
                      className={`group cursor-pointer transition-colors hover:bg-[#f0f7ff] ${isSelected ? "bg-[#f0f7ff]" : ""
                        }`}
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold">{getDisplayName(user)}</p>
                          <p className="text-xs text-[#717783]">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#717783]">{user.role ?? "-"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${accountType === "Individual"
                              ? "bg-[#005797]/10 text-[#005797]"
                              : "bg-[#e6e8ef] text-[#414751]"
                            }`}
                        >
                          {accountType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`flex items-center gap-2 text-xs font-bold uppercase ${status === "APPROVED" ? "text-[#0070c0]" : "text-[#626200]"
                            }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${status === "APPROVED" ? "bg-[#0070c0]" : "bg-[#626200]"
                              }`}
                          ></span>
                          {status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-lg bg-[#e8e700] px-3 py-2 text-xs font-semibold text-[#1d1d00] shadow-sm transition-all hover:brightness-95 disabled:opacity-50"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleUpdateStatus(user.id, "APPROVED");
                            }}
                            disabled={status !== "PENDING"}
                          >
                            Approve
                          </button>
                          <button
                            className="rounded-lg border border-[#ba1a1a] px-3 py-2 text-xs font-semibold text-[#ba1a1a] transition-colors hover:bg-[#ffdad6] disabled:opacity-50"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleUpdateStatus(user.id, "REJECTED");
                            }}
                            disabled={status !== "PENDING"}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#c0c7d3]/20 bg-white px-6 py-4">
          <p className="text-xs text-[#717783]">
            Showing {pagedUsers.length} of {filteredUsers.length} users
          </p>
          <div className="flex items-center gap-2">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c0c7d3] transition-colors hover:bg-[#eceef5] disabled:opacity-40"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 text-[#717783]" />
            </button>
            {getPageNumbers(currentPage, totalPages).map((pageNumber) => (
              <button
                key={pageNumber}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${pageNumber === currentPage
                    ? "bg-[#005797] text-white"
                    : "border border-[#c0c7d3] hover:bg-[#eceef5]"
                  }`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c0c7d3] transition-colors hover:bg-[#eceef5] disabled:opacity-40"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4 text-[#717783]" />
            </button>
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="mt-6 rounded-xl border border-[#c0c7d3]/20 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-lg font-semibold">{getDisplayName(selectedUser)}</h4>
              <p className="text-sm text-[#717783]">{selectedUser.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-lg bg-[#e8e700] px-4 py-2 text-xs font-semibold text-[#1d1d00] shadow-sm transition-all hover:brightness-95 disabled:opacity-50"
                onClick={() => void handleUpdateStatus(selectedUser.id, "APPROVED")}
                disabled={selectedStatus !== "PENDING"}
              >
                Approve
              </button>
              <button
                className="rounded-lg border border-[#ba1a1a] px-4 py-2 text-xs font-semibold text-[#ba1a1a] transition-colors hover:bg-[#ffdad6] disabled:opacity-50"
                onClick={() => void handleUpdateStatus(selectedUser.id, "REJECTED")}
                disabled={selectedStatus !== "PENDING"}
              >
                Reject
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-[#717783]">Role</p>
              <p className="font-semibold text-[#181c21]">{selectedUser.role ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[#717783]">Account Type</p>
              <p className="font-semibold text-[#181c21]">{selectedAccountType}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[#717783]">Status</p>
              <p className="font-semibold text-[#181c21]">{selectedStatus}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label className="text-xs uppercase text-[#717783]">Assign Vehicle</label>
              <select
                className="mt-1 w-full rounded-md border border-[#c0c7d3] bg-white px-3 py-2 text-sm"
                value={selectedVehicleId ?? ""}
                onChange={(event) => setSelectedVehicleId(Number(event.target.value))}
                disabled={vehicles.length === 0}
              >
                {vehicles.length === 0 && <option value="">No vehicles</option>}
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.registrationNumber || vehicle.vehicleNumber || vehicle.name ||
                      `Vehicle ${vehicle.id}`}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="rounded-lg bg-[#005797] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#00457a] disabled:opacity-50"
              onClick={() => void handleAssignVehicle()}
              disabled={!selectedVehicleId || vehicles.length === 0}
            >
              Assign Vehicle
            </button>
          </div>

          {actionMessage && (
            <p className="mt-3 text-sm text-[#005797]">{actionMessage}</p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
