import { Skeleton, SkeletonHeader } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 px-4 py-8 items-center" style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}>
      <div className="w-full"><SkeletonHeader /></div>
      <Skeleton className="h-64 w-64 rounded-full mt-4" />
      <div className="w-full flex flex-col gap-3 mt-8">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
