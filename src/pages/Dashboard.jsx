import React from 'react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-32">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Statistika</h2>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-600">Jami buyurtmalar</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Mijozlar</h2>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-600">Faol mijozlar</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Daromad</h2>
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-600">So'm</p>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">So'nggi buyurtmalar</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Hali buyurtmalar yo'q</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
