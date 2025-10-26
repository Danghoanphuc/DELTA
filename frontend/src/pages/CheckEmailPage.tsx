// frontend/src/pages/CheckEmailPage.tsx

import { useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";

const CHECK_EMAIL_STORAGE_KEY = "emailVerifiedStatus";

const CheckEmailPage = () => {
  const { state } = useLocation();
  const email = state?.email;

  // Track verification status
  const [isVerified, setIsVerified] = useState(
    localStorage.getItem(CHECK_EMAIL_STORAGE_KEY) === "true"
  );

  // Listen for storage changes (verification from another tab)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CHECK_EMAIL_STORAGE_KEY && event.newValue === "true") {
        setIsVerified(true);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Clean up verification flag when leaving page
  useEffect(() => {
    return () => {
      localStorage.removeItem(CHECK_EMAIL_STORAGE_KEY);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {isVerified ? (
          <>
            {/* Verified state */}
            <h1 className="text-2xl font-bold mb-4 text-green-600">
              Email verified successfully!
            </h1>
            <p className="text-gray-700 mb-6">
              Great! You can now sign in to your account.
            </p>
            <Link
              to="/signin"
              className="mt-6 inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Sign in now
            </Link>
          </>
        ) : (
          <>
            {/* Pending verification state */}
            <h1 className="text-2xl font-bold mb-4">Check your inbox!</h1>
            <p className="text-gray-700 mb-6">
              <br />
              We've sent an activation link to
              {email ? (
                <strong className="text-indigo-600 block my-2">{email}</strong>
              ) : (
                " your email."
              )}
              Click the link to complete your registration.
            </p>
            <p className="text-sm text-gray-500">
              (Don't see it? Please check your Spam folder.)
            </p>
            <Link
              to="/signin"
              className="mt-6 inline-block text-indigo-600 hover:underline"
            >
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckEmailPage;
