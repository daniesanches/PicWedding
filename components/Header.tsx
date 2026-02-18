import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle: string;
  showBackButton?: boolean;
  backHref?: string;
  rightAction?: React.ReactNode;
  showDashboardButton?: boolean;
}

/**
 * Reusable header component with optional back button and right action
 */
export function Header({
  title,
  subtitle,
  showBackButton = false,
  backHref = "/",
  rightAction,
  showDashboardButton = false,
}: HeaderProps) {
  return (
    <header style={{ width: "100%", flexShrink: 0 }}>
      {(showBackButton || rightAction || showDashboardButton) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
          }}
        >
          {showBackButton ? (
            <Link
              href={backHref}
              className="back-link"
              style={{ margin: 0, padding: "0.5rem", minHeight: "auto" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
          {rightAction}
          {showDashboardButton && (
            <Link
              href="/dashboard"
              className="dashboard-link"
              title="Top Favoritas"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </Link>
          )}
        </div>
      )}
      <h1
        style={{
          color: "var(--primary)",
          marginBottom: "0.25rem",
          fontSize: showBackButton ? "1.75rem" : "2.5rem",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          color: "var(--text-light)",
          fontSize: "0.95rem",
          fontStyle: "italic",
        }}
      >
        {subtitle}
      </p>
    </header>
  );
}

<style jsx>{`
  .dashboard-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--primary);
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .dashboard-link:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  .dashboard-link:active {
    transform: scale(0.95);
  }
`}</style>;
