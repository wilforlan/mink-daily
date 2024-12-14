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
import { getImage, isProduction } from '../misc';
import icon from "data-base64:~content-assets/icon.png"
import { sendToBackground } from '@plasmohq/messaging';

const today = new Date();
const formatNumber = (num: number = 0) => num.toLocaleString('en-US');

const subscriptionLink = isProduction ?
  "https://buy.stripe.com/9AQg1neqrglEe76aEL" :
  "https://buy.stripe.com/test_4gweVb5HIe7TaAg5kk";

export default function TopHeader({ onDateChange }: { onDateChange: (date: string) => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { logOut, user } = useUser();

  const [usageStats, setUsageStats] = useState(null);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    onDateChange(date.toISOString());
  }

  const getUsageStats = async () => {
    const resp = await sendToBackground({
      name: "get-usage-stats",
      body: user,
    });
    setUsageStats(resp.stats);
  }

  const handleSubscriptionLink = async () => {
    const resp = await sendToBackground({
      name: "initiate-checkout-checker",
      body: user,
    });
    window.open(`${subscriptionLink}?client_reference_id=${user?.id}&prefilled_email=${user?.email}`, '_blank');
  };

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

  useEffect(() => {
    if (user) {
      getUsageStats();
    }
  }, [user]);

  return (
    <div className={`sticky top-0 transition-colors duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className={`flex items-center justify-between p-4`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            <img src={icon} alt="Mink Logo" className="w-20 h-16" />
            <h2 className="text-2xl font-bold leading-7 text-gray-900 text-3xl">
              Mink
              {/* beta tag */}
              <span className="ml-2 inline-block bg-yellow-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Beta</span>
            </h2>
          </div>
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
                onClick={() => handleDateChange(new Date())}
              >
                <CalendarIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" />
                Today
              </button>}
            </div>
          </div>
        </div>
        <div className="flex">
          {/* align to the right */}
          <div className="items-left">
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="mt-1 items-center rounded-none bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
              {formatNumber(usageStats?.summary_stats.total_remaining)} of {formatNumber(usageStats?.summary_stats.total_allowed)} summaries remaining
            </div>
            <div className="mt-1 items-center rounded-none bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {formatNumber(usageStats?.website_stats.total_remaining)} of {formatNumber(usageStats?.website_stats.total_allowed)} websites remaining
            </div>
            <div className="mt-1">
              {user && <button
                type="button"
                onClick={logOut}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <Cog8ToothIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" />
                Log Out
              </button>}
            </div>
          </div>

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

      {usageStats?.isPaidUser && <div className="flex flex-col bg-green-100 border-0 border-green-400 px-4 py-3 rounded relative mt-4" role="alert">
        <span className="text-sm text-gray-500">
          You are on the Mink Pro plan.
        </span>
        <span className="text-md text-gray-500">
          See settings to manage your subscription.
        </span>
      </div>}

      {!usageStats?.isPaidUser && <div className="bg-yellow-100 border-0 border-yellow-400 px-4 py-3 rounded relative mt-4" role="alert">
        <span className="text-sm text-gray-500">
          You are currently on the free plan. Upgrade to Pro to get more summaries, insights and continue to stay in the loop.
        </span>
        <button className="mt-2 inline-flex items-center rounded-md bg-green-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" onClick={handleSubscriptionLink}>
          Upgrade to Pro
          <ArrowLongRightIcon className="ml-2 mr-1.5 h-5 w-5" />
        </button>
      </div>}
    </div>
  )
}
