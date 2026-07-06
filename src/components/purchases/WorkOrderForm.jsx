"use client";

import Link from "next/link";
import {
  approvalStatuses,
  createEmptyWorkOrderItem,
  formatCurrency,
  invoiceStatuses,
  paymentStatuses,
  receivedStatuses,
  workOrderStatuses,
} from "@/lib/workOrderMapper";

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectField({ name, value, onChange, options, required = false }) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
    >
      {options.map((option) => (
        <option key={option.value || option} value={option.value || option}>
          {option.label || option}
        </option>
      ))}
    </select>
  );
}

export default function WorkOrderForm({
  formData,
  vendors,
  error,
  isSaving,
  submitLabel,
  onSubmit,
  onChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
}) {
  const totalAmount = formData.items.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
  }, 0);

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
    >
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="WO Number">
          <input
            type="text"
            name="workOrderNumber"
            value={formData.workOrderNumber}
            onChange={onChange}
            placeholder="WO-2026-001"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            required
          />
        </Field>

        <Field label="Vendor">
          <SelectField
            name="vendorId"
            value={formData.vendorId}
            onChange={onChange}
            required
            options={[
              { value: "", label: "Select vendor" },
              ...vendors.map((vendor) => ({
                value: String(vendor.vendorId),
                label: vendor.vendorName,
              })),
            ]}
          />
        </Field>

        <Field label="Invoice Number">
          <input
            type="text"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={onChange}
            placeholder="INV-DL-4587"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </Field>

        <Field label="Work Order Date">
          <input
            type="text"
            name="workOrderDate"
            value={formData.workOrderDate}
            onChange={onChange}
            placeholder="YYYY-MM-DD"
            pattern="\d{4}-\d{2}-\d{2}"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            required
          />
        </Field>

        <Field label="Expected Delivery Date">
          <input
            type="text"
            name="expectedDeliveryDate"
            value={formData.expectedDeliveryDate}
            onChange={onChange}
            placeholder="YYYY-MM-DD"
            pattern="\d{4}-\d{2}-\d{2}"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </Field>

        <Field label="Received Date">
          <input
            type="text"
            name="receivedDate"
            value={formData.receivedDate}
            onChange={onChange}
            placeholder="YYYY-MM-DD"
            pattern="\d{4}-\d{2}-\d{2}"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </Field>

        <Field label="Approval Status">
          <SelectField
            name="approvalStatus"
            value={formData.approvalStatus}
            onChange={onChange}
            options={approvalStatuses}
          />
        </Field>

        <Field label="Payment Status">
          <SelectField
            name="paymentStatus"
            value={formData.paymentStatus}
            onChange={onChange}
            options={paymentStatuses}
          />
        </Field>

        <Field label="Received Status">
          <SelectField
            name="receivedStatus"
            value={formData.receivedStatus}
            onChange={onChange}
            options={receivedStatuses}
          />
        </Field>

        <Field label="Invoice Status">
          <SelectField
            name="invoiceStatus"
            value={formData.invoiceStatus}
            onChange={onChange}
            options={invoiceStatuses}
          />
        </Field>

        <Field label="Work Order Status">
          <SelectField
            name="workOrderStatus"
            value={formData.workOrderStatus}
            onChange={onChange}
            options={workOrderStatuses}
          />
        </Field>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Calculated Total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {formatCurrency(totalAmount)}
          </p>
        </div>

        <div className="md:col-span-2">
          <Field label="Remarks">
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={onChange}
              rows={3}
              placeholder="Internal procurement notes, delivery remarks or invoice follow-up."
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Work Order Items
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Add all equipment lines included in this work order.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddItem}
            className="inline-flex justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Add Item
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {formData.items.map((item, index) => {
            const lineTotal =
              (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);

            return (
              <div
                key={`work-order-item-${index}`}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">
                    Item {index + 1}
                  </p>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Item Name">
                    <input
                      type="text"
                      value={item.itemName}
                      onChange={(event) =>
                        onItemChange(index, "itemName", event.target.value)
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                      required
                    />
                  </Field>

                  <Field label="Category">
                    <input
                      type="text"
                      value={item.category}
                      onChange={(event) =>
                        onItemChange(index, "category", event.target.value)
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                      required
                    />
                  </Field>

                  <Field label="Quantity">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) =>
                        onItemChange(index, "quantity", event.target.value)
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                      required
                    />
                  </Field>

                  <Field label="Unit Price">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(event) =>
                        onItemChange(index, "unitPrice", event.target.value)
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                      required
                    />
                  </Field>

                  <Field label="Warranty">
                    <input
                      type="text"
                      value={item.warranty}
                      onChange={(event) =>
                        onItemChange(index, "warranty", event.target.value)
                      }
                      placeholder="3 Years"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                    />
                  </Field>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Line Total</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {formatCurrency(lineTotal)}
                    </p>
                  </div>

                  <div className="md:col-span-2 xl:col-span-4">
                    <Field label="Specifications">
                      <textarea
                        value={item.specifications}
                        onChange={(event) =>
                          onItemChange(
                            index,
                            "specifications",
                            event.target.value
                          )
                        }
                        rows={2}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2 xl:col-span-4">
                    <Field label="Description">
                      <textarea
                        value={item.description}
                        onChange={(event) =>
                          onItemChange(index, "description", event.target.value)
                        }
                        rows={2}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/purchases"
          className="inline-flex justify-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function addWorkOrderItem(items) {
  return [...items, createEmptyWorkOrderItem()];
}
