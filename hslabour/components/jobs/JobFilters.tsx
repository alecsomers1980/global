'use client';

import { useCallback, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface JobFiltersProps {
  cities: string[];
  categories: string[];
}

export default function JobFilters({ cities, categories }: JobFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCity = searchParams.get('city') ?? '';
  const currentCategory = searchParams.get('category') ?? '';
  const currentQuery = searchParams.get('q') ?? '';

  const [searchValue, setSearchValue] = useState(currentQuery);

  const updateParams = useCallback(
    (key: 'city' | 'category' | 'q', value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(pathname + '?' + params.toString(), { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateParams('q', searchValue.trim());
    },
    [updateParams, searchValue],
  );

  const handleClear = useCallback(() => {
    setSearchValue('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('city');
    params.delete('category');
    params.delete('q');
    router.push(pathname + (params.toString() ? '?' + params.toString() : ''), {
      scroll: false,
    });
  }, [router, pathname, searchParams]);

  const selectClasses =
    'px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700';
  const inputClasses =
    'px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700 flex-1 min-w-0';
  const buttonClasses =
    'inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2';
  const primaryButtonClasses = `${buttonClasses} bg-blue-700 text-white hover:bg-blue-800`;
  const secondaryButtonClasses = `${buttonClasses} border border-gray-300 bg-white text-gray-700 hover:bg-gray-100`;

  return (
    <form onSubmit={handleSearch} className="space-y-4 sm:space-y-0 sm:flex sm:items-end sm:gap-4">
      <div className="flex-1">
        <label htmlFor="filter-city" className="sr-only">
          City
        </label>
        <select
          id="filter-city"
          value={currentCity}
          onChange={(e) => updateParams('city', e.target.value)}
          className={`${selectClasses} w-full`}
        >
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label htmlFor="filter-category" className="sr-only">
          Category
        </label>
        <select
          id="filter-category"
          value={currentCategory}
          onChange={(e) => updateParams('category', e.target.value)}
          className={`${selectClasses} w-full`}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 flex gap-2">
        <label htmlFor="filter-search" className="sr-only">
          Search
        </label>
        <input
          id="filter-search"
          type="text"
          placeholder="Job title or keyword"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className={inputClasses}
        />
        <button type="submit" className={primaryButtonClasses}>
          Search
        </button>
        {(currentCity || currentCategory || currentQuery) && (
          <button type="button" onClick={handleClear} className={secondaryButtonClasses}>
            Clear
          </button>
        )}
      </div>
    </form>
  );
}