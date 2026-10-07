import api from "./api";

export interface CreateReportData {
  trackingId: string;
  imageUrl: string;
  title: string;
  description: string;
  category: string;
  urgency: "Low" | "Medium" | "High" | "Critical";

  location: {
    latitude: number;
    longitude: number;
    address: string;
  };

  department: string;

  aiAnalysis?: {
    isValid: boolean;
    confidence: number | null;
    suggestedActions: string[];
  };
}

// CREATE REPORT
export const createReport = (data: CreateReportData) => {
  return api.post("/reports", data);
};

// GET MY REPORTS
export const getMyReports = () => {
  return api.get("/reports/my");
};

// GET SINGLE REPORT
export const getReportById = (id: string) => {
  return api.get(`/reports/${id}`);
};

// GET GOVERNMENT REPORTS
export const getGovernmentReports = () => {
  return api.get("/reports/government");
};

// GET ALL ACTIVE OFFICERS
export const getGovernmentOfficers = () => {
  return api.get("/reports/officers");
};

// ASSIGN REPORT TO OFFICER
export const assignReportOfficer = (
  id: string,
  officerId: string
) => {
  return api.put(`/reports/${id}/assign`, {
    officerId,
  });
};

// UPDATE REPORT STATUS
export const updateReportStatus = (
  id: string,
  status: string,
  officerRemarks: string
) => {
  return api.put(`/reports/${id}/status`, {
    status,
    officerRemarks,
  });
};