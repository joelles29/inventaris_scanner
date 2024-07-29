import Link from 'next/link';
import type { NextPage } from 'next';
import type { ReactElement } from 'react';

const Home: NextPage = (): ReactElement => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-purple-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Welcome to Plant Label Scanner</h1>
      <Link href="/scanner" legacyBehavior>
        <a className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md">Go to Scanner</a>
      </Link>
    </div>
  );
};

export default Home;
