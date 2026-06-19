"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const ACCESS_CODE = "DataCenterSMKC";
const USERS_KEY = "itAssetUsers";
const REQUESTS_KEY = "itAssetAccessRequests";

function isStrongPassword(password) {
  const hasMinimumLength = password.length >= 8;
  const hasCapitalLetter = /[A-Z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  return hasMinimumLength && hasCapitalLetter && hasSymbol;
}

export default function AdminRequestAccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSuperAdmin, setHasSuperAdmin] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    requestedRole: "IT Support",
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
    const savedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

    const superAdminExists = savedUsers.some(
      (user) => user.role === "Super Admin"
    );

    setHasSuperAdmin(superAdminExists);
    setIsLoading(false);
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
      alert("Invalid access code. Access request denied.");
      return;
    }

    const savedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const savedRequests = JSON.parse(
      localStorage.getItem(REQUESTS_KEY) || "[]"
    );

    const email = formData.email.trim().toLowerCase();

    const userAlreadyExists = savedUsers.some(
      (user) => user.email.toLowerCase() === email
    );

    if (userAlreadyExists) {
      alert("This email already has an account. Please login.");
      return;
    }

    const pendingRequestExists = savedRequests.some(
      (request) =>
        request.email.toLowerCase() === email && request.status === "Pending"
    );

    if (pendingRequestExists) {
      alert("Access request already submitted for this email.");
      return;
    }

    const newRequest = {
      id: Date.now(),
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      department: "IT Department",
      requestedRole: formData.requestedRole,
      password: formData.password,
      reason: formData.reason,
      status: "Pending",
      requestedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      REQUESTS_KEY,
      JSON.stringify([newRequest, ...savedRequests])
    );

    setIsSubmitted(true);
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
              ✓
            </div>

            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Access Request Submitted
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Your IT staff access request has been submitted successfully.
              Existing Super Admin approval is required before login access is
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
            Super Admin approval.
          </p>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-sm font-bold text-gray-900">
              Access Request Rules
            </h2>

            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>• Only IT Department staff can request access</li>
              <li>• Internal access code is required</li>
              <li>• Existing Super Admin approval is required</li>
              <li>• Multiple Super Admin accounts are supported</li>
              <li>• Password must contain 8 characters, 1 capital letter and 1 symbol</li>
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
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                required
              >
                <option value="Super Admin">Super Admin</option>
                <option value="IT Admin">IT Admin</option>
                <option value="IT Manager">IT Manager</option>
                <option value="IT Support">IT Support</option>
                <option value="Viewer">Viewer</option>
              </select>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Super Admin request will require approval from an existing Super
                Admin.
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
                Reason / Note
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Why do you need access?"
                rows="4"
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Submit Access Request
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
            Note: Password is stored only for frontend demo. Backend integration
            later will use secure password hashing and email OTP verification.
          </p>
        </section>
      </div>
    </main>
  );
}