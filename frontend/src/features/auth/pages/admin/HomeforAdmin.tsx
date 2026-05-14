import { useEffect, useState } from "react";
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
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchUsers(statusFilter === "ALL" ? undefined : statusFilter, 0, PAGE_SIZE);
        setUsers(Array.isArray(response.content) ? response.content : []);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        setError("Failed to load users.");
        setUsers([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    void loadUsers();
  }, [statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

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
            <p className="mt-2 text-sm text-muted-foreground">
              Review and manage access for individual drivers and corporate entities.
            </p>
          </div>
          <div className="flex rounded-xl bg-[var(--app-surface-2)] p-1">
            {([
              { label: "All Users", value: "ALL" },
              { label: "Pending", value: "PENDING" },
              { label: "Approved", value: "APPROVED" },
            ] as const).map((item) => (
              <button
                key={item.value}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${statusFilter === item.value
                    ? "bg-[var(--app-surface)] text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-[var(--app-surface-3)]"
                  }`}
                onClick={() => setStatusFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-[var(--app-brand-soft)] p-2 text-[var(--app-brand)]">
                <span className="material-symbols-outlined">group</span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">+12% this week</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Active Users</p>
            <h3 className="text-3xl font-semibold">{totalApproved}</h3>
          </div>

          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-[var(--app-warning-soft)] p-2 text-[var(--app-warning)]">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <span className="text-xs font-bold text-[var(--app-danger)]">Action Required</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Pending Approvals</p>
            <h3 className="text-3xl font-semibold">{totalPending}</h3>
          </div>

          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-[var(--app-info-soft)] p-2 text-[var(--app-info)]">
                <span className="material-symbols-outlined">domain</span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">8 New Organizations</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Corporate Partners</p>
            <h3 className="text-3xl font-semibold">{totalOrganizations}</h3>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-surface)] p-6">
            <h3 className="text-sm font-semibold">User Registry</h3>
          </div>

          {error && (
            <div className="border-b border-[var(--app-border)] bg-[var(--app-danger-soft)] px-6 py-4 text-sm text-[var(--app-danger)]">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[var(--app-surface-2)]">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground">User Details</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground">Account Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]">
                {isLoading ? (
                  <tr>
                    <td className="px-6 py-6 text-sm text-muted-foreground" colSpan={5}>
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-sm text-muted-foreground" colSpan={5}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const status = normalizeStatus(user.approvalStatus);
                    const accountType =
                      user.userType?.toUpperCase() === "ORGANIZATION"
                        ? "Organization"
                        : "Individual";
                    const displayName =
                      user.fullName || user.companyName || user.email;
                    return (
                      <tr key={user.id} className="group transition-colors hover:bg-[var(--app-surface-2)]">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold">{displayName}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{user.role ?? "-"}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${accountType === "Individual"
                                ? "bg-[var(--app-brand-soft)] text-[var(--app-brand)]"
                                : "bg-[var(--app-surface-2)] text-muted-foreground"
                              }`}
                          >
                            {accountType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`flex items-center gap-2 text-xs font-bold uppercase ${status === "APPROVED" ? "text-[var(--app-info)]" : "text-[var(--app-warning)]"
                              }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${status === "APPROVED" ? "bg-[var(--app-info)]" : "bg-[var(--app-warning)]"
                                }`}
                            ></span>
                            {status}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-muted-foreground transition-colors hover:text-primary">
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

          <div className="flex items-center justify-between border-t border-[var(--app-border)] bg-[var(--app-surface)] px-6 py-4">
            <p className="text-xs text-muted-foreground">
              Showing {users.length} users on page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--app-border)] transition-colors hover:bg-[var(--app-surface-2)] disabled:opacity-40"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {getPageNumbers(page, totalPages).map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${pageNumber === page
                      ? "bg-primary text-primary-foreground"
                      : "border border-[var(--app-border)] hover:bg-[var(--app-surface-2)]"
                    }`}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--app-border)] transition-colors hover:bg-[var(--app-surface-2)] disabled:opacity-40"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </>
    </AdminLayout>
  );
}
