import Markdown from "markdown-to-jsx"
import React from "react"

function SuggestionTab({ data }: { data: any }) {
    return (
        <div className="p-4 mb-4" style={{ minHeight: 500 }}>
            <div className="bg-blue-50 shadow-md p-4 mb-4">
                <p className="text-gray-700 mb-2 text-sm">
                    Based on your browsing activity, here are some suggestions to help you improve your research and work habits. You can use these insights to optimize your workflow and enhance your productivity.
                </p>
            </div>
            <div className="bg-blue-50 shadow-md p-4 mb-4">
                <h3 className="text-xl font-semibold mb-2">Suggestions</h3>
                <p className="text-sm font-bold text-blue-600"><Markdown>{data?.suggestions || 'Mink has not created any suggestions for you yet. Keep Mink running and they\'ll keep showing up!'}</Markdown></p>
            </div>

            <div className="bg-blue-50 shadow-md p-4 mb-4">
                <h3 className="text-xl font-semibold mb-2">Insights</h3>
                <p className="text-sm font-bold text-blue-600"><Markdown>{data?.insights || 'The data Mink has is not enough to compute your insights. The more you browse, the more insights we\'ll have.'}</Markdown></p>
            </div>

            
        </div>
    )
}

export default SuggestionTab
