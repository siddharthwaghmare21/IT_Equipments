import Link from "next/link";

export default function PageHeader({
  title,
  description,
  buttonText,
  buttonHref,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {title}
          </h1>
        </div>

        {description && (
          <p className="mt-1 text-sm text-gray-600">
            {description}
          </p>
        )}
      </div>

      {buttonText && buttonHref && (
        <Link
          href={buttonHref}
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}
