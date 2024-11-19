import React from "react"
import Markdown from "markdown-to-jsx"
import Welcome from "./Welcome"

function SummaryTab({ data, openPreferences }: { data: any, openPreferences: () => void }) {
    return (
        <div className="p-4 mb-4" style={{ minHeight: 500, width: '100%'}}>
            {data?.summary && <div className="bg-blue-50 shadow-md p-4 mb-4">
                <p className="text-gray-700 mb-2 text-sm">
                    Here is a comprehensive summary of all the websites you visited today, along with insightful highlights to enhance your research and work.
                </p>
            </div>}
            <Welcome data={data} openPreferences={openPreferences} />
            {data?.summary && <p className="text-gray-700 mb-2 text-lg">
                <Markdown>{data?.summary || 'Wait a couple of hours to see the magic happen.'}</Markdown>
            </p>}
        </div>
    )
}

export default SummaryTab
