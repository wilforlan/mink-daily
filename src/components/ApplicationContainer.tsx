import React, { useState } from "react"
import { UserProvider } from "../providers/user.provider"

export function ApplicationContainer({ children }) {

  return (
    <UserProvider>
      <div
        style={{
          width: 800,
          height: "100%",
          margin: 0,
          padding: 0,
          backgroundColor: "transparent",
      }}>
          {children}
      </div>
    </UserProvider>
  )
}