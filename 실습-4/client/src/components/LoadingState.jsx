export function LoadingState({ message = '처리 중입니다...' }) {
  return <p className="loading">{message}</p>;
}
