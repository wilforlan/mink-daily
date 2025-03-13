'use client'

import { useEffect, useRef, useState } from 'react'
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import minkIcon from "data-base64:~content-assets/icon.png"
import fabStyles from "data-text:./styles/fab.css"
import baseStyles from "data-text:./styles/base.css"
import dialogStyles from "data-text:./styles/dialog.css"
import { ApplicationContainer } from "../components/ApplicationContainer"
import { useUser } from "../providers/user.provider"
import { sendToBackground } from "@plasmohq/messaging"

// This tells Plasmo to inject these styles into the content script
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    ${baseStyles}
    ${fabStyles}
    ${dialogStyles}
  `
  return style
}

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

interface JourneyEntry {
  title: string
  url: string
  content: string
  highlights: string[]
  badges: string[]
  timestamp: number
}

function MinkPageAppContent() {
  const { user } = useUser()
  const [isDialogVisible, setIsDialogVisible] = useState(false)
  const [direction, setDirection] = useState("")
  const [journeyEntries, setJourneyEntries] = useState<JourneyEntry[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [usageStats, setUsageStats] = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastUrlRef = useRef<string>("")

  const handleClick = () => {
    setIsDialogVisible(true)
  }

  const handleSendDirection = () => {
    if (currentInput.trim()) {
      setDirection(currentInput.trim())
      setCurrentInput("")
      // Here you would typically start tracking the journey
      console.log("Starting journey with direction:", currentInput.trim())
      processCurrentPage()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendDirection()
    }
  }

  const processCurrentPage = async () => {
    if (!direction || isProcessing || window.location.href === lastUrlRef.current) return

    setIsProcessing(true)
    lastUrlRef.current = window.location.href

    // Get page content
    const pageContent = document.body.innerText.substring(0, 1000) // First 1000 chars for summary
    const pageTitle = document.title

    const newEntry: JourneyEntry = {
      title: pageTitle,
      url: window.location.href,
      content: `This page contains information about ${pageTitle}...`,
      highlights: ["Analyzing page content...", "Relating to your direction..."],
      badges: ["New", "Processing"],
      timestamp: Date.now()
    }

    // Add initial entry
    setJourneyEntries(prev => [newEntry, ...prev])

    // TODO: Here you would make an API call to process the page content
    // For now, we'll simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Update with "processed" content
    setJourneyEntries(prev => {
      const updated = [...prev]
      if (updated[0]?.url === window.location.href) {
        updated[0] = {
          ...updated[0],
          content: `This page relates to your direction "${direction}" through its focus on ${pageTitle}.`,
          highlights: [
            "Key concepts identified",
            "Relevant to your journey",
            "Consider exploring related topics"
          ],
          badges: ["Analyzed", "Relevant"]
        }
      }
      return updated
    })

    setIsProcessing(false)
  }

  // Track URL changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      if (window.location.href !== lastUrlRef.current) {
        processCurrentPage()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => observer.disconnect()
  }, [direction])

  // Process initial page
  useEffect(() => {
    if (direction) {
      processCurrentPage()
    }
  }, [direction])

  useEffect(() => {
    console.log('Mink Page App initialized')
  }, [])

  useEffect(() => {
    const getUsageStats = async () => {
      if (user) {
        const resp = await sendToBackground({
          name: "get-usage-stats",
          body: user,
        })
        setUsageStats(resp.stats)
      }
    }
    getUsageStats()
  }, [user])

  const renderDirectionInfo = () => (
    <div className="mink-info-container">
      <div className="mink-info-card">
        <div className="mink-info-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="mink-info-content">
          <h3>What's a Direction?</h3>
          <p>Your direction helps Mink understand your current focus or goal. For example:</p>
          <div className="mink-example-cards">
            <div className="mink-example-card">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>"Learning React and TypeScript"</span>
            </div>
            <div className="mink-example-card">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>"Researching AI trends"</span>
            </div>
            <div className="mink-example-card">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>"Planning summer vacation"</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mink-info-card">
        
        <div className="mink-info-content">
          <h3>How it Works</h3>
          <p>Once you set a direction, Mink will:</p>
          <ul className="mink-features-list">
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Track pages you visit</span>
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Create relevant highlights</span>
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Build your journey map</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )

  return (
    <div id="plasmo-root">
      <button 
        onClick={handleClick}
        className={`mink-fab ${isProcessing ? 'processing' : ''}`}
        aria-label="Mink Assistant"
      >
        <img src={minkIcon} alt="Mink" draggable="false" />
      </button>

      <div className={`mink-dialog ${isDialogVisible ? 'visible' : ''}`}>
        <div className="mink-dialog-header">
          <h2 className="mink-dialog-title">
            {direction ? 'Your Journey' : 'Set Your Direction'}
          </h2>
          {user && (
            <div className="mink-user-info">
              <span className="mink-user-email">{user.email}</span>
              <span className="mink-user-plan">{user.planTier || 'Free'}</span>
              {usageStats && (
                <div className="mink-usage-stats">
                  <span className="mink-stat">
                    Summaries: {usageStats.summariesUsed || 0}/{usageStats.summariesLimit || 5}
                  </span>
                  <span className="mink-stat">
                    History: {usageStats.daysOfHistory || 0} days
                  </span>
                  <span className="mink-stat">
                    Sites: {usageStats.sitesTracked || 0}/{usageStats.sitesLimit || 10000}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mink-dialog-content">
          {!direction ? (
            <>
              <div className="mink-input-container">
                <input
                  ref={inputRef}
                  type="text"
                  className="mink-input"
                  placeholder="What is the direction for today?"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  className="mink-send-button"
                  onClick={handleSendDirection}
                >
                  →
                </button>
              </div>
              {renderDirectionInfo()}
            </>
          ) : (
            <>
              <div className="mink-journey-card">
                <div className="mink-journey-title">Current Direction</div>
                <div className="mink-journey-content">{direction}</div>
              </div>
              {journeyEntries.map((entry, index) => (
                <div key={entry.timestamp} className="mink-journey-card">
                  <div className="mink-journey-title">{entry.title}</div>
                  <div className="mink-journey-content">
                    {entry.content}
                    <div style={{ marginTop: 8 }}>
                      {entry.highlights.map((highlight, i) => (
                        <span key={i} className="mink-highlight">{highlight}</span>
                      ))}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      {entry.badges.map((badge, i) => (
                        <span key={i} className="mink-badge">{badge}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MinkPageApp() {
  return (
    <ApplicationContainer>
      <MinkPageAppContent />
    </ApplicationContainer>
  )
} 