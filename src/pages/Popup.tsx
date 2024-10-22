

import React from "react"
import '../style.css';

import AccountSetUp from "@/src/pages/AccountSetUp"
import IndexPage from "@/src/pages/main"
import { useUser } from "../providers/user.provider";

const IndexPopup = () => {
  const { user } = useUser();

  return (
    <div>
        {!user && <AccountSetUp />}
        {user && <IndexPage />}
    </div>
  )
}

export default IndexPopup