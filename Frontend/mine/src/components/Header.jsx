import React from 'react';
import { Menu, User } from 'lucide-react';

export const Header = ({ title, setIsOpen, user }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsOpen((current) => !current)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={24} />
      
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-teal-50 px-4 py-2 rounded-lg">
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-800">{user?.username || user?.email || 'User'}</p>
            <p className="text-xs capitalize text-gray-600">{user?.role || 'user'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
