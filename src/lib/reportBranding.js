export const REPORT_BRANDING_KEY = "itReportBranding";

export const DEFAULT_REPORT_BRANDING = {
  companyName: "Sangli Miraj Kupwad Municipal Corporation",
  companyEmail: "it@smkc.gov.in",
  companyPhone: "",
  companyAddress: "Sangli, Miraj and Kupwad, Maharashtra, India",
  reportLogoText: "SMKC",
  reportPreparedBy: "IT Department",
  reportClassification: "Internal",
};

const reportBrandingFieldMap = {
  company_name: "companyName",
  company_email: "companyEmail",
  company_phone: "companyPhone",
  company_address: "companyAddress",
  report_logo_text: "reportLogoText",
  report_prepared_by: "reportPreparedBy",
  report_classification: "reportClassification",
};

export function mapReportBrandingFromApi(apiSettings = []) {
  return apiSettings.reduce((mappedSettings, setting) => {
    const settingKey = setting.settingKey || setting.SettingKey;
    const settingValue = setting.settingValue ?? setting.SettingValue ?? "";
    const fieldName = reportBrandingFieldMap[settingKey];

    if (fieldName) {
      mappedSettings[fieldName] = settingValue;
    }

    return mappedSettings;
  }, {});
}

export function mapReportBrandingToApi(settings) {
  return Object.entries(reportBrandingFieldMap).map(([settingKey, fieldName]) => ({
    settingKey,
    settingValue: settings[fieldName] || "",
  }));
}

export function readStoredReportBranding() {
  if (typeof window === "undefined") {
    return DEFAULT_REPORT_BRANDING;
  }

  try {
    const savedBranding = JSON.parse(
      localStorage.getItem(REPORT_BRANDING_KEY) || "null"
    );

    return {
      ...DEFAULT_REPORT_BRANDING,
      ...(savedBranding || {}),
    };
  } catch {
    return DEFAULT_REPORT_BRANDING;
  }
}
