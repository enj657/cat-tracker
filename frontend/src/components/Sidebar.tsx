import React, { useState } from 'react';

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`bg-gray-800 text-white transition-all duration-300 ${
        open ? 'w-64' : 'w-16'
      } h-screen p-4 flex flex-col`}
    >
      <button
        className="mb-4 text-sm text-gray-400 hover:text-white"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Close' : 'Open'}
      </button>
      <nav className="space-y-2">
        <a href="#" className="block hover:text-gray-300">Dashboard</a>
        <a href="#" className="block hover:text-gray-300">Settings</a>
      </nav>
    </aside>
  );
}
