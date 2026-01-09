import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-brand-dark/80 backdrop-blur-md border-b border-brand-border flex items-center justify-between px-6 z-50 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-brand-red to-red-900 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)] flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-xl font-semibold tracking-wide text-white">
          AI <span className="text-brand-red">Coporties</span>
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand-border">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-gray-400 font-medium">System Operational</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 overflow-hidden">
          <img src="https://picsum.photos/200/200" alt="User" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </header>
  );
};

export default Header;