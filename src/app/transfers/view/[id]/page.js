"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";

const transferRecords = [
  {
    id: "1",
    transferCode: "TRF-001",
    transferType: "Department Transfer",
    assetTag: "IT-LAP-001",
    assetName: "Dell Latitude 5420",
    fromDepartment: "IT Department",
    toDepartment: "Accounts",
    currentReceiver: "Rahul Patil",
    newReceiver: "Sneha Jadhav",
    reason: "Project need",
    accessories: "Charger, laptop bag",
    condition: "Good",
    collectionDate: "-",
    collectedBy: "-",
    issueDate: "2026-06-12",
    handoverAcknowledgement: "Acknowledged",
    newAcknowledgement: "Acknowledged",
    status: "Completed",
    createdBy: "IT Admin",
    createdAt: "2026-06-12 10:30",
    remarks: "Asset moved for finance reporting work.",
  },
  {
    id: "2",
    transferCode: "TRF-002",
    transferType: "IT Collection",
    assetTag: "IT-PRN-001",
    assetName: "Canon Laser Printer",
    fromDepartment: "Admin",
    toDepartment: "IT Store",
    currentReceiver: "Admin Office",
    newReceiver: "IT Store",
    reason: "Needs repair inspection",
    accessories: "Power cable",
    condition: "Needs Repair",
    collectionDate: "2026-06-14",
    collectedBy: "IT Support",
    issueDate: "-",
    handoverAcknowledgement: "Pending",
    newAcknowledgement: "Pending",
    status: "Collected by IT",
    createdBy: "IT Support",
    createdAt: "2026-06-14 15:10",
    remarks: "Printer collected for inspection.",
  },
];

export default function ViewTransferPage() {
  const params = useParams();
  const transfer =
    transferRecords.find((item) => item.id === params.id) || transferRecords[0];

  const timeline = [
    {
      title: "Transfer Request Created",
      detail: `${transfer.createdBy} created ${transfer.transferCode} for ${transfer.assetTag}.`,
      time: transfer.createdAt,
    },
    {
      title: "Movement Planned",
      detail: `${transfer.fromDepartment} to ${transfer.toDepartment}. Reason: ${transfer.reason}.`,
      time: transfer.createdAt,
    },
    {
      title: "IT Collection",
      detail:
        transfer.collectionDate === "-"
          ? "Collection not required for this transfer."
          : `${transfer.collectedBy} collected asset on ${transfer.collectionDate}.`,
      time: transfer.collectionDate,
    },
    {
      title: "Reassignment",
      detail:
        transfer.issueDate === "-"
          ? "Reassignment pending."
          : `Issued to ${transfer.toDepartment}; received by ${transfer.newReceiver}.`,
      time: transfer.issueDate,
    },
  ];

  return (
    <LayoutWrapper>
      <PageHeader
        title="Transfer Details"
        description="View department movement, IT collection, receiver acknowledgement and reassignment trail."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/transfers" label="Transfers" />

        <Link
          href={`/transfers/edit/${transfer.id}`}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Edit Transfer
        </Link>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {transfer.transferCode}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {transfer.assetName}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {transfer.assetTag} | {transfer.transferType}
            </p>
          </div>

          <span className="w-fit rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700">
            {transfer.status}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="Transfer Type" value={transfer.transferType} />
          <DetailItem label="Asset Tag" value={transfer.assetTag} />
          <DetailItem label="Asset Name" value={transfer.assetName} />
          <DetailItem label="From Department" value={transfer.fromDepartment} />
          <DetailItem label="To Department" value={transfer.toDepartment} />
          <DetailItem
            label="Current Receiver"
            value={transfer.currentReceiver}
          />
          <DetailItem label="New Receiver" value={transfer.newReceiver} />
          <DetailItem label="Reason" value={transfer.reason} />
          <DetailItem label="Accessories" value={transfer.accessories} />
          <DetailItem label="Condition" value={transfer.condition} />
          <DetailItem label="Collection Date" value={transfer.collectionDate} />
          <DetailItem label="Collected By" value={transfer.collectedBy} />
          <DetailItem label="Issue Date" value={transfer.issueDate} />
          <DetailItem
            label="Handover Acknowledgement"
            value={transfer.handoverAcknowledgement}
          />
          <DetailItem
            label="New Acknowledgement"
            value={transfer.newAcknowledgement}
          />
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Remarks
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-700">
            {transfer.remarks}
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Transfer Timeline
          </p>

          <div className="mt-4 space-y-4">
            {timeline.map((event) => (
              <div key={`${event.title}-${event.time}`} className="flex gap-3">
                <span className="mt-1 h-3 w-3 rounded-full bg-gray-900" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {event.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    {event.detail}
                  </p>
                  <p className="mt-1 text-xs font-medium text-gray-500">
                    {event.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}
