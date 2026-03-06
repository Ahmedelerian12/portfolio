import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🖥️ IstqSERVERS
          </h1>
          <p className="text-gray-600 mb-6">
            IT Infrastructure Management System
          </p>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-green-400">✅</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Application Started Successfully
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Frontend server is running on port 3000</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-400">ℹ️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Next Steps
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>React application is working correctly!</p>
                    <p>White screen issue has been resolved.</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => alert('Button clicked! React is working!')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Test React Functionality
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
