interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

/**
 * Reusable loading spinner component
 */
export function LoadingSpinner({ size = "md", text }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "16px",
    md: "24px",
    lg: "32px",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
      }}
    >
      <div
        className="spinner"
        style={{ width: sizeMap[size], height: sizeMap[size] }}
      />
      {text && (
        <span
          style={{
            color: "var(--text-light)",
            fontSize: size === "sm" ? "0.85rem" : "0.95rem",
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
}
