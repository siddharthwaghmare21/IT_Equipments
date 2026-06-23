"use client";

import { useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ActionButtons from "@/components/common/ActionButtons";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageActionBar from "@/components/common/PageActionBar";
import CompactRecordList from "@/components/common/CompactRecordList";
import { EmptyState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";

const returnRecords = [
  {
    id: "1",
    returnCode: "RET-001",
    deliveryCode: "DLV-003",
    assetTag: "AST-003",
    assetName: "Logitech Keyboard",
    returnedBy: "Amit Shinde",
    department: "Admin",
    deliveryDate: "2026-02-01",
    returnDate: "2026-08-01",
    returnCondition: "Good",
    receivedBy: "IT Admin",
    receivedLocation: "IT Store",
    acknowledgementStatus: "Acknowledged",
    inspectionStatus: "Completed",
    inspectionBy: "IT Admin",
    damageDecision: "No Damage",
    qrCode: "QR-RET-001",
    attachmentStatus: "Uploaded",
    createdBy: "IT Admin",
    createdAt: "2026-08-01 11:00",
    updatedBy: "IT Admin",
    updatedAt: "2026-08-01 11:00",
    status: "Returned",
  },
  {
    id: "2",
    returnCode: "RET-002",
    deliveryCode: "DLV-005",
    assetTag: "AST-005",
    assetName: "Dell Mouse",
    returnedBy: "Priya More",
    department: "HR",
    deliveryDate: "2026-01-10",
    returnDate: "2026-07-20",
    returnCondition: "Damaged",
    receivedBy: "IT Admin",
    receivedLocation: "IT Store",
    acknowledgementStatus: "Acknowledged",
    inspectionStatus: "Damage Review",
    inspectionBy: "IT Manager",
    damageDecision: "Repair Required",
    qrCode: "QR-RET-002",
    attachmentStatus: "Uploaded",
    createdBy: "IT Admin",
    createdAt: "2026-07-20 12:30",
    updatedBy: "IT Manager",
    updatedAt: "2026-07-21 10:00",
    status: "Damaged",
  },
  {
    id: "3",
    returnCode: "RET-003",
    deliveryCode: "DLV-006",
    assetTag: "AST-006",
    assetName: "HP Monitor",
    returnedBy: "Sneha Jadhav",
    department: "Accounts",
    deliveryDate: "2026-03-05",
    returnDate: "2026-09-10",
    returnCondition: "Needs Inspection",
    receivedBy: "IT Support",
    receivedLocation: "Inspection Desk",
    acknowledgementStatus: "Pending",
    inspectionStatus: "Pending",
    inspectionBy: "IT Support",
    damageDecision: "Pending",
    qrCode: "QR-RET-003",
    attachmentStatus: "Pending",
    createdBy: "IT Support",
    createdAt: "2026-09-10 15:15",
    updatedBy: "IT Support",
    updatedAt: "2026-09-10 15:15",
    status: "Pending Inspection",
  },
  {
    id: "4",
    returnCode: "RET-004",
    deliveryCode: "DLV-007",
    assetTag: "AST-007",
    assetName: "Lenovo Laptop",
    returnedBy: "Rahul Patil",
    department: "IT Department",
    deliveryDate: "2026-02-15",
    returnDate: "2026-10-01",
    returnCondition: "Good",
    receivedBy: "IT Admin",
    receivedLocation: "IT Store",
    acknowledgementStatus: "Acknowledged",
    inspectionStatus: "Completed",
    inspectionBy: "IT Admin",
    damageDecision: "No Damage",
    qrCode: "QR-RET-004",
    attachmentStatus: "Uploaded",
    createdBy: "IT Admin",
    createdAt: "2026-10-01 10:40",
    updatedBy: "IT Admin",
    updatedAt: "2026-10-01 10:40",
    status: "Returned",
  },
];

const filters = ["All", "Returned", "Damaged", "Pending Inspection"];

function ReturnStatusBadge({ status }) {
  const statusStyles = {
    Returned: "bg-green-100 text-green-700 border-green-200",
    Damaged: "bg-red-100 text-red-700 border-red-200",
    "Pending Inspection": "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

export default function ReturnsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [archiveReturn, setArchiveReturn] = useState(null);

  const filteredReturnRecords = useMemo(() => {
    return returnRecords.filter((returnItem) => {
      const searchText = `
        ${returnItem.returnCode}
        ${returnItem.deliveryCode}
        ${returnItem.assetTag}
        ${returnItem.assetName}
        ${returnItem.returnedBy}
        ${returnItem.department}
        ${returnItem.returnCondition}
        ${returnItem.receivedBy}
        ${returnItem.receivedLocation}
        ${returnItem.acknowledgementStatus}
        ${returnItem.inspectionStatus}
        ${returnItem.inspectionBy}
        ${returnItem.damageDecision}
        ${returnItem.qrCode}
        ${returnItem.attachmentStatus}
        ${returnItem.status}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || returnItem.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  function handleArchive(returnItem) {
    setArchiveReturn(returnItem);
  }

  function confirmArchive() {
    showToast("Return archive action added. Backend will be connected later.");
    setArchiveReturn(null);
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Returns"
        description="Manage returned IT assets, return condition, received by details and inspection status."
      />

      <PageActionBar addHref="/returns/add" addLabel="Add Return" />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Returns</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {returnRecords.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Returned Assets</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              returnRecords.filter(
                (returnItem) => returnItem.status === "Returned"
              ).length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Damaged Returns</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              returnRecords.filter(
                (returnItem) => returnItem.status === "Damaged"
              ).length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending Inspection</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              returnRecords.filter(
                (returnItem) => returnItem.status === "Pending Inspection"
              ).length
            }
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by return code, asset tag, asset name, receiver, inspection, location or status..."
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 lg:max-w-md"
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium ${
                  activeFilter === filter
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      <CompactRecordList
        records={filteredReturnRecords}
        titleKey="returnCode"
        subtitleKey="assetName"
        meta={[
          { label: "Returned By", key: "returnedBy" },
          { label: "Return Date", key: "returnDate" },
          { label: "Condition", key: "returnCondition" },
          { label: "Inspection", key: "inspectionStatus" },
        ]}
        statusRender={(returnItem) => (
          <ReturnStatusBadge status={returnItem.status} />
        )}
        viewHref={(returnItem) => `/returns/view/${returnItem.id}`}
        editHref={(returnItem) => `/returns/edit/${returnItem.id}`}
        onArchive={handleArchive}
        emptyTitle="No return records found"
        emptyDescription="Try changing receiver, asset, inspection or status filters."
      />

      <div className="hidden md:block">
      <TableWrapper>
        <table className="min-w-[1850px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700">
                Return Code
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Delivery Code
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Asset Tag
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Asset Name
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Returned By
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Department
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Delivery Date
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Return Date
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Condition
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Received By
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Location
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Inspection
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Damage Decision
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Acknowledgement
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                QR Code
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Documents
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredReturnRecords.map((returnItem) => (
              <tr
                key={returnItem.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {returnItem.returnCode}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.deliveryCode}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.assetTag}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.assetName}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.returnedBy}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.department}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.deliveryDate}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.returnDate}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.returnCondition}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.receivedBy}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.receivedLocation}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.inspectionStatus}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.damageDecision}
                </td>

                <td className="px-4 py-4">
                  <ReturnStatusBadge status={returnItem.status} />
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.acknowledgementStatus}
                </td>

                <td className="px-4 py-4 font-medium text-gray-700">
                  {returnItem.qrCode}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.attachmentStatus}
                </td>

                <td className="px-4 py-4">
                  <ActionButtons
                    viewHref={`/returns/view/${returnItem.id}`}
                    updateHref={`/returns/edit/${returnItem.id}`}
                    onDelete={() => handleArchive(returnItem)}
                    deleteLabel="Archive"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReturnRecords.length === 0 && (
          <div className="p-6">
            <EmptyState
              title="No return records found"
              description="Try changing receiver, asset, inspection or status filters."
            />
          </div>
        )}
      </TableWrapper>
      </div>

      <ConfirmDialog
        isOpen={Boolean(archiveReturn)}
        title="Archive return?"
        description={`Return ${
          archiveReturn?.returnCode || ""
        } will keep its audit and reporting history.`}
        confirmLabel="Archive"
        onCancel={() => setArchiveReturn(null)}
        onConfirm={confirmArchive}
      />
    </LayoutWrapper>
  );
}
