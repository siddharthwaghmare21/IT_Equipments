"use client";

export default function ConfirmDialog({
  isOpen,
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}) {
  const resolvedOpen = isOpen ?? open ?? false;

  if (!resolvedOpen) return null;

  const confirmClass =
    tone === "danger"
      ? "border border-rose-500/30 bg-rose-500/15 text-rose-100 hover:bg-rose-500/20"
      : "bg-gradient-to-r from-[#6a3df0] to-[#8b5cf6] text-white hover:from-[#5f35df] hover:to-[#7c4cf3]";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-[26px] border border-[#2c3f63] bg-[#18253d] p-5 shadow-xl"
      >
        <h2 id="confirm-dialog-title" className="text-lg font-bold text-white">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#b8c7e6]">{description}</p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#314666] bg-[#101a2b] px-4 py-2 text-sm font-semibold text-[#c8d4ec] hover:bg-[#16233a]"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
