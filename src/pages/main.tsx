import Summary from "@/src/pages/Summary"
import { sendToBackground } from "@plasmohq/messaging";
import React, { useEffect, useState } from "react"

function IndexPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const fetchData = async ({ date }: { date?: string }) => {
    setLoading(true);
    const {data, status} = await sendToBackground({
      name: "get-latest-summary-and-insight",
      body: {
        date
      }
    });
    if (status) {
      setData(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData({ date: new Date().toISOString() });
  }, []);

  return (
    <div>
      <Summary data={data} loading={loading} fetchData={fetchData}/>
    </div>
  )
}

export default IndexPage