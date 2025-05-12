export default function PersonaSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full h-full flex flex-col">
      <div className="flex justify-center mb-3">
        <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="space-y-3 flex-grow">
        <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-3/4" />
        <div className="space-y-2 flex-grow">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}