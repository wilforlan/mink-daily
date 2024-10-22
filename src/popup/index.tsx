import React, { useState } from "react"
import { UserProvider } from "../providers/user.provider"
import { ApplicationContainer } from "../components/ApplicationContainer"
import IndexPopup from "../pages/Popup"

export default function Popup() {
  return (
    <ApplicationContainer>
      <IndexPopup />
    </ApplicationContainer>
  )
}