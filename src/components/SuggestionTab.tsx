import React from "react"

function SuggestionTab() {
    return (
        <div className="p-4 mb-4" style={{ minHeight: 500 }}>
            <div className="bg-blue-50 shadow-md rounded-lg p-4 mb-4">
                <p className="text-gray-700 mb-2 text-sm">
                    Based on your browsing activity, here are some suggestions to help you improve your research and work habits. You can use these insights to optimize your workflow and enhance your productivity.
                </p>
            </div>
            <div className="bg-blue-50 shadow-md rounded-lg p-4 transition-transform transform hover:scale-105 mb-4">
                <h3 className="text-xl font-semibold mb-2">Total Links Visited</h3>
                <p className="text-3xl font-bold text-blue-600">12</p>
            </div>

            <div className="bg-blue-50 shadow-md rounded-lg p-4 transition-transform transform hover:scale-105 mb-4">
                <h3 className="text-xl font-semibold mb-2">Most Visited Link</h3>
                <p className="text-3xl font-bold text-blue-600">Link Title 4 (4 times)</p>
            </div>

            <div className="bg-blue-50 shadow-md rounded-lg p-4 transition-transform transform hover:scale-105 mb-4">
                <h3 className="text-xl font-semibold mb-2">Average Visits per Link</h3>
                <p className="text-3xl font-bold text-blue-600">2.0</p>
            </div>
        </div>
    )
}

export default SuggestionTab
