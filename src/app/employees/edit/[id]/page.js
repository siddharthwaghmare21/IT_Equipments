"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";

const employees = [
  {
    id: "1",
    employeeCode: "EMP-001",
    employeeName: "Rahul Patil",
    department: "IT Department",
    designation: "Software Developer",
    email: "rahul.patil@company.com",
    phone: "+91 98765 12345",
    location: "Main Office",
    reportingManager: "Nikhil Deshmukh",
    employmentType: "Full Time",
    assetEligibility: "Eligible",
    securityAcknowledgement: "Signed",
    joiningDate: "2024-06-10",
    deliveredAssets: "3",
    lastAssetIssueDate: "2026-01-15",
    createdBy: "HR Admin",
    createdAt: "2024-06-10 09:30 AM",
    updatedBy: "IT Admin",
    updatedAt: "2026-01-15 04:15 PM",
    status: "Active",
    remarks: "Uses laptop, monitor and keyboard for development work.",
  },
  {
    id: "2",
    employeeCode: "EMP-002",
    employeeName: "Sneha Jadhav",
    department: "Accounts",
    designation: "Account Executive",
    email: "sneha.jadhav@company.com",
    phone: "+91 99887 45678",
    location: "Accounts Office",
    reportingManager: "Meera Kulkarni",
    employmentType: "Full Time",
    assetEligibility: "Eligible",
    securityAcknowledgement: "Signed",
    joiningDate: "2023-09-18",
    deliveredAssets: "2",
    lastAssetIssueDate: "2026-01-20",
    createdBy: "HR Admin",
    createdAt: "2023-09-18 10:15 AM",
    updatedBy: "IT Admin",
    updatedAt: "2026-01-20 12:10 PM",
    status: "Active",
    remarks: "Assigned desktop and printer access.",
  },
];

export default function EditEmployeePage() {
  const params = useParams();
  const employeeId = params.id;

  const selectedEmployee =
    employees.find((employee) => employee.id === employeeId) || employees[0];

  const [formData, setFormData] = useState({
    employeeCode: selectedEmployee.employeeCode,
    employeeName: selectedEmployee.employeeName,
    department: selectedEmployee.department,
    designation: selectedEmployee.designation,
    email: selectedEmployee.email,
    phone: selectedEmployee.phone,
    location: selectedEmployee.location,
    reportingManager: selectedEmployee.reportingManager,
    employmentType: selectedEmployee.employmentType,
    assetEligibility: selectedEmployee.assetEligibility,
    securityAcknowledgement: selectedEmployee.securityAcknowledgement,
    joiningDate: selectedEmployee.joiningDate,
    deliveredAssets: selectedEmployee.deliveredAssets,
    lastAssetIssueDate: selectedEmployee.lastAssetIssueDate,
    createdBy: selectedEmployee.createdBy,
    createdAt: selectedEmployee.createdAt,
    updatedBy: selectedEmployee.updatedBy,
    updatedAt: selectedEmployee.updatedAt,
    status: selectedEmployee.status,
    remarks: selectedEmployee.remarks,
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    alert("Employee changes saved successfully. Backend will be connected later.");
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Edit Employee"
        description="Modify employee details, department, designation and contact information."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/employees" label="Employees" />

        <Link
          href={`/employees/view/${selectedEmployee.id}`}
          className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          View Employee
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Employee Code
            </label>
            <input
              type="text"
              name="employeeCode"
              value={formData.employeeCode}
              onChange={handleChange}
              placeholder="EMP-001"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Employee Name
            </label>
            <input
              type="text"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              placeholder="Rahul Patil"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            >
              <option value="">Select department</option>
              <option value="IT Department">IT Department</option>
              <option value="Accounts">Accounts</option>
              <option value="Admin">Admin</option>
              <option value="HR">HR</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="Management">Management</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Designation
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Software Developer"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="employee@company.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 12345"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Main Office / Admin Office"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Reporting Manager
            </label>
            <input
              type="text"
              name="reportingManager"
              value={formData.reportingManager}
              onChange={handleChange}
              placeholder="Nikhil Deshmukh"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Employment Type
            </label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Full Time">Full Time</option>
              <option value="Contract">Contract</option>
              <option value="Intern">Intern</option>
              <option value="Consultant">Consultant</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Asset Eligibility
            </label>
            <select
              name="assetEligibility"
              value={formData.assetEligibility}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Eligible">Eligible</option>
              <option value="Approval Required">Approval Required</option>
              <option value="Hold">Hold</option>
              <option value="Not Eligible">Not Eligible</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Security Acknowledgement
            </label>
            <select
              name="securityAcknowledgement"
              value={formData.securityAcknowledgement}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Pending">Pending</option>
              <option value="Signed">Signed</option>
              <option value="Not Required">Not Required</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Joining Date
            </label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="4"
              placeholder="Additional employee notes..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Delivered assets: {formData.deliveredAssets}. Last asset issue:
              {" "}
              {formData.lastAssetIssueDate}. Created by {formData.createdBy} on
              {" "}
              {formData.createdAt}. Last updated by {formData.updatedBy} on
              {" "}
              {formData.updatedAt}.
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/employees"
            className="inline-flex justify-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Save Changes
          </button>
        </div>
      </form>
    </LayoutWrapper>
  );
}
