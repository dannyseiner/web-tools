"use client";

import Image from "next/image";

export default function Home() {
  const handleThrowError = () => {
    throw new Error("Test error");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex items-center justify-center flex-col">
        <p className="text-2xl font-bold">Generic error</p>
        <button
          onClick={handleThrowError}
          className="bg-blue-500 text-white p-2 rounded-md"
        >
          Throw error
        </button>
      </div>
    </div>
  );
}
