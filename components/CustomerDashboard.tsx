import React, { useState, useMemo } from 'react';
import type { CarPart } from '../types';

interface CustomerDashboardProps {
  username: string;
  searchParts: (query: string) => CarPart[];
  getAllParts: () => CarPart[];
}

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);


const PartCard: React.FC<{ part: CarPart }> = ({ part }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-105">
    <div className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{part.partName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{part.partNumber}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${part.stock > 0 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
          {part.stock > 0 ? `In Stock (${part.stock})` : 'Out of Stock'}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Make</p>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{part.make}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Model</p>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{part.model}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Year</p>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{part.year}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Price</p>
          <p className="font-semibold text-indigo-600 dark:text-indigo-400 text-lg">${part.price.toFixed(2)}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{part.description}</p>
    </div>
  </div>
);

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ username, searchParts, getAllParts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const allPartsCount = useMemo(() => getAllParts().length, [getAllParts]);

  const filteredParts = useMemo(() => {
    return searchParts(searchQuery);
  }, [searchQuery, searchParts]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Parts Catalog</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Welcome, {username}! Search for any part below.</p>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400"/>
        </div>
        <input
          type="text"
          placeholder="Search by name, part number, make, model, or year..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {filteredParts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParts.map(part => (
            <PartCard key={part.partNumber} part={part} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            {allPartsCount > 0 ? "No parts found for your search." : "No parts in the database yet."}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {allPartsCount > 0 ? "Try a different keyword." : "An administrator needs to upload parts data."}
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
