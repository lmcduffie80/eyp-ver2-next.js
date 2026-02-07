export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-5 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="h-9 w-48 bg-white/10 rounded-lg animate-pulse"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm flex gap-5 items-center">
              <div className="w-15 h-15 rounded-xl bg-gray-200 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center py-16 text-gray-500">
          <div className="text-xl">Loading dashboard...</div>
        </div>
      </div>
    </div>
  );
}
