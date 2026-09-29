export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 sm:py-24">
      <div className="w-8 h-8 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin" />

      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}