import React from "react"
import Markdown from "markdown-to-jsx"

function SummaryTab({ data }: { data: any }) {
    return (
        <div className="p-4 mb-4" style={{ minHeight: 500, width: '100%'}}>
            <div className="bg-blue-50 shadow-md rounded-lg p-4 mb-4">
                <p className="text-gray-700 mb-2 text-sm">
                    Here is a comprehensive summary of all the websites you visited today, along with insightful highlights to enhance your research and work.
                </p>
            </div>
            <p className="text-gray-700 mb-2 text-lg">
                <Markdown>{data?.summary || 'We do not have any summary for you on this day yet. Wait a couple of hours to see the magic happen.'}</Markdown>
            </p>
        </div>
    )
}

export default SummaryTab
