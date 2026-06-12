export default function MembersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-40 bg-olimpo-surface-light rounded-lg"></div>
          <div className="h-4 w-64 bg-olimpo-surface-light rounded-lg mt-2"></div>
        </div>
        <div className="h-10 w-36 bg-olimpo-surface-light rounded-lg"></div>
      </div>

      <div className="h-16 w-full bg-olimpo-surface rounded-2xl border border-olimpo-surface-light"></div>

      <div className="bg-olimpo-surface rounded-2xl border border-olimpo-surface-light overflow-hidden">
        <div className="h-12 w-full bg-olimpo-surface-light/50 border-b border-olimpo-surface-light"></div>
        <div className="divide-y divide-olimpo-surface-light">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex p-4 items-center justify-between">
              <div className="flex gap-4 items-center w-1/2">
                <div className="h-4 w-16 bg-olimpo-surface-light rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-olimpo-surface-light rounded"></div>
                  <div className="h-3 w-20 bg-olimpo-surface-light rounded"></div>
                </div>
              </div>
              <div className="h-4 w-20 bg-olimpo-surface-light rounded"></div>
              <div className="h-6 w-16 bg-olimpo-surface-light rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
