import Link from 'next/link';
import Logo from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">404</h1>
          <p className="mt-2 text-lg text-gray-600">Page not found</p>
          <p className="mt-1 text-gray-500">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
