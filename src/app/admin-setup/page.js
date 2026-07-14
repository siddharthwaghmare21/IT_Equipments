"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import { ApiError, bootstrapSuperAdmin, getBootstrapStatus } from "@/lib/apiClient";

function isStrongPassword(password) {
  const hasMinimumLength = password.length >= 8;
  const hasCapitalLetter = /[A-Z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  return hasMinimumLength && hasCapitalLetter && hasSymbol;
}

export default function AdminSetupPage() {
  const router = useRouter();

  const [adminAlreadyExists, setAdminAlreadyExists] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    setupKey: "",
  });

  const [errors, setErrors] = useState({
    form: "",
    password: "",
    confirmPassword: "",
  });

  const checkBootstrapStatus = useCallback(async () => {
    setIsChecking(true);

    try {
      const status = await getBootstrapStatus();
      setAdminAlreadyExists(Boolean(status.hasActiveSuperAdmin));
    } catch {
      setErrors((previousErrors) => ({
        ...previousErrors,
        form: "Backend API is not reachable. Check backend server or API URL.",
      }));
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkBootstrapStatus();
    }, 0);

    return () => clearTimeout(timer);
  }, [checkBootstrapStatus]);

  useEffect(() => {
    if (adminAlreadyExists) {
      router.replace("/login");
    }
  }, [adminAlreadyExists, router]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrors({
      form: "",
      password: "",
      confirmPassword: "",
    });
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

    setIsSaving(true);

    try {
      await bootstrapSuperAdmin(formData.setupKey, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || null,
        departmentId: null,
      });

      showToast("Super Admin profile created successfully. Please login.");
      router.push("/login");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setAdminAlreadyExists(true);
        showToast("Super Admin already exists. Please login.");
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        setErrors((previousErrors) => ({
          ...previousErrors,
          form: "Invalid setup key. Super Admin setup denied.",
        }));
        return;
      }

      setErrors((previousErrors) => ({
        ...previousErrors,
        form:
          error.message ||
          "Super Admin could not be created. Please check backend setup.",
      }));
    } finally {
      setIsSaving(false);
    }
  }

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <LoadingState
          title="Checking setup"
          description="Verifying whether the first Super Admin is already created."
        />
      </main>
    );
  }

  if (adminAlreadyExists) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <LoadingState
          title="Opening login"
          description="Super Admin setup is complete. Redirecting to login."
        />
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
            First Super Admin Setup
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Create the first Super Admin account for the IT Assets & Equipment
            Management system. This account will manage access approvals,
            settings, backup/export control and system administration.
          </p>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-sm font-bold text-gray-900">
              Super Admin Permissions
            </h2>

            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>- Full access to all IT asset modules</li>
              <li>- Approve or reject new account requests</li>
              <li>- Manage Admin, Employee and Viewer roles</li>
              <li>- The initial Super Admin account stays permanently protected</li>
              <li>- Control settings, reports, activity logs and backup/export</li>
            </ul>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              Create Super Admin
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Use the backend setup key to create the first Super Admin.
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
                placeholder="IT Super Admin"
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
                  placeholder="admin@company.com"
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
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Password
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
                Setup Key
              </label>
              <input
                type="password"
                name="setupKey"
                value={formData.setupKey}
                onChange={handleChange}
                placeholder="Enter backend setup key"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                required
              />
            </div>

            {errors.form && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {errors.form}
              </p>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Creating..." : "Create Super Admin"}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                Already have access? Login
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
