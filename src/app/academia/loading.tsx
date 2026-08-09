import { Skeleton, SkeletonHeader } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 px-4 py-8" style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}>
      <SkeletonHeader />
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
