"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import { TEMP_AUTH_BYPASS } from "@/lib/authConfig";
import { ApiError, loginUser } from "@/lib/apiClient";
import { readSession, saveLoginSession } from "@/lib/authSession";

const ACCESS_CODE = "DataCenterSMKC";

export default function LoginPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [hasSuperAdmin, setHasSuperAdmin] = useState(false);
  const [authStep, setAuthStep] = useState("login");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    accessCode: "",
  });

  useEffect(() => {
    if (TEMP_AUTH_BYPASS) {
      router.replace("/dashboard");
      return;
    }

    const savedSession = readSession();

    if (savedSession) {
      router.replace("/dashboard");
      return;
    }

    setTimeout(() => {
      setHasSuperAdmin(true);
      setIsLoading(false);
    }, 0);
  }, [router]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
      form: "",
    }));
  }

  function validateLoginForm() {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Official email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid official email.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    }

    if (!formData.accessCode) {
      nextErrors.accessCode = "Access code is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateLoginForm()) return;

    if (formData.accessCode !== ACCESS_CODE) {
      setErrors({ form: "Invalid access code. Login denied." });
      return;
    }

    setIsLoading(true);

    try {
      const loginResponse = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      saveLoginSession(loginResponse);
      showToast("Login successful.");
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setErrors({ form: "Invalid email or password." });
        } else if (error.status === 403) {
          setAuthStep("approval-pending");
        } else {
          setErrors({ form: error.message });
        }
      } else {
        setErrors({
          form: "Backend API is not reachable. Check that the backend server is running.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <LoadingState
          title="Loading login"
          description="Checking access session."
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
              Super Admin Setup Required
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              First Super Admin profile is not created yet. Create the first
              Super Admin account to start using the IT Assets & Equipment
              Management system.
            </p>

            <Link
              href="/admin-setup"
              className="mt-6 inline-flex w-full justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Create First Super Admin
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (authStep === "approval-pending" || authStep === "rejected") {
    const isRejected = authStep === "rejected";

    return (
      <main className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <section className="w-full rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white ${
                isRejected ? "bg-red-700" : "bg-yellow-600"
              }`}
            >
              {isRejected ? "NO" : "WT"}
            </div>

            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              {isRejected ? "Access Request Rejected" : "Approval Pending"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              {isRejected
                ? "Your access request is rejected. Contact Super Admin for details."
                : "Your account is not active yet. Super Admin or Admin approval is required before login."}
            </p>

            <button
              type="button"
              onClick={() => setAuthStep("login")}
              className="mt-6 inline-flex w-full justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Back to Login
            </button>
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
            IT Assets & Equipment Management
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            This system is only for IT Department staff to save, manage and
            maintain IT assets, purchases, deliveries, returns, maintenance,
            reports and activity logs.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <h2 className="text-sm font-bold text-gray-900">Secure Access</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Login requires official email, password and internal access
                code.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <h2 className="text-sm font-bold text-gray-900">Role Based</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
              Super Admin, Admin, Employee and Viewer use the same secure panel.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Login / Sign Up
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Login with an approved account or request access for a new one.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Official Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@company.com"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                required
              />
              {errors.email && (
                <p className="mt-2 text-xs font-semibold text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                required
              />
              {errors.password && (
                <p className="mt-2 text-xs font-semibold text-red-600">
                  {errors.password}
                </p>
              )}
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
              {errors.accessCode && (
                <p className="mt-2 text-xs font-semibold text-red-600">
                  {errors.accessCode}
                </p>
              )}
            </div>

            {errors.form && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {errors.form}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Login
            </button>
          </form>

          <div className="mt-5 flex flex-col gap-3 text-center sm:flex-row sm:justify-between">
            <Link
              href="/admin-request-access"
              className="text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              Sign Up / Request Access
            </Link>
          </div>

          <p className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
            Note: Backend login verifies email and password with JWT session.
            The account must already be email-verified in backend. OTP email
            delivery is parked for future company deployment.
          </p>
        </section>
      </div>
    </main>
  );
}
