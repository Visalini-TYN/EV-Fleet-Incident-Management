import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export default function ApprovalSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8e6_0%,_#fef3c7_35%,_#fef9c3_70%,_#ffffff_100%)] text-slate-900">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-24 h-56 w-56 rounded-full bg-orange-200/40 blur-3xl" />

        <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
            <ShieldCheck className="h-4 w-4" />
            Compliance Cleared
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Authorization Approved
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Your organization has been verified and approved. You can now access
            the driver dashboard and start managing fleet incidents without any
            restrictions.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              className="bg-amber-600 text-white hover:bg-amber-700"
              onClick={() => navigate("/driver")}
            >
              Continue to Dashboard
            </Button>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-amber-600" />
              Approval status is active
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Incident Tracking",
                detail: "Monitor and respond to fleet incidents in real time.",
              },
              {
                title: "Vehicle Oversight",
                detail: "View vehicle health and service status at a glance.",
              },
              {
                title: "Compliance Reports",
                detail: "Access exportable logs for regulatory audits.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-amber-100 bg-white/80 p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
