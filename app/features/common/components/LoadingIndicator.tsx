export default function LoadingIndicator() {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      読み込み中
      <span className="loading loading-dots loading-sm text-base-200"></span>
    </div>
  );
}
