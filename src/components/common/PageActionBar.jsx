"use client";

import Link from "next/link";
import ProfessionalPrintDocument from "./ProfessionalPrintDocument";
import ReportExportButtons from "./ReportExportButtons";
import { readSession } from "@/lib/authSession";
import { canUseWriteActions } from "@/lib/rbac";

function ToolbarIcon({ type }) {
  const commonProps = {
    "aria-hidden": "true",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "h-4 w-4",
  };

  const paths = {
    add: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
  };

  return <svg {...commonProps}>{paths[type]}</svg>;
}

export default function PageActionBar({
  addHref,
  addLabel = "Add New",
  onPrint,
  exportData,
  exportFileName,
  printTitle,
  printColumns,
  children,
}) {
  const currentUser = readSession();
  const canAddRecords = canUseWriteActions(currentUser);

  return (
    <>
      <section className="no-print mb-3 rounded-[22px] border border-[#2c3f63] bg-[#18253d] p-2.5 shadow-[0_14px_30px_rgba(6,12,24,0.12)]">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-end gap-2">
            {addHref && canAddRecords && (
              <Link
                href={addHref}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6a3df0] to-[#8b5cf6] px-4 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(106,61,240,0.2)] hover:from-[#5f35df] hover:to-[#7c4cf3]"
              >
                <ToolbarIcon type="add" />
                {addLabel}
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {children}
            <ReportExportButtons
              data={exportData || []}
              fileName={exportFileName || "records"}
              showDataExports={Boolean(exportData)}
              columns={printColumns}
            />
          </div>
        </div>
      </section>
      {exportData && (
        <ProfessionalPrintDocument
          title={printTitle || "Records"}
          data={exportData}
          columns={printColumns}
          fileName={exportFileName || "records"}
        />
      )}
    </>
  );
}
