import React from "react"
import Markdown from "markdown-to-jsx"

function AnalyticsTab({ data }: { data: any }) {
    return (
        <div className="p-4 mb-4" style={{ minHeight: 500 }}>
            <div className="bg-blue-50 shadow-md p-4 mb-4">
                <p className="text-gray-700 mb-2 text-sm">
                    You can view detailed analytics about your browsing activity here. This includes the number of unique links visited, the most frequently visited link, and additional insights to help you understand your browsing habits better.
                </p>
            </div>

            {data?.analytics && <div className="bg-white shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Key Insights</h2>
                <ul className="list-disc list-inside text-gray-700 mb-4 text-sm">
                    <li>Most visited link: <b>{data?.analytics?.most_visited_link?.title} ({data?.analytics?.most_visited_link?.count} times)</b></li>
                    <li>Average visits per link: <b>{data?.analytics?.average_time_spent_browing}</b></li>
                    <li>Topics covered: <b>{data?.analytics?.topics_covered?.join(', ')}</b></li>
                </ul>
            </div>}

            {data?.analytics?.additional_insights?.length > 0 && <div className="bg-white shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-2 mt-4">Additional Insights</h3>
                <ul className="list-disc list-inside text-gray-700 text-sm">
                    {data?.analytics?.additional_insights?.map((insight: string, index: number) => (
                        <li key={index}><Markdown>{insight}</Markdown></li>
                    ))}
                </ul>
            </div>}

            {!data?.analytics && <div className="bg-white shadow-lg p-6">
                <p className="text-gray-700 mb-2 text-sm">We do not have any analytics for you on this day yet. Wait a couple of hours and you'll see some analytics.</p>
            </div>}
        </div>
    )
}

export default AnalyticsTab
