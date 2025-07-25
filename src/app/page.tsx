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
    <div>
      <Toaster position="top-center" />
      <button onClick={() => setOpen(true)}>
        Add patient
      </button>
      <PatientTable key={refreshKey} />
      <AddPatientModal 
        isOpen={open} 
        onClose={() => setOpen(false)} 
        onSuccess={() => console.log('success')}
        refreshPatients={refreshPatients}
      />
    </div>
  );
}
