import React from 'react';
import Navbar from './Navbar';
import { cn } from '../utils/helpers';

export default function Layout({ children, fullWidth = false }) {
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <Navbar />
      <main
        className={cn(
          'flex-1',
          fullWidth ? 'w-full' : 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6'
        )}
      >
        {children}
      </main>
    </div>
  );
}

