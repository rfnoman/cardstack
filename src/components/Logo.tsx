'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Logo() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <Link
      href="/"
      className={`flex items-center space-x-2 text-2xl font-bold ${
        isHome ? 'text-white' : 'text-gray-900'
      }`}
    >
      <svg
        className={`h-8 w-8 ${isHome ? 'text-white' : 'text-blue-600'}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V9Z"
          className={isHome ? 'fill-white' : 'fill-blue-600'}
          fillOpacity="0.2"
        />
        <path
          d="M3 6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V15C21 16.1046 20.1046 17 19 17H5C3.89543 17 3 16.1046 3 15V6Z"
          className={isHome ? 'fill-white' : 'fill-blue-600'}
          fillOpacity="0.4"
        />
        <path
          d="M3 3C3 1.89543 3.89543 1 5 1H19C20.1046 1 21 1.89543 21 3V12C21 13.1046 20.1046 14 19 14H5C3.89543 14 3 13.1046 3 12V3Z"
          className={isHome ? 'fill-white' : 'fill-blue-600'}
          fillOpacity="0.8"
        />
      </svg>
      <span>CardStack</span>
    </Link>
  );
}
