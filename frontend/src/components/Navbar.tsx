
export default function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-gray-900 text-white px-6 py-3 shadow-md">
      <h1 className="text-xl font-bold">My App</h1>
      <div className="space-x-4">
        <button className="hover:text-gray-300">Home</button>
        <button className="hover:text-gray-300">About</button>
      </div>
    </nav>
  );
}
