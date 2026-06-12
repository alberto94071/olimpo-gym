export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Welcome Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-64 bg-olimpo-surface-light rounded-lg"></div>
          <div className="h-4 w-48 bg-olimpo-surface-light rounded-lg mt-2"></div>
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-olimpo-surface p-6 rounded-2xl border border-olimpo-surface-light shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-olimpo-surface-light rounded-lg"></div>
              <div className="w-9 h-9 bg-olimpo-surface-light rounded-lg"></div>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="h-8 w-20 bg-olimpo-surface-light rounded-lg"></div>
              <div className="h-3 w-16 bg-olimpo-surface-light rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Sections Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {[1, 2].map((section) => (
          <div key={section} className="bg-olimpo-surface rounded-2xl border border-olimpo-surface-light overflow-hidden shadow-lg flex flex-col">
            <div className="p-5 border-b border-olimpo-surface-light">
              <div className="h-5 w-40 bg-olimpo-surface-light rounded-lg"></div>
            </div>
            <div className="p-0 flex-1">
              <div className="divide-y divide-olimpo-surface-light">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {section === 2 && (
                        <div className="w-10 h-10 rounded-full bg-olimpo-surface-light shrink-0"></div>
                      )}
                      <div>
                        <div className="h-4 w-32 bg-olimpo-surface-light rounded-lg mb-2"></div>
                        <div className="h-3 w-24 bg-olimpo-surface-light rounded-lg"></div>
                      </div>
                    </div>
                    <div className="h-8 w-20 bg-olimpo-surface-light rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
