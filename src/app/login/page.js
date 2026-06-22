"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ACCESS_CODE = "DataCenterSMKC";
const USERS_KEY = "itAssetUsers";
const SESSION_KEY = "itAssetUserSession";

// Backend येईपर्यंत true ठेवा.
// Backend/login final झाल्यावर false करा.
const TEMP_AUTH_BYPASS = true;

export default function LoginPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [hasSuperAdmin, setHasSuperAdmin] = useState(false);

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

    const savedSession = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");

    if (savedSession) {
      router.replace("/dashboard");
      return;
    }

    const savedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

    const superAdminExists = savedUsers.some(
      (user) => user.role === "Super Admin"
    );

    setTimeout(() => {
      setHasSuperAdmin(superAdminExists);
      setIsLoading(false);
    }, 0);
  }, [router]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (formData.accessCode !== ACCESS_CODE) {
      alert("Invalid access code. Login denied.");
      return;
    }

    const savedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

    const matchedUser = savedUsers.find(
      (user) =>
        user.email.toLowerCase() === formData.email.trim().toLowerCase()
    );

    if (!matchedUser) {
      alert("User account not found. Please request access.");
      return;
    }

    if (matchedUser.status !== "Active") {
      alert("Your account is not active. Please contact Super Admin.");
      return;
    }

    if (matchedUser.password !== formData.password) {
      alert("Invalid password. Please try again.");
      return;
    }

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        id: matchedUser.id,
        fullName: matchedUser.fullName,
        email: matchedUser.email,
        phone: matchedUser.phone,
        department: matchedUser.department || "IT Department",
        role: matchedUser.role,
        status: matchedUser.status,
        loginAt: new Date().toISOString(),
      })
    );

    alert("Login successful.");

    router.push("/dashboard");
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <p className="text-sm font-semibold text-gray-700">Loading...</p>
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
                Super Admin, IT Admin, IT Manager, IT Support and Viewer roles
                are supported.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              IT Staff Login
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Login with your approved IT department account.
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
              Request Access
            </Link>

            <Link
              href="/admin-setup"
              className="text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              Admin Setup
            </Link>
          </div>

          <p className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
            Note: This is frontend demo authentication. Backend integration
            later will verify users, passwords and access code securely on the
            server.
          </p>
        </section>
      </div>
    </main>
  );
}
