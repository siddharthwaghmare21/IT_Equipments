"use client";

import { useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";

export default function DashboardPage() {
  const router = useRouter();

  const stats = [
    {
      title: "Total Assets",
      value: "248",
      description: "All registered IT equipment",
    },
    {
      title: "Delivered Assets",
      value: "156",
      description: "Currently delivered to employees",
    },
    {
      title: "Available Assets",
      value: "64",
      description: "Ready for delivery",
    },
    {
      title: "Under Maintenance",
      value: "18",
      description: "Repair or service in progress",
    },
  ];

  const recentActivities = [
    "Laptop delivered to Rahul Patil",
    "New purchase entry added",
    "Printer marked under maintenance",
    "Warranty report generated",
  ];

  return (
    <LayoutWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of IT assets, equipment delivery and maintenance activity.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{item.title}</p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {item.value}
            </h2>

            <p className="mt-2 text-xs text-gray-500">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Asset Summary
              </h2>
              <p className="text-sm text-gray-500">
                Current equipment distribution
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/assets")}
              className="inline-flex w-full justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 sm:w-auto"
            >
              View Assets
            </button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Delivered
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Available
                  </th>
                </tr>
              </thead>

              <tbody>
                {[
                  ["Laptops", "95", "72", "23"],
                  ["Desktops", "48", "35", "13"],
                  ["Monitors", "61", "38", "23"],
                  ["Printers", "14", "6", "8"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row[0]}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row[1]}</td>
                    <td className="px-4 py-3 text-gray-600">{row[2]}</td>
                    <td className="px-4 py-3 text-gray-600">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>

          <div className="mt-4 space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity}
                className="rounded-xl border border-gray-100 bg-gray-50 p-3"
              >
                <p className="text-sm text-gray-700">{activity}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}