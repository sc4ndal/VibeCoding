export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="error-banner">
      <p>{message}</p>
      <button onClick={onRetry}>다시 시도</button>
    </div>
  );
}
