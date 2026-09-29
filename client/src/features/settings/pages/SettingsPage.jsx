import CameraMicSetup from "../components/CameraMicSetup";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your device preferences
        </p>
      </div>

      <CameraMicSetup />
    </div>
  );
}