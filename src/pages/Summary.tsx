import React, { useState, useReducer } from "react"
import TopHeader from "@/src/components/TopHeader"
import classNames from "@/src/lib/classnames"

import SummaryTab from "@/src/components/SummaryTab"
import AnalyticsTab from "@/src/components/AnalyticsTab"
import SuggestionTab from "@/src/components/SuggestionTab"
import ChatTab from "@/src/components/ChatTab"
import SettingsTab from "../components/tabs/SettingsTab"

const tabs = [
    { name: 'Summary', href: '#', current: true, component: SummaryTab },
    { name: 'Analytics', href: '#', current: false, component: AnalyticsTab },
    { name: 'Insights & Suggestions', href: '#', current: false, component: SuggestionTab },
    // { name: 'Chat', href: '#', current: false, component: ChatTab },
    { name: 'Settings', href: '#', current: false, component: SettingsTab },
]

const LoadingComponent = () => {
    return (
      <div className="flex justify-center items-center h-screen">
        <h4>Loading...</h4>
      </div>
    )
  }
  
function Summary({ data, loading, fetchData }: { data: any, loading: boolean, fetchData: ({date}: {date: string}) => void }) {
    const [currentTab, setCurrentTab] = useState(tabs[0]);

    const handleDateChange = (date: string) => {
        fetchData({date});
    }

    return (
        <div className="bg-gray-100 font-sans leading-normal tracking-normal h-screen flex flex-col">
            <TopHeader onDateChange={handleDateChange}/>
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="border-b border-gray-200 pb-5">
                    <div className="mt-3 sm:mt-4">
                        <div className="sm:hidden">
                            <label htmlFor="current-tab" className="sr-only">
                                Select a tab
                            </label>
                            <select
                                id="current-tab"
                                name="current-tab"
                                defaultValue={tabs.find((tab) => tab.current).name}
                                className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            >
                                {tabs.map((tab) => (
                                    <option key={tab.name}>{tab.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="hidden sm:block">
                            <nav className="-mb-px flex space-x-8">
                                {tabs.map((tab) => (
                                    <a
                                        key={tab.name}
                                        href={tab.href}
                                        aria-current={currentTab.name === tab.name ? 'page' : undefined}
                                        className={classNames(
                                            currentTab.name === tab.name
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                            'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium',
                                        )}
                                        onClick={() => setCurrentTab({ ...tab, current: true })}
                                    >
                                        {tab.name}
                                    </a>
                                ))}
                            </nav>
                        </div>
                        
                        {loading ? <LoadingComponent /> : 
                            <div className="bg-white shadow-lg p-6 mb-6 mt-5 w-full">
                                <currentTab.component data={data} />
                            </div>}
                    </div>
                </div>
            </main>
            <footer className="bg-white shadow-md p-4 text-center sticky bottom-0">
                <p className="text-gray-600">© 2024 Assisfy. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default Summary
