import Link from "next/link";

export default function Custom500() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
      <h1 className="text-6xl font-bold text-red-600">500</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mt-4">
        Internal Server Error
      </h2>
      <Link href="/">
        <p className="text-gray-600 mt-2">
          Something went wrong on our end. Please try again later.
        </p>
      </Link>
    </div>
  );
}
