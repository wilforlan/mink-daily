import React, { useState, useReducer } from "react"

export default function Welcome({ data, openPreferences }: { data: any, openPreferences: () => void }) {
    return !data?.summary && (
      <div className="relative isolate overflow-hidden bg-gray-900">
        <div className="px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {data?.hasHadAtleastOneSummary ? "Mink is running! Everywhere you go." : "Welcome to Mink! 10x your Productivity."}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg/8 text-gray-300">
             In a few hours Mink will get your insights, suggestions and internet usage analytics to you and you can just sit back and enjoy them.
            </p>
            <div className="mt-5 flex items-center justify-center gap-x-6">
              <a
                href="https://usemink.com"
                target="_blank"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Mink Website
              </a>
              <button onClick={openPreferences} className="text-sm/6 font-semibold text-white">
                My Preferences <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
        <svg
          viewBox="0 0 1024 1024"
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -z-10 size-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
        >
          <circle r={512} cx={512} cy={512} fill="url(#8d958450-c69f-4251-94bc-4e091a323369)" fillOpacity="0.7" />
          <defs>
            <radialGradient id="8d958450-c69f-4251-94bc-4e091a323369">
              <stop stopColor="#7775D6" />
              <stop offset={1} stopColor="#E935C1" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    )
  }
  
