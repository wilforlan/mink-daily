import React, { useState, useEffect } from 'react';
import {
  ArrowLongRightIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  Cog8ToothIcon,
  ArrowLongLeftIcon,
  LinkIcon,
  PencilIcon,
} from '@heroicons/react/20/solid'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { useUser } from '../providers/user.provider';

const today = new Date();

export default function TopHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { logOut } = useUser();

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`flex items-center justify-between p-4 sticky top-0 transition-colors duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 text-3xl">
          Mink Daily
          {/* beta tag */}
          <span className="ml-2 inline-block bg-yellow-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Beta</span>
        </h2>
        <div className="mt-1 flex flex-col">
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <div className='flex py-1'>
              <ArrowLongLeftIcon aria-hidden="true" className="mr-2 h-5 w-5 text-black hover:cursor-pointer" onClick={
                () => handleDateChange(new Date(currentDate.setDate(currentDate.getDate() - 1)))
              } />
              <CalendarIcon aria-hidden="true" className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
              {/* human readable date */}
              <span className="font-semibold">{currentDate.toDateString()}</span>
              <ArrowLongRightIcon aria-hidden="true" className="ml-3 h-5 w-5 text-black hover:cursor-pointer" onClick={
                () => handleDateChange(new Date(currentDate.setDate(currentDate.getDate() + 1)))
              } />
            </div>
            {/* today button with icon if not current date not today */}
            {today.toLocaleDateString() !== currentDate.toLocaleDateString() && <button
              type="button"
              className="ml-5 inline-flex items-center rounded-md bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              onClick={() => setCurrentDate(new Date())}
            >
              <CalendarIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" />
              Today
            </button>}
          </div>
        </div>
      </div>
      <div className="mt-5 flex lg:ml-4 lg:mt-0">
        <span className="ml-3">
          <button
            type="button"
            onClick={logOut}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <Cog8ToothIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" />
            Log Out
          </button>
        </span>

        {/* <span className="sm:ml-3">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Cog8ToothIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />
            Quick Settings
          </button>
        </span> */}
      </div>
    </div>
  )
}
