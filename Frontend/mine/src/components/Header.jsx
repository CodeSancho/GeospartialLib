import React from 'react';
import { Menu, Search, User } from 'lucide-react';

export const Header = ({ title, setIsOpen }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={24} />
      
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        
        <div className="flex items-center gap-3 bg-teal-50 px-4 py-2 rounded-lg">
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-800">Username</p>
            <p className="text-xs text-gray-600">Geologist</p>
          </div>
        </div>
      </div>
    </header>
  );
};