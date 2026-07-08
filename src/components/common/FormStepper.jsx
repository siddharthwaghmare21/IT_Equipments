"use client";

export default function FormStepper({ steps, currentStep, onStepChange }) {
  return (
    <div className="mb-4 rounded-[24px] border border-[#2c3f63] bg-[#18253d] p-3 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <button
              key={step.title}
              type="button"
              onClick={() => onStepChange(index)}
              className={`rounded-2xl border p-3 text-left ${
                isActive
                  ? "border-[#7c4cf3] bg-gradient-to-r from-[#6a3df0] to-[#8b5cf6] text-white shadow-sm"
                  : isComplete
                    ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-100"
                    : "border-[#314666] bg-[#101a2b] text-[#c8d4ec] hover:bg-[#16233a]"
              }`}
            >
              <span className="text-xs font-bold uppercase">
                Step {index + 1}
              </span>
              <p className="mt-1 text-sm font-semibold">{step.title}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
