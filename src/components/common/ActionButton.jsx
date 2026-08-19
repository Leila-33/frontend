export default function ActionButton({
  color = "primary",
  icon,
  title,
  onClick,
  disabled = false,
  className = "",
}) {
  return (
    <button
      type="button"
      className={`btn btn-${color} btn-sm rounded-circle shadow-sm ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      <i className={`bi ${icon}`} />
    </button>
  );
}