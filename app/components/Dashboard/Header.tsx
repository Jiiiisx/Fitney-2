// app/components/Dashboard/Header.tsx
import { Settings, Bell, User, Search } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full p-4">
      <div className="flex items-center justify-between w-full max-w-screen-xl mx-auto bg-white/30 backdrop-blur-sm border border-gray-200/50 rounded-full p-2">
        {/* Logo */}
        <div className="pl-2">
          <a href="/dashboard" className="text-xl font-bold text-gray-800 tracking-wider">
            Fitney
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex items-center bg-white/50 border border-gray-200/50 rounded-full px-2 py-1">
          <a href="#" className="px-4 py-2 text-sm font-semibold text-white bg-gray-800 rounded-full">
            Dashboard
          </a>
          <a href="#" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
            History
          </a>
          <a href="#" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
            Analytics
          </a>
          <a href="#" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
            Goals
          </a>
          <a href="#" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
            Community
          </a>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-2 pr-2">
          <button className="p-3 rounded-full hover:bg-gray-200/50">
            <Search size={20} className="text-gray-600" />
          </button>
          <button className="p-3 rounded-full hover:bg-gray-200/50">
            <Settings size={20} className="text-gray-600" />
          </button>
          <button className="p-3 rounded-full hover:bg-gray-200/50">
            <Bell size={20} className="text-gray-600" />
          </button>
          <button className="p-3 rounded-full bg-gray-200/70">
            <User size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
