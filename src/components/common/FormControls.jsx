export function FieldInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 ${
        props.className || ""
      }`}
    />
  );
}

export function FieldSelect({ children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 ${className}`}
    >
      {children}
    </select>
  );
}

export function FieldTextarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 ${className}`}
    />
  );
}
