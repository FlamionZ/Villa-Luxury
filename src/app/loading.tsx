export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="fas fa-mountain text-2xl text-white"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Villa Paradise</h2>
        </div>
        
        {/* Loading Spinner */}
        <div className="flex justify-center items-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <p className="text-gray-600 animate-pulse">
          Memuat konten yang menakjubkan...
        </p>
      </div>
    </div>
  );
}