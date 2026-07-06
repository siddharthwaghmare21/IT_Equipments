"use client";

export default function FormStepper({ steps, currentStep, onStepChange }) {
  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <button
              key={step.title}
              type="button"
              onClick={() => onStepChange(index)}
              className={`rounded-lg border p-3 text-left ${
                isActive
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                  : isComplete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
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
