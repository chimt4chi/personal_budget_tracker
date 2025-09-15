import Link from "next/link";

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <title>404: Page Not Found</title>
      <h1 className="text-6xl font-bold text-blue-600">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mt-4">
        Oops! Page not found
      </h2>
      <p className="text-gray-600 my-4">
        The page you’re looking for doesn’t exist or has been moved.
      </p>

      <Link href="/">
        <span className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
          Go Back Home
        </span>
      </Link>
    </div>
  );
}
