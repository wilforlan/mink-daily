import Markdown from "markdown-to-jsx"
import React from "react"

function SuggestionTab({ data }: { data: any }) {
    return (
        <div className="p-4 mb-4" style={{ minHeight: 500 }}>
            <div className="bg-blue-50 shadow-md rounded-lg p-4 mb-4">
                <p className="text-gray-700 mb-2 text-sm">
                    Based on your browsing activity, here are some suggestions to help you improve your research and work habits. You can use these insights to optimize your workflow and enhance your productivity.
                </p>
            </div>
            <div className="bg-blue-50 shadow-md rounded-lg p-4 mb-4">
                <h3 className="text-xl font-semibold mb-2">Suggestions</h3>
                <p className="text-sm font-bold text-blue-600"><Markdown>{data?.suggestions || 'We do not have any suggestions for you on this day yet..'}</Markdown></p>
            </div>

            <div className="bg-blue-50 shadow-md rounded-lg p-4 mb-4">
                <h3 className="text-xl font-semibold mb-2">Insights</h3>
                <p className="text-sm font-bold text-blue-600"><Markdown>{data?.insights || 'We do not have any insights for you on this day yet..'}</Markdown></p>
            </div>

            
        </div>
    )
}

export default SuggestionTab
