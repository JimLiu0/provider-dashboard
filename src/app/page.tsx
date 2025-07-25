'use client';
import { useState } from 'react';
import AddPatientModal from "./components/AddPatientModal";
import { Toaster } from 'react-hot-toast'

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Toaster position="top-center" />
      <button onClick={() => setOpen(true)}>
        Add patient
      </button>
      <AddPatientModal isOpen={open} onClose={() => setOpen(false)} onSuccess={() => console.log('success')}/>
    </div>
  );
}
