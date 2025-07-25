'use client';
import { useState, useCallback } from 'react';
import AddPatientModal from "./components/AddPatientModal";
import { Toaster } from 'react-hot-toast'
import PatientTable from './components/PatientTable';

export default function Home() {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshPatients = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
          <button 
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Patient
          </button>
        </div>
        <PatientTable key={refreshKey} />
      </div>
      <AddPatientModal 
        isOpen={open} 
        onClose={() => setOpen(false)} 
        onSuccess={() => console.log('success')}
        refreshPatients={refreshPatients}
      />
    </div>
  );
}
