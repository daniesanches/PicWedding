import Link from "next/link";

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * Reusable empty state component
 */
export function EmptyState({
  icon,
  message,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ opacity: 0.5 }}>{icon}</div>
      <p
        style={{
          color: "var(--text-light)",
          marginTop: "1rem",
          fontSize: "1rem",
        }}
      >
        {message}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="btn"
          style={{
            maxWidth: "200px",
            marginTop: "1.5rem",
            padding: "0.75rem 1.5rem",
            fontSize: "0.95rem",
          }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
