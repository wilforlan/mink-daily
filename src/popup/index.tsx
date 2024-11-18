import React, { useState } from "react"
import { UserProvider } from "../providers/user.provider"
import { ApplicationContainer } from "../components/ApplicationContainer"
import IndexPopup from "../pages/Popup"
import * as _Sentry from "@sentry/react"

const Sentry = _Sentry;

// Sentry can be initialized here because this is a tab/popup and is not a shared environment
// NOTE: Please be wary of this as it will include code that lazy loads sentry code. This could
// result in the stores rejecting your submission.
Sentry.init({
  dsn: process.env.PLASMO_PUBLIC_SENTRY_DSN
})

function Popup() {
  return (
    <ApplicationContainer>
      <IndexPopup />
    </ApplicationContainer>
  )
}

export default Sentry.withProfiler(Popup)