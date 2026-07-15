"use client";

import { useEffect, useState } from "react";
import LayoutWrapper from "./LayoutWrapper";
import BackButton from "./BackButton";
import ProfessionalPrintDocument from "./ProfessionalPrintDocument";
import ReportExportButtons from "./ReportExportButtons";
import { getReportBrandingSettings } from "@/lib/apiClient";
import {
  DEFAULT_REPORT_BRANDING,
  REPORT_BRANDING_KEY,
  mapReportBrandingFromApi,
  readStoredReportBranding,
} from "@/lib/reportBranding";

function buildReportId(fileName) {
  return `${fileName.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toUpperCase()}-2026`;
}

export default function ReportPageShell({
  title,
  data = [],
  fileName = "report",
  printColumns,
  children,
}) {
  const [branding, setBranding] = useState(() => readStoredReportBranding());

  useEffect(() => {
    let isMounted = true;

    getReportBrandingSettings()
      .then((apiSettings) => {
        if (!isMounted) {
          return;
        }

        const nextBranding = {
          ...DEFAULT_REPORT_BRANDING,
          ...mapReportBrandingFromApi(apiSettings),
        };
        setBranding(nextBranding);
        localStorage.setItem(REPORT_BRANDING_KEY, JSON.stringify(nextBranding));
      })
      .catch(() => {
        if (isMounted) {
          setTimeout(() => {
            if (isMounted) {
              setBranding(readStoredReportBranding());
            }
          }, 0);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <LayoutWrapper>
      <section className="no-print mb-3 rounded-[22px] border border-[#2c3f63] bg-[#18253d] p-2.5 shadow-[0_14px_30px_rgba(6,12,24,0.12)]">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <BackButton href="/reports" label="Reports" />
          <ReportExportButtons
            data={data}
            fileName={fileName}
            showDataExports={Boolean(data?.length)}
            columns={printColumns}
            branding={branding}
          />
        </div>
      </section>

      <section className="screen-report no-print overflow-hidden rounded-[24px] border border-[#2c3f63] bg-[#18253d] shadow-sm">
        <header className="report-letterhead border-b border-[#314666] bg-[#101a2b] px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8fa4c7]">
                {branding.reportClassification} Report
              </p>
              <h1 className="mt-1 text-2xl font-black text-white">
                {branding.companyName}
              </h1>
              <p className="mt-1 text-sm font-semibold text-[#c8d4ec]">
                {title}
              </p>
            </div>
            <div className="text-left text-xs font-semibold leading-5 text-[#c8d4ec] md:text-right">
              <p>{branding.companyAddress}</p>
              <p>{branding.companyEmail}</p>
              <p>{branding.companyPhone}</p>
            </div>
          </div>
        </header>

        <div className="report-body bg-[#18253d] px-5 py-5">
          <section className="report-section">
            {children}
          </section>
        </div>

        <footer className="report-footer flex items-center justify-between gap-3 border-t border-[#314666] bg-[#101a2b] px-5 py-3 text-xs text-[#c8d4ec]">
          <p className="font-semibold">Report ID: {buildReportId(fileName)}</p>
          <p className="font-semibold">{data.length} records</p>
        </footer>
      </section>

      <ProfessionalPrintDocument
        title={title}
        data={data}
        columns={printColumns}
        fileName={fileName}
        branding={branding}
      />
    </LayoutWrapper>
  );
}
