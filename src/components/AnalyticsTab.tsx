import React from "react"

function AnalyticsTab() {
    return (
        <div className="p-4 mb-4" style={{ minHeight: 500 }}>
            <div className="bg-blue-50 shadow-md rounded-lg p-4 mb-4">
                <p className="text-gray-700 mb-2 text-sm">
                    You can view detailed analytics about your browsing activity here. This includes the number of unique links visited, the most frequently visited link, and additional insights to help you understand your browsing habits better.
                </p>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Key Insights</h2>
                <ul className="list-disc list-inside text-gray-700 mb-4 text-xl">
                    <li>Most visited link: Link Title 4 (4 times)</li>
                    <li>Average visits per link: 2 times</li>
                    <li>Topics covered: Analysis, Trends, Insights</li>
                </ul>
            </div>

            <h3 className="text-xl font-semibold mb-2 mt-4">Additional Insights</h3>
            <ul className="list-disc list-inside text-gray-700 text-xl">
                <li>Links related to technology were visited the most.</li>
                <li>Highest engagement time was on Link Title 1.</li>
                <li>Links with visual content had a higher visit rate.</li>
                <li>Users spent an average of 5 minutes per link.</li>
                <li>Top three categories visited: Technology, Health, and Finance.</li>
            </ul>
        </div>
    )
}

export default AnalyticsTab
