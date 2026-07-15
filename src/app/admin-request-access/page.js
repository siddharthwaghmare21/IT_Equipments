"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import { ApiError, createSignupRequest, getBootstrapStatus } from "@/lib/apiClient";

function isStrongPassword(password) {
  const hasMinimumLength = password.length >= 8;
  const hasCapitalLetter = /[A-Z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  return hasMinimumLength && hasCapitalLetter && hasSymbol;
}

const allowedRoles = ["Admin", "Employee", "Viewer"];

export default function AdminRequestAccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSuperAdmin, setHasSuperAdmin] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    requestedRole: "Employee",
    password: "",
    confirmPassword: "",
    accessCode: "",
    reason: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadBootstrapStatus() {
      try {
        const status = await getBootstrapStatus();
        if (isMounted) {
          setHasSuperAdmin(Boolean(status?.hasActiveSuperAdmin));
        }
      } catch (error) {
        showToast(
          error instanceof ApiError
            ? error.message
            : "Unable to check Super Admin setup status.",
          "error"
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBootstrapStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (name === "password" || name === "confirmPassword") {
      setErrors({
        password: "",
        confirmPassword: "",
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isStrongPassword(formData.password)) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        password:
          "Password must contain at least 8 characters, 1 capital letter and 1 symbol.",
      }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        confirmPassword: "Password does not match",
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      await createSignupRequest({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        departmentId: null,
        requestedRoleCode: getRequestedRoleCode(formData.requestedRole),
        password: formData.password,
        remarks: formData.reason.trim() || null,
        accessCode: formData.accessCode,
      });

      setIsSubmitted(true);
      showToast("Access request submitted successfully.");
    } catch (error) {
      showToast(
        error instanceof ApiError
          ? error.message
          : "Access request could not be submitted.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function getRequestedRoleCode(role) {
    if (role === "Admin") {
      return "ADMIN";
    }

    if (role === "Viewer") {
      return "VIEWER";
    }

    return "EMPLOYEE";
  }

  function handleRoleChange(event) {
    const nextRole = event.target.value;

    if (!allowedRoles.includes(nextRole)) {
      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      requestedRole: nextRole,
    }));
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <LoadingState
          title="Loading request form"
          description="Checking Super Admin setup status."
        />
      </main>
    );
  }

  if (!hasSuperAdmin) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <section className="w-full rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-xl font-bold text-white">
              IT
            </div>

            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              First Super Admin Required
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              First Super Admin profile is not created yet. Access requests can
              be submitted only after first Super Admin setup is completed.
            </p>

            <Link
              href="/admin-setup"
              className="mt-6 inline-flex w-full justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Create First Super Admin
            </Link>

            <Link
              href="/login"
              className="mt-3 inline-flex w-full justify-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Back to Login
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <section className="w-full rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-700 text-xl font-bold text-white">
              OK
            </div>

            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Access Request Submitted
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Your IT staff access request has been submitted successfully.
              Existing Super Admin or Admin approval is required before login access is
              activated.
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex w-full justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Back to Login
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto grid min-h-[80vh] max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-xl font-bold text-white">
            IT
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Request IT Staff Access
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            This system is only for IT Department staff. New users cannot create
            accounts directly. Submit an access request and wait for existing
            Super Admin or Admin approval.
          </p>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-sm font-bold text-gray-900">
              Access Request Rules
            </h2>

            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>- Only IT Department staff can request access</li>
              <li>- Internal access code is required</li>
              <li>- Existing Super Admin or Admin approval is required</li>
              <li>- Super Admin or Admin can assign operational roles</li>
              <li>- Password must contain 8 characters, 1 capital letter and 1 symbol</li>
            </ul>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Access Request Form
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Fill your details to request IT system access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Official Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@company.com"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                  required
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
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Requested Role
              </label>
              <select
                name="requestedRole"
                value={formData.requestedRole}
                onChange={handleRoleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                required
              >
                <option value="Admin">Admin</option>
                <option value="Employee">Employee</option>
                <option value="Viewer">Viewer</option>
              </select>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Selected request code: {getRequestedRoleCode(formData.requestedRole)}
              </p>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Create Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                  required
                />

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Password must contain at least 8 characters, 1 capital letter
                  and 1 symbol.
                </p>

                {errors.password && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                  required
                />

                {errors.confirmPassword && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Access Code
              </label>
              <input
                type="password"
                name="accessCode"
                value={formData.accessCode}
                onChange={handleChange}
                placeholder="Enter internal access code"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Reason / Note <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Why do you need access? Optional note for approver."
                rows="4"
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
            >
              {isSubmitting ? "Submitting..." : "Submit Access Request"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              Already approved? Login
            </Link>
          </div>

          <p className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
            Note: This request is now saved through the backend API with secure
            password hashing. Email OTP requires company SMTP configuration.
          </p>
        </section>
      </div>
    </main>
  );
}
