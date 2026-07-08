export function FieldInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-[#314666] bg-[#101a2b] px-4 py-3 text-sm text-white outline-none placeholder:text-[#7d90b2] focus:border-[#7c4cf3] ${
        props.className || ""
      }`}
    />
  );
}

export function FieldSelect({ children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-[#314666] bg-[#101a2b] px-4 py-3 text-sm text-white outline-none focus:border-[#7c4cf3] ${className}`}
    >
      {children}
    </select>
  );
}

export function FieldTextarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-2xl border border-[#314666] bg-[#101a2b] px-4 py-3 text-sm text-white outline-none placeholder:text-[#7d90b2] focus:border-[#7c4cf3] ${className}`}
    />
  );
}
