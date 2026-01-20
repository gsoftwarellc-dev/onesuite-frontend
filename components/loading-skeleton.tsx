
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-6 h-32">
                        <div className="flex justify-between mb-4">
                            <Skeleton className="w-12 h-12 rounded-lg" />
                            <Skeleton className="w-12 h-6 rounded" />
                        </div>
                        <Skeleton className="w-24 h-8 mb-2" />
                        <Skeleton className="w-32 h-4" />
                    </div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 h-[400px]">
                    <Skeleton className="w-48 h-8 mb-6" />
                    <Skeleton className="w-full h-[300px] rounded" />
                </div>
                <div className="bg-white rounded-lg p-6 h-[400px]">
                    <Skeleton className="w-48 h-8 mb-6" />
                    <div className="flex justify-center items-center h-[300px]">
                        <Skeleton className="w-64 h-64 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
