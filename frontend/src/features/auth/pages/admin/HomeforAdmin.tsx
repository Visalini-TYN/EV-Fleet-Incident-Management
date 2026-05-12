import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "@/features/auth/pages/admin/AdminLayout";
import {
  fetchUsers,
  type ApprovalStatus,
  type UserRecord,
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

export default function HomeforAdmin() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load users.");
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadUsers();
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

  const totalApproved = users.filter(
    (user) => normalizeStatus(user.approvalStatus) === "APPROVED",
  ).length;
  const totalPending = users.filter(
    (user) => normalizeStatus(user.approvalStatus) === "PENDING",
  ).length;
  const totalOrganizations = users.filter(
    (user) => user.userType?.toUpperCase() === "ORGANIZATION",
  ).length;

  return (
    <AdminLayout>
      <>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold">User Management</h2>
            <p className="mt-2 text-sm text-[#717783]">
              Review and manage access for individual drivers and corporate entities.
            </p>
          </div>
          <div className="flex rounded-xl bg-[#e6e8ef] p-1">
            {([
              { label: "All Users", value: "ALL" },
              { label: "Pending", value: "PENDING" },
              { label: "Approved", value: "APPROVED" },
            ] as const).map((item) => (
              <button
                key={item.value}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${statusFilter === item.value
                    ? "bg-white text-[#005797] shadow-sm"
                    : "text-[#414751] hover:bg-[#eceef5]"
                  }`}
                onClick={() => setStatusFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-[#c0c7d3]/20 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-[#005797]/10 p-2 text-[#005797]">
                <span className="material-symbols-outlined">group</span>
              </div>
              <span className="text-xs font-semibold text-[#717783]">+12% this week</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-[#717783]">Total Active Users</p>
            <h3 className="text-3xl font-semibold">{totalApproved}</h3>
          </div>

          <div className="rounded-xl border border-[#c0c7d3]/20 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-[#e8e700]/30 p-2 text-[#626200]">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <span className="text-xs font-bold text-[#ba1a1a]">Action Required</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-[#717783]">Pending Approvals</p>
            <h3 className="text-3xl font-semibold">{totalPending}</h3>
          </div>

          <div className="rounded-xl border border-[#c0c7d3]/20 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-[#ffb787]/30 p-2 text-[#884200]">
                <span className="material-symbols-outlined">domain</span>
              </div>
              <span className="text-xs font-semibold text-[#717783]">8 New Organizations</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-[#717783]">Corporate Partners</p>
            <h3 className="text-3xl font-semibold">{totalOrganizations}</h3>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#c0c7d3]/20 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#c0c7d3]/20 bg-white p-6">
            <h3 className="text-sm font-semibold">User Registry</h3>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-lg border border-[#717783] px-3 py-2 text-xs font-semibold transition-colors hover:bg-[#eceef5]">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filter
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-[#717783] px-3 py-2 text-xs font-semibold transition-colors hover:bg-[#eceef5]">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export
              </button>
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
                    const displayName =
                      user.fullName || user.companyName || user.email;
                    return (
                      <tr key={user.id} className="group transition-colors hover:bg-[#f0f7ff]">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold">{displayName}</p>
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
                          <button className="p-2 text-[#717783] transition-colors hover:text-[#005797]">
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
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
      </>
    </AdminLayout>
  );
}
