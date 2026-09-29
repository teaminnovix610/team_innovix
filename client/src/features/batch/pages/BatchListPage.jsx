import { useBatches } from "../hooks/useBatch";
import BatchCard from "../components/BatchCard";
import CreateBatchDialog from "../components/CreateBatchDialog";
import LoadingState from "@/components/layout/LoadingState";

export default function BatchListPage() {
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
                    My Batches
                </h1>

                <CreateBatchDialog />
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {data.length === 0 ? (
                    <p>No batches found.</p>
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