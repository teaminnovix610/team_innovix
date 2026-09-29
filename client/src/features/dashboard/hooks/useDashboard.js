import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../services/dashboard.service";

const defaultDashboard = {
  batch: null,
  todayClasses: [],
  upcomingClasses: [],
  students: [],
  teachers: [],
  parents: [],
  recentClasses: [],
  recentPayments: [],
  analytics: {},
};

export default function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      try {
        const data = await getDashboard();
        return data ?? defaultDashboard;
      } catch (error) {
        // If the backend returns no dashboard for a new user,
        // return empty dashboard data instead of crashing.
        return defaultDashboard;
      }
    },
    retry: false,
    refetchInterval: 30000, // silently refetch every 30s so other users' changes (new batches, scheduled classes) show up without a manual refresh
  });
}