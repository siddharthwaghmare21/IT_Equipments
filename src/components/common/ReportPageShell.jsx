"use client";

import BackButton from "./BackButton";
import LayoutWrapper from "./LayoutWrapper";
import PageHeader from "./PageHeader";
import ReportExportButtons from "./ReportExportButtons";

export default function ReportPageShell({
  title,
  description,
  data,
  fileName,
  children,
}) {
  const generatedDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <LayoutWrapper>
      <PageHeader title={title} description={description} />

      <section className="print-area rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                IT Assets & Equipment Management
              </p>
              <h2 className="mt-1 text-xl font-bold text-gray-900">{title}</h2>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">
                {description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1">
                  Generated: {generatedDate}
                </span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1">
                  Source: Frontend Demo Data
                </span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1">
                  Backend: Pending
                </span>
              </div>
            </div>

            <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center">
              <BackButton href="/reports" label="Reports" />
              <ReportExportButtons data={data} fileName={fileName} />
            </div>
          </div>
        </div>

        <div className="space-y-6 p-5">{children}</div>
      </section>
    </LayoutWrapper>
  );
}
