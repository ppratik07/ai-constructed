import Link from 'next/link';
import SignOutButton from './SignOutButton';

interface NavbarProps {
  userEmail: string;
}

export default function Navbar({ userEmail }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-blue-700 text-lg hover:text-blue-800 transition-colors"
          >
            {/* Construction icon */}
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"
              />
            </svg>
            AI-Constructed
          </Link>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              href="/dashboard"
              className="hover:text-blue-700 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/projects/create"
              className="hover:text-blue-700 transition-colors"
            >
              New Project
            </Link>
          </div>

          {/* User info + sign out */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-slate-500 truncate max-w-[200px]">
              {userEmail}
            </span>
            <SignOutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
