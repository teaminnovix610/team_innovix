import { useBatches } from "../hooks/useBatch";
import BatchCard from "../components/BatchCard";
import CreateBatchDialog from "../components/CreateBatchDialog";
import LoadingState from "@/components/layout/LoadingState";
import useAuth from "@/hooks/useAuth";

export default function BatchListPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";
    const {
        data = [],
        isLoading,
    } = useBatches();

    if (isLoading)
        return <LoadingState message="Loading batches..." />;

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold">
                    {isAdmin ? "Course Assignments" : "My Courses"}
                </h1>

                <CreateBatchDialog isAdmin={isAdmin} />
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {data.length === 0 ? (
                    <p>{isAdmin ? "No course assignments yet." : "No courses assigned yet."}</p>
                ) : (
                    data.map((batch) => (
                        <BatchCard
                            key={batch._id}
                            batch={batch}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
