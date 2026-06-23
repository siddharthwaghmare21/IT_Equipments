"use client";

export default function FormStepper({ steps, currentStep, onStepChange }) {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <button
              key={step.title}
              type="button"
              onClick={() => onStepChange(index)}
              className={`rounded-xl border p-3 text-left ${
                isActive
                  ? "border-gray-900 bg-gray-900 text-white"
                  : isComplete
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
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
