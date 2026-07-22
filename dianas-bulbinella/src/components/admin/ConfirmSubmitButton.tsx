"use client";

/** Submit button that asks for confirmation before firing its form action.
 *  Used for destructive admin actions (e.g. permanently deleting a post). */
export default function ConfirmSubmitButton({
  action,
  confirmText,
  className,
  children,
}: {
  action: (formData: FormData) => void;
  confirmText: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      formAction={action}
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
