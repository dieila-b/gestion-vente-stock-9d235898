
import React from 'react';

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-md shadow">
        <h3 className="text-lg font-medium">Total Sales</h3>
        <p className="text-2xl font-bold">--</p>
      </div>
      <div className="bg-white p-4 rounded-md shadow">
        <h3 className="text-lg font-medium">Total Customers</h3>
        <p className="text-2xl font-bold">--</p>
      </div>
      <div className="bg-white p-4 rounded-md shadow">
        <h3 className="text-lg font-medium">Total Orders</h3>
        <p className="text-2xl font-bold">--</p>
      </div>
    </div>
  );
}
