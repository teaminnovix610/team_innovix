export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white px-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 animate-pulse text-center">
        CapacityConnect
      </h1>

      <div className="w-8 h-8 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}