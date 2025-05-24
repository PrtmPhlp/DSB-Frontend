import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/className";

export const SkeletonCard: React.FC = () => (
    <Card className="shadow-lg dark:bg-transparent">
        <CardHeader>
            <div className="flex justify-between items-center">
                <Skeleton className={cn("h-8 w-2/3", "dark:bg-neutral-800")} />
                <Skeleton className={cn("h-4 w-20", "dark:bg-neutral-800")} />
            </div>
        </CardHeader>
        <CardContent>
            <Skeleton className={cn("h-4 w-3/4", "dark:bg-neutral-800")} />
        </CardContent>
    </Card>
); 