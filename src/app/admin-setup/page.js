"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ACCESS_CODE = "DataCenterSMKC";
const USERS_KEY = "itAssetUsers";
const SESSION_KEY = "itAssetUserSession";

function isStrongPassword(password) {
  const hasMinimumLength = password.length >= 8;
  const hasCapitalLetter = /[A-Z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  return hasMinimumLength && hasCapitalLetter && hasSymbol;
}

export default function AdminSetupPage() {
  const router = useRouter();

  const [adminAlreadyExists, setAdminAlreadyExists] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    accessCode: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

    const hasSuperAdmin = savedUsers.some(
      (user) => user.role === "Super Admin"
    );

    setTimeout(() => setAdminAlreadyExists(hasSuperAdmin), 0);
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

  function handleSubmit(event) {
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

    if (formData.accessCode !== ACCESS_CODE) {
      alert("Invalid access code. Super Admin setup denied.");
      return;
    }

    const savedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

    const hasSuperAdmin = savedUsers.some(
      (user) => user.role === "Super Admin"
    );

    if (hasSuperAdmin) {
      alert("Super Admin already exists. Please login.");
      router.push("/login");
      return;
    }

    const superAdminUser = {
      id: Date.now(),
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      department: "IT Department",
      role: "Super Admin",
      status: "Active",
      password: formData.password,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(USERS_KEY, JSON.stringify([superAdminUser]));

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        id: superAdminUser.id,
        fullName: superAdminUser.fullName,
        email: superAdminUser.email,
        phone: superAdminUser.phone,
        role: superAdminUser.role,
        department: superAdminUser.department,
        status: superAdminUser.status,
        loginAt: new Date().toISOString(),
      })
    );

    alert("Super Admin profile created successfully.");

    router.push("/dashboard");
  }

  if (adminAlreadyExists) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <section className="w-full rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-xl font-bold text-white">
              IT
            </div>

            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Super Admin Already Created
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              First Super Admin profile already exists. Please login to access
              the IT Assets & Equipment Management system.
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex w-full justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Go to Login
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
            First Super Admin Setup
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Create the first Super Admin account for the IT Assets & Equipment
            Management system. This account will manage IT staff access,
            approvals, settings and system control.
          </p>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-sm font-bold text-gray-900">
              Super Admin Permissions
            </h2>

            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>• Full access to all IT asset modules</li>
              <li>• Approve or reject new IT staff access requests</li>
              <li>• Manage Super Admin, IT Admin, IT Manager and IT Support roles</li>
              <li>• View reports, activity logs and system settings</li>
            </ul>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              Create Super Admin
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Use the internal access code to create the first IT Super Admin.
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
                  required
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
              Create Super Admin
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
