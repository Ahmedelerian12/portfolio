import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">🖥️ IstqSERVERS</h1>
        <p className="text-center text-gray-600 mb-4">Application is working!</p>
        
        <div className="space-y-4">
          <div className="bg-green-100 border border-green-300 rounded p-3">
            <p className="text-green-800 text-sm">✅ React is working</p>
          </div>
          
          <div className="bg-blue-100 border border-blue-300 rounded p-3">
            <p className="text-blue-800 text-sm">✅ CSS/Tailwind is working</p>
          </div>
          
          <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
            <p className="text-yellow-800 text-sm">✅ JavaScript is working</p>
          </div>
          
          <button 
            onClick={() => alert('Button clicked! Everything is working!')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Test Button
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            If you see this, the basic app is working.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
