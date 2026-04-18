import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-primary-600">
              Story Video Creator
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/" className="text-gray-700 hover:text-primary-600">
                Projects
              </Link>
              <Link href="/create" className="text-gray-700 hover:text-primary-600">
                Create New
              </Link>
            </div>
          </div>
          <div className="text-sm text-gray-500">Phase 1 - Basic Project Management</div>
        </div>
      </div>
    </nav>
  );
}
