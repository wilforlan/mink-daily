import React from "react"

function SummaryTab() {
    return (
        <div className="p-4 mb-4" style={{ minHeight: 500, width: '100%'}}>
            <div className="bg-blue-50 shadow-md rounded-lg p-4 mb-4">
                <p className="text-gray-700 mb-2 text-sm">
                    Here is a comprehensive summary of all the websites you visited today, along with insightful highlights to enhance your research and work.
                </p>
            </div>
            <p className="text-gray-700 mb-2 text-lg">
                You visited a total of 6 unique links today. The most frequently visited link was "Link Title 4," which you accessed 4 times. Overall, you engaged with a variety of topics, including analysis, trends, and insights. <br /> <br />
            </p>
        </div>
    )
}

export default SummaryTab
