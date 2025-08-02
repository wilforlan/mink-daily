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
import { isProduction } from "../misc/constants"
import { draggableElement } from "../misc/draggable"
import { analyticsTrack, SegmentAnalyticsEvents } from '../background/commons/analytics'

// This tells Plasmo to inject these styles into the content script
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    :root {
      --mink-primary: #22c55e;
      --mink-primary-rgb: 34, 197, 94;
    }
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
  summary: {
    keyPoints: string[]
    pros: string[]
    cons: string[]
    statistics: string[]
    steps?: string[]
    connections?: {
      previousPages: string[]
      nextPages: string[]
      relatedTopics: string[]
    }
  }
  relevanceScore: number
  context: {
    relationToDirection: string
    previousPageConnections?: string[]
    journeyContext?: {
      position: number
      totalPages: number
      theme: string
      progress: {
        percentage: number
        description: string
      }
    }
    insights?: {
      patterns: string[]
      learnings: string[]
      recommendations: string[]
    }
  }
}

function MinkPageAppContent() {
  const { user, settings, updateSettings } = useUser()
  const [isDialogVisible, setIsDialogVisible] = useState(false)
  const [direction, setDirection] = useState("")
  // Note: Be careful when adding journeyEntries to useEffect dependency arrays
  // as it can cause infinite loops when combined with processCurrentPage
  const [journeyEntries, setJourneyEntries] = useState<JourneyEntry[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [usageStats, setUsageStats] = useState<any>(null)
  const [directionExpiry, setDirectionExpiry] = useState<number | null>(null)
  const [journeyMap, setJourneyMap] = useState<any[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const lastUrlRef = useRef<string>("")
  // Track URLs that are currently being processed to prevent duplicate entries
  const processingUrlRef = useRef<string>("")
  // Refs for draggable elements
  const fabRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const dialogHeaderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const getUsageStats = async () => {
    if (user) {
      const resp = await sendToBackground({
        name: "get-usage-stats",
        body: user,
      })
      setUsageStats(resp.stats)
      return resp.stats
    }
    return null
  }

  // Fetch journey map data
  const getJourneyMap = async () => {
    try {
      const response = await sendToBackground({
        name: "get-journey-map"
      });
      
      if (response.status && response.journeyMap) {
        setJourneyMap(response.journeyMap);
        return response.journeyMap;
      }
      return [];
    } catch (error) {
      console.error("Error fetching journey map:", error);
      return [];
    }
  };

  // Load saved direction and expiry time from storage
  useEffect(() => {
    const loadSavedDirection = async () => {
      try {
        // Use background messaging to get the saved direction
        const response = await sendToBackground({
          name: "get-direction"
        })
        
        console.log('Response from get-direction:', response)
        
        if (response.status && response.direction && response.expiryTime) {
          setDirection(response.direction)
          setDirectionExpiry(response.expiryTime)
          console.log('Loaded saved direction:', response.direction)
          console.log('Direction expires at:', new Date(response.expiryTime).toLocaleString())
        }
      } catch (error) {
        console.error('Error loading saved direction:', error)
      }
    }
    
    loadSavedDirection()
  }, [])

  // Save direction and expiry time to storage whenever they change
  useEffect(() => {
    const saveDirection = async () => {
      if (direction && directionExpiry) {
        try {
          // Use background messaging to save the direction
          await sendToBackground({
            name: "save-direction",
            body: {
              direction,
              expiryTime: directionExpiry
            }
          })
          console.log('Direction saved via background messaging')
          analyticsTrack(SegmentAnalyticsEvents.USER_JOURNEY_DIRECTION_SET, {
            userEmail: user?.email,
            direction: direction,
            expiryTime: directionExpiry
          })
        } catch (error) {
          console.error('Error saving direction:', error)
        }
      }
    }
    
    saveDirection()
  }, [direction, directionExpiry])

  const handleClick = () => {
    if (!isDialogVisible) {
      analyticsTrack(SegmentAnalyticsEvents.USER_JOURNEY_PANEL_OPENED, {
        userEmail: user?.email,
        direction: direction,
        expiryTime: directionExpiry
      })
    } else {
      analyticsTrack(SegmentAnalyticsEvents.USER_JOURNEY_PANEL_CLOSED, {
        userEmail: user?.email,
        direction: direction,
        expiryTime: directionExpiry
      })
    }

    setIsDialogVisible(!isDialogVisible)
    
    // // If run frequency is set to manual and we have a direction, process the current page
    // const runFrequency = settings?.options?.minkRunFrequency
    // if (runFrequency === "manual" && direction && !isProcessing) {
    //   // Check if we already have an entry for this URL
    //   const urlAlreadyProcessed = journeyEntries.some(entry => entry.url === window.location.href)
      
    //   // Only process if we haven't processed this URL yet or if the dialog is not visible
    //   if (!urlAlreadyProcessed || !isDialogVisible) {
    //     processCurrentPage()
    //   }
    // }
  }

  const handleSendDirection = async () => {
    if (currentInput.trim()) {
      // Set the direction
      setDirection(currentInput.trim())
      setCurrentInput("")
      
      // Set expiry time to 24 hours from now
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000)
      setDirectionExpiry(expiryTime)
      
      // Save to background storage
      try {
        await sendToBackground({
          name: "save-direction",
          body: {
            direction: currentInput.trim(),
            expiryTime
          }
        })
        console.log("Direction saved to background storage")
      } catch (error) {
        console.error("Error saving direction to background storage:", error)
      }
      
      // Here you would typically start tracking the journey
      console.log("Starting journey with direction:", currentInput.trim())
      console.log("Direction expires at:", new Date(expiryTime).toLocaleString())
      
      // Make sure dialog is visible when setting direction
      setIsDialogVisible(true)
      processCurrentPage()
    }
  }

  const handleEditDirection = () => {
    // Pre-fill the input with the current direction for editing
    setCurrentInput(direction)
    // Clear the current direction
    setDirection("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendDirection()
    }
  }

  const processCurrentPage = async () => {
    if (!direction || isProcessing) return
    
    // Prevent duplicate processing of the same URL
    if (processingUrlRef.current === window.location.href) {
      console.log("Already processing this URL, skipping duplicate job")
      return
    }
    
    // Get usage stats initially
    const stats = await getUsageStats()
    console.log("Usage stats:", stats)
    
    // Check if the user has reached their daily journey limit
    if (stats && stats.journey_stats && stats.journey_stats.journeys_remaining <= 0) {
      console.log("Daily journey limit reached")
      analyticsTrack(SegmentAnalyticsEvents.USER_JOURNEY_LIMIT_REACHED, {
        userEmail: user?.email,
        direction: direction,
        expiryTime: directionExpiry
      })

      // Show a message to the user
      setJourneyEntries(prev => {
        // Check if we already have an entry for this URL
        const existingEntryIndex = prev.findIndex(entry => entry.url === window.location.href)
        
        if (existingEntryIndex !== -1) {
          // Don't add a duplicate entry
          return prev
        }
        
        // Create a limit reached entry
        const limitReachedEntry: JourneyEntry = {
          title: document.title || "Limit Reached",
          url: window.location.href,
          content: "Daily journey limit reached. Upgrade to Pro for more journeys.",
          highlights: ["You've reached your daily journey limit"],
          badges: ["Limit Reached"],
          timestamp: Date.now(),
          summary: {
            keyPoints: ["Upgrade to Pro for up to 100 journeys per day"],
            pros: [],
            cons: [],
            statistics: [],
            connections: {
              previousPages: [],
              nextPages: [],
              relatedTopics: []
            }
          },
          relevanceScore: 0,
          context: {
            relationToDirection: "Cannot process due to daily limit",
            previousPageConnections: [],
            journeyContext: {
              position: 0,
              totalPages: 0,
              theme: "",
              progress: {
                percentage: 0,
                description: ""
              }
            },
            insights: {
              patterns: [],
              learnings: [],
              recommendations: []
            }
          }
        }
        
        return [limitReachedEntry, ...prev]
      })
      
      // Show the dialog to inform the user
      setIsDialogVisible(true)
      return
    }
    
    // Check if we should process based on run frequency setting
    // change the default to manual later but this allows us to auto process for every user to provide value
    // after 17th April 2025 it should be manual
    const getDefaultRunFrequency = () => {
      const now = new Date()
      const targetDate = new Date("2025-04-17")
      return now < targetDate ? "per-domain" : "manual"
    }
    const runFrequency = settings?.options?.minkRunFrequency || getDefaultRunFrequency()
    
    // Helper function to check if a domain has been processed
    const isDomainProcessed = (domain: string) => {
      return journeyEntries.some(entry => {
        try {
          const entryDomain = new URL(entry.url).hostname
          return entryDomain === currentDomain
        } catch (e) {
          return false
        }
      })
    }
    
    const currentDomain = new URL(window.location.href).hostname
    
    if (runFrequency === "per-domain") {
      // Only run if we haven't processed this domain yet
      const lastProcessedDomain = lastUrlRef.current ? new URL(lastUrlRef.current).hostname : ""
      if (currentDomain === lastProcessedDomain) return
      
      // Check if we already have an entry for this URL
      const urlAlreadyProcessed = journeyEntries.some(entry => entry.url === window.location.href)
      if (urlAlreadyProcessed) {
        console.log("URL already has an entry, skipping processing - 2")
        return
      }
      
      // Only show dialog if we don't have results for this domain yet
      console.log("Processing domain:", currentDomain)
      if (!isDomainProcessed(currentDomain)) {
        console.log("Showing dialog for new domain:", currentDomain)
        setIsDialogVisible(true)
      }
    } else if (runFrequency === "per-link") {
      // Only run if we haven't processed this exact URL yet
      if (window.location.href === lastUrlRef.current) return
      
      // Check if we already have an entry for this URL
      const urlAlreadyProcessed = journeyEntries.some(entry => entry.url === window.location.href)
      if (urlAlreadyProcessed) {
        console.log("URL already has an entry, skipping processing - 3")
        return
      }
      
      // Show the dialog when processing a new link
      setIsDialogVisible(true)
    } else {
      // For "always" setting, we process every time and show the dialog
      setIsDialogVisible(true)
    }
    
    // Mark this URL as being processed
    processingUrlRef.current = window.location.href
    
    setIsProcessing(true)
    lastUrlRef.current = window.location.href

    // Get page content
    const pageContent = document.body.innerText
    const pageTitle = document.title

    // Create initial entry
    const newEntry: JourneyEntry = {
      title: pageTitle || "Untitled Page",
      url: window.location.href,
      content: "Processing page content...",
      highlights: ["Analyzing content...", "Generating insights..."],
      badges: ["Processing"],
      timestamp: Date.now(),
      summary: {
        keyPoints: [],
        pros: [],
        cons: [],
        statistics: [],
        connections: {
          previousPages: [],
          nextPages: [],
          relatedTopics: []
        }
      },
      relevanceScore: 0,
      context: {
        relationToDirection: "Analyzing relevance to your direction...",
        previousPageConnections: [],
        journeyContext: {
          position: 0,
          totalPages: 0,
          theme: "",
          progress: {
            percentage: 0,
            description: ""
          }
        },
        insights: {
          patterns: [],
          learnings: [],
          recommendations: []
        }
      }
    }

    // Add initial entry
    setJourneyEntries(prev => [newEntry, ...prev])

    try {
      // First, check if we already have a processed entry for this URL
      const existingEntry = await sendToBackground({
        name: "get-journey-entry",
        body: {
          url: window.location.href
        }
      }).catch(() => null);

      // If we have a processed entry and it's not an error, use it
      if (existingEntry && !existingEntry.error) {
        setJourneyEntries(prev => {
          const updated = [...prev]
          if (updated[0]?.url === window.location.href) {
            updated[0] = existingEntry
          }
          return updated
        })
      } else {
        // Process page with AI
        const response = await sendToBackground({
          name: "process-page-content",
          body: {
            content: pageContent,
            direction,
            url: window.location.href,
            title: pageTitle,
            previousEntries: journeyEntries.slice(0, 5), // Send last 5 entries for context
            journeyContext: {
              position: journeyEntries.length + 1,
              totalPages: journeyEntries.length + 10, // Estimate total pages
              theme: direction,
              progress: {
                percentage: Math.round((journeyEntries.length / (journeyEntries.length + 10)) * 100),
                description: journeyEntries.length === 0 
                  ? "Just starting your journey" 
                  : `Making progress on ${direction}`
              }
            }
          }
        })

        // Update entry with initial response
        setJourneyEntries(prev => {
          const updated = [...prev]
          if (updated[0]?.url === window.location.href) {
            updated[0] = response
          }
          return updated
        })

        // Poll for updates if the entry is still processing
        if (response.badges && Array.isArray(response.badges) && response.badges.includes("Processing")) {
          const pollInterval = setInterval(async () => {
            try {
              const updatedEntry = await sendToBackground({
                name: "get-journey-entry",
                body: {
                  url: window.location.href
                }
              }).catch(() => null);

              if (updatedEntry && !updatedEntry.error && 
                  (!updatedEntry.badges || !Array.isArray(updatedEntry.badges) || !updatedEntry.badges.includes("Processing"))) {
                // Update entry with processed content
                setJourneyEntries(prev => {
                  const updated = [...prev]
                  if (updated[0]?.url === window.location.href) {
                    updated[0] = updatedEntry
                  }
                  return updated
                })
                clearInterval(pollInterval)
              }
            } catch (error) {
              console.error("Error polling for updates:", error)
              clearInterval(pollInterval)
            }
          }, 2000) // Poll every 2 seconds

          // Clear interval after 30 seconds as a safety measure
          setTimeout(() => clearInterval(pollInterval), 30000)
        }
      }
    } catch (error) {
      console.error("Error processing page:", error)
      // Update with error state if AI processing fails
      setJourneyEntries(prev => {
        const updated = [...prev]
        if (updated[0]?.url === window.location.href) {
          updated[0] = {
            ...updated[0],
            title: updated[0].title || document.title || "Error Page",
            content: "Could not process page content. Please try again.",
            highlights: ["Error processing content"],
            badges: ["Error"],
            summary: {
              keyPoints: [],
              pros: [],
              cons: [],
              statistics: [],
              connections: {
                previousPages: [],
                nextPages: [],
                relatedTopics: []
              }
            },
            relevanceScore: 0,
            context: {
              relationToDirection: "Could not analyze relevance",
              previousPageConnections: [],
              journeyContext: {
                position: 0,
                totalPages: 0,
                theme: "",
                progress: {
                  percentage: 0,
                  description: ""
                }
              },
              insights: {
                patterns: [],
                learnings: [],
                recommendations: []
              }
            }
          }
        }
        return updated
      })
    } finally {
      // Clear the processing URL reference
      processingUrlRef.current = ""
      setIsProcessing(false)
    }
  }

  // Track URL changes
  useEffect(() => {
    // Create a function to check if a domain has been processed
    const isDomainProcessed = (domain: string) => {
      return journeyEntries.some(entry => {
        try {
          const entryDomain = new URL(entry.url).hostname
          return entryDomain === domain
        } catch (e) {
          return false
        }
      })
    }
    
    const observer = new MutationObserver((mutations) => {
      // Skip if we're already processing this URL
      if (processingUrlRef.current === window.location.href) {
        return
      }
      
      if (window.location.href !== lastUrlRef.current) {
        const runFrequency = settings?.options?.minkRunFrequency || "manual"
        
        // Skip automatic processing if run frequency is set to manual
        if (runFrequency === "manual") {
          // Just update the lastUrlRef but don't process
          lastUrlRef.current = window.location.href
          setIsDialogVisible(false)
          return
        }
        
        // Check if we already have an entry for this URL
        const urlAlreadyProcessed = journeyEntries.some(entry => entry.url === window.location.href)
        
        if (runFrequency === "per-domain") {
          // Only process if domain changed
          const currentDomain = new URL(window.location.href).hostname
          const lastDomain = lastUrlRef.current ? new URL(lastUrlRef.current).hostname : ""
          if (currentDomain !== lastDomain && !urlAlreadyProcessed) {
            // Only show dialog when processing a new domain if we don't have results for it yet
            if (!isDomainProcessed(currentDomain)) {
              setIsDialogVisible(true)
            }
            
            if (direction && !isProcessing) {
              processCurrentPage()
            }
          }
        } else if (runFrequency === "per-link") {
          // Only process if we haven't processed this URL yet
          if (!urlAlreadyProcessed) {
            setIsDialogVisible(true)
          }
          if (direction && !isProcessing) {
            processCurrentPage()
          }
        } else if (runFrequency === "always") {
          // Always process, even if we've seen this URL before
          setIsDialogVisible(true)
          if (direction && !isProcessing) {
            processCurrentPage()
          } 
        }
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => observer.disconnect()
  }, [direction, settings?.options?.minkRunFrequency, isDialogVisible, journeyEntries, isProcessing])

  // Process initial page
  useEffect(() => {
    if (direction) {
      // Skip if we're already processing this URL
      if (processingUrlRef.current === window.location.href) {
        return
      }
      
      // Check if we already have an entry for this URL
      const urlAlreadyProcessed = journeyEntries.some(entry => entry.url === window.location.href)

      
      // Reset lastUrlRef to ensure first page is processed
      lastUrlRef.current = ""
      
      // Check if we should show the dialog based on run frequency setting
      const runFrequency = settings?.options?.minkRunFrequency || "per-domain"
      
      // Skip automatic processing if run frequency is set to manual
      if (runFrequency === "manual") {
        // Just show the dialog but don't process automatically
        setIsDialogVisible(false)
        return
      }
      
      if (runFrequency === "per-domain") {
        // Check if we already have results for this domain
        try {
          const currentDomain = new URL(window.location.href).hostname
          const domainAlreadyProcessed = journeyEntries.some(entry => {
            try {
              const entryDomain = new URL(entry.url).hostname
              console.log("Match:",  entryDomain === currentDomain, "Entry domain:", entryDomain, "Current domain:", currentDomain)
              return entryDomain === currentDomain
            } catch (e) {
              return false
            }
          })
          
          // Only show dialog if we don't have results for this domain yet
          if (!domainAlreadyProcessed) {
            setIsDialogVisible(true)
          } else {
            console.log("Already processed this domain, skipping dialog")
            setIsDialogVisible(false)
          }
        } catch (e) {
          // If there's an error parsing the URL, show the dialog anyway
          setIsDialogVisible(true)
        }
      } else {
        // For "per-link" or "always" settings, show the dialog
        setIsDialogVisible(true)
      }
      
      // Process the current page regardless of dialog visibility
      if (!urlAlreadyProcessed) {
        processCurrentPage()
      }
    }
  // Intentionally not including journeyEntries in the dependency array to avoid infinite loops
  }, [direction, settings?.options?.minkRunFrequency])

  useEffect(() => {
    console.log('Mink Page App initialized')
  }, [])

  // Refresh usage stats and journey map periodically
  useEffect(() => {
    getUsageStats();
    getJourneyMap();
    
    // Refresh data every minute
    const intervalId = setInterval(() => {
      getUsageStats();
      getJourneyMap();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  // Update journey map after processing a page
  useEffect(() => {
    if (!isProcessing && journeyEntries.length > 0) {
      getJourneyMap();
    }
  }, [isProcessing, journeyEntries.length]);

  // Handle run frequency changes
  useEffect(() => {
    // When run frequency changes, check if we need to process the current page
    const runFrequency = settings?.options?.minkRunFrequency
    
    if (!direction || isProcessing) return
    
    // Skip if we're already processing this URL
    if (processingUrlRef.current === window.location.href) {
      return
    }
    
    // Skip automatic processing if run frequency is set to manual
    if (runFrequency === "manual") {
      // Just show the dialog but don't process automatically
      setIsDialogVisible(false)
      return
    }
    
    // For "always" setting, we always process regardless of previous entries
    if (runFrequency === "always") {
      setIsDialogVisible(true)
      processCurrentPage()
    } else if (runFrequency === "per-domain") {
      // For "per-domain" setting, check if we already have results for this domain
      try {
        // Check if we already have an entry for this URL
        const urlAlreadyProcessed = journeyEntries.some(entry => entry.url === window.location.href)
        if (urlAlreadyProcessed) {
          console.log("URL already has an entry, skipping processing on frequency change - 1")
          setIsDialogVisible(false)
          return
        }
        
        const currentDomain = new URL(window.location.href).hostname
        const domainAlreadyProcessed = journeyEntries.some(entry => {
          try {
            const entryDomain = new URL(entry.url).hostname
            return entryDomain === currentDomain
          } catch (e) {
            return false
          }
        })
        
        // Only show dialog if we don't have results for this domain yet
        if (!domainAlreadyProcessed) {
          setIsDialogVisible(true)
          processCurrentPage()
        }
      } catch (e) {
        // If there's an error parsing the URL, don't process
        console.error("Error checking domain:", e)
      }
    }
  // Intentionally not including journeyEntries in the dependency array to avoid infinite loops
  }, [settings?.options?.minkRunFrequency, direction, isProcessing])

  // Initialize minkRunFrequency setting if it doesn't exist
  useEffect(() => {
    if (settings && !settings.options?.minkRunFrequency) {
      console.log('Setting default minkRunFrequency to per-domain')
      const updatedSettings = {
        ...(settings.options || {}),
        minkRunFrequency: "per-domain" // Default setting
      };
      updateSettings(updatedSettings);
    }
  }, [settings]);

  const handleUpgradeClick = async () => {
    if (!user) return
    
    try {
      // Initiate checkout checker to periodically check if the user has upgraded
      await sendToBackground({
        name: "initiate-checkout-checker",
        body: user,
      })
      
      // Use the same subscription link as in TopHeader.tsx
      const subscriptionLink = isProduction
        ? "https://buy.stripe.com/9AQg1neqrglEe76aEL"
        : "https://buy.stripe.com/test_4gweVb5HIe7TaAg5kk"
      
      analyticsTrack(SegmentAnalyticsEvents.USER_CLICKED_UPGRADE_TO_PRO, {
        userEmail: user?.email,
        direction: direction,
        expiryTime: directionExpiry,
        runFrequency: settings?.options?.minkRunFrequency,
        subscriptionLink: subscriptionLink
      })
      // Open the upgrade page with user reference ID and email
      window.open(`${subscriptionLink}?client_reference_id=${user?.id}&prefilled_email=${user?.email}`, '_blank')
    } catch (error) {
      console.error("Error initiating checkout:", error)
    }
  }

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

  const renderJourneyEntry = (entry: JourneyEntry) => (
    <div key={entry.timestamp} className="mink-journey-card">
      <div className="mink-journey-title">
        {entry.title}
        {entry.context.journeyContext && entry.context.journeyContext.position > 0 && (
          <span className="mink-journey-progress">
            Page {entry.context.journeyContext.position}/{entry.context.journeyContext.totalPages}
          </span>
        )}
      </div>
      <div className="mink-journey-content">
        <div className="mink-relevance-score">
          <div 
            className="mink-score-bar" 
            style={{ width: `${entry.relevanceScore * 100}%` }}
          />
        </div>
        
        <div className="mink-context">
          {entry.context.relationToDirection}
        </div>

        <div className="mink-badges">
          {Array.isArray(entry.badges) ? entry.badges.map((badge, i) => (
            <span key={i} className="mink-badge">{badge}</span>
          )) : null}
        </div>

        {Array.isArray(entry.badges) && entry.badges.includes("Limit Reached") && (
          <div className="mink-upgrade-section">
            <p>You've reached your daily limit of {usageStats?.journey_stats?.journeys_allowed || 10} journeys.</p>
            <div className="mink-progress-bar mink-limit-progress">
              <div className="mink-progress-fill" style={{ width: '100%' }}></div>
            </div>
            <div className="mink-reset-info mink-limit-reset-info">
              {resetTimeText}
            </div>
            <button 
              className="mink-upgrade-button"
              onClick={handleUpgradeClick}
              style={{
                backgroundColor: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '10px',
                display: 'inline-block'
              }}
            >
              Upgrade to Pro
            </button>
          </div>
        )}

        {/* Journey Context Section */}
        {entry.context.journeyContext && entry.context.journeyContext.position > 0 && (
          <div className="mink-journey-context">
            <div className="mink-journey-progress-bar">
              <div 
                className="mink-journey-progress-fill" 
                style={{ width: `${entry.context.journeyContext.progress.percentage}%` }}
              />
            </div>
            <div className="mink-journey-theme">
              <strong>Theme:</strong> {entry.context.journeyContext.theme}
              <div>{entry.context.journeyContext.progress.description}</div>
            </div>
          </div>
        )}

        {/* Insights Section */}
        {entry.context.insights && 
          Array.isArray(entry.context.insights.patterns) && 
          Array.isArray(entry.context.insights.learnings) && 
          Array.isArray(entry.context.insights.recommendations) && (
          entry.context.insights.patterns.length > 0 || 
          entry.context.insights.learnings.length > 0 || 
          entry.context.insights.recommendations.length > 0
        ) && (
          <div className="mink-entry-insights">
            {Array.isArray(entry.context.insights.patterns) && entry.context.insights.patterns.length > 0 && (
              <div className="mink-insight-section">
                <h4>Patterns</h4>
                <ul>
                  {entry.context.insights.patterns.map((pattern, i) => (
                    <li key={i}>{pattern}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {Array.isArray(entry.context.insights.learnings) && entry.context.insights.learnings.length > 0 && (
              <div className="mink-insight-section">
                <h4>Key Learnings</h4>
                <ul>
                  {entry.context.insights.learnings.map((learning, i) => (
                    <li key={i}>{learning}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {Array.isArray(entry.context.insights.recommendations) && entry.context.insights.recommendations.length > 0 && (
              <div className="mink-insight-section">
                <h4>Recommendations</h4>
                <ul>
                  {entry.context.insights.recommendations.map((recommendation, i) => (
                    <li key={i}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Connections Section */}
        {entry.summary.connections && 
          Array.isArray(entry.summary.connections.previousPages) && 
          Array.isArray(entry.summary.connections.relatedTopics) && (
          (entry.summary.connections.previousPages.length > 0 || 
           entry.summary.connections.relatedTopics.length > 0)
        ) && (
          <div className="mink-entry-connections">
            {Array.isArray(entry.summary.connections.previousPages) && entry.summary.connections.previousPages.length > 0 && (
              <div className="mink-connection-section">
                <h4>Connected to Previous Pages</h4>
                <ul>
                  {entry.summary.connections.previousPages.map((page, i) => (
                    <li key={i}>{page}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {Array.isArray(entry.summary.connections.relatedTopics) && entry.summary.connections.relatedTopics.length > 0 && (
              <div className="mink-connection-section">
                <h4>Related Topics</h4>
                <div className="mink-related-topics">
                  {entry.summary.connections.relatedTopics.map((topic, i) => (
                    <span key={i} className="mink-topic-tag">{topic}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {entry.summary.keyPoints && Array.isArray(entry.summary.keyPoints) && entry.summary.keyPoints.length > 0 && (
          <div className="mink-summary-section">
            <h4>Key Points</h4>
            <ul>
              {entry.summary.keyPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {(entry.summary.pros && Array.isArray(entry.summary.pros) && entry.summary.pros.length > 0 || 
          entry.summary.cons && Array.isArray(entry.summary.cons) && entry.summary.cons.length > 0) && (
          <div className="mink-summary-section">
            <div className="mink-pros-cons">
              {entry.summary.pros && Array.isArray(entry.summary.pros) && entry.summary.pros.length > 0 && (
                <div className="mink-pros">
                  <h4>Pros</h4>
                  <ul>
                    {entry.summary.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
              )}
              {entry.summary.cons && Array.isArray(entry.summary.cons) && entry.summary.cons.length > 0 && (
                <div className="mink-cons">
                  <h4>Cons</h4>
                  <ul>
                    {entry.summary.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {entry.summary.statistics && Array.isArray(entry.summary.statistics) && entry.summary.statistics.length > 0 && (
          <div className="mink-summary-section">
            <h4>Key Statistics</h4>
            <ul className="mink-statistics">
              {entry.summary.statistics.map((stat, i) => (
                <li key={i}>{stat}</li>
              ))}
            </ul>
          </div>
        )}

        {entry.summary.steps && Array.isArray(entry.summary.steps) && entry.summary.steps.length > 0 && (
          <div className="mink-summary-section">
            <h4>Step-by-Step Guide</h4>
            <ol className="mink-steps">
              {entry.summary.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="mink-highlights">
          {Array.isArray(entry.highlights) ? entry.highlights.map((highlight, i) => (
            <span key={i} className="mink-highlight">{highlight}</span>
          )) : null}
        </div>

      </div>
    </div>
  )

  const renderJourneyHeader = () => (
    <div className="mink-journey-card">
      <div className="mink-journey-title">
        Current Direction
        <button 
          className="mink-edit-button" 
          onClick={handleEditDirection}
          title="Edit direction"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <div className="mink-journey-content">
        {direction}
        {directionExpiry && (
          <div className="mink-direction-expiry">
            Expires: {new Date(directionExpiry).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )

  // Calculate time until midnight reset
  const getTimeUntilMidnight = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const hoursUntilMidnight = Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60))
    const minutesUntilMidnight = Math.floor(((tomorrow.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hoursUntilMidnight > 0) {
      return `Resets in ${hoursUntilMidnight}h ${minutesUntilMidnight}m`
    } else {
      return `Resets in ${minutesUntilMidnight}m`
    }
  }

  const [resetTimeText, setResetTimeText] = useState(getTimeUntilMidnight())

  // Update reset time text every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setResetTimeText(getTimeUntilMidnight())
    }, 60000) // Update every minute
    
    return () => clearInterval(intervalId)
  }, [])

  // Make FAB button draggable
  useEffect(() => {
    if (fabRef.current) {
      draggableElement(
        fabRef.current as unknown as HTMLDivElement, 
        document,
        () => setIsDragging(true),
        () => setIsDragging(false)
      )
    }
  }, [fabRef.current])

  // Make dialog panel fixed (not draggable)
  useEffect(() => {
    if (dialogRef.current && dialogHeaderRef.current) {
      // Remove draggability from dialog header
      const header = dialogHeaderRef.current;
      header.style.cursor = 'default';
      
      // Remove the drag handle's cursor style
      const dragHandle = header.querySelector('.mink-drag-handle');
      if (dragHandle) {
        (dragHandle as HTMLElement).style.cursor = 'default';
      }
    }
  }, [dialogRef.current, dialogHeaderRef.current]);

  // Directly manipulate the shadow root container's pointer-events style
  useEffect(() => {
    const shadowContainer = document.getElementById('plasmo-shadow-container');
    if (shadowContainer) {
      if (isDialogVisible) {
        // When dialog is visible, allow pointer events only on specific elements
        shadowContainer.style.pointerEvents = 'none';
        shadowContainer.style.width = '100%';
        shadowContainer.style.height = '100%';
        shadowContainer.style.visibility = 'visible';
      } else {
        // When dialog is hidden, ensure shadow root doesn't block any interactions
        shadowContainer.style.pointerEvents = 'none';
        // Set width and height to 0 to ensure it doesn't block any interactions
        shadowContainer.style.width = '0';
        shadowContainer.style.height = '0';
        shadowContainer.style.visibility = 'hidden';
      }
    }
  }, [isDialogVisible]);

  const renderJourneyMap = () => {
    if (journeyMap.length === 0) {
      return (
        <div className="mink-journey-map">
          <div className="mink-journey-map-title">Today's Journey Progress</div>
          <div className="mink-journey-map-empty">
            No journeys recorded today. Start exploring to build your journey map!
          </div>
        </div>
      );
    }

    // Find the current direction's journey data
    const currentDirectionData = journeyMap.find(item => item.direction === direction);
    
    if (!currentDirectionData) {
      return (
        <div className="mink-journey-map">
          <div className="mink-journey-map-title">Today's Journey Progress</div>
          <div className="mink-journey-map-subtitle">
            You've explored {journeyMap.reduce((sum, item) => sum + item.jobCount, 0)} pages across {journeyMap.length} different directions today.
          </div>
          <div className="mink-journey-map-stats">
            <div className="mink-journey-map-stat">
              <div className="mink-journey-map-stat-value">{journeyMap.length}</div>
              <div className="mink-journey-map-stat-label">Directions</div>
            </div>
            <div className="mink-journey-map-stat">
              <div className="mink-journey-map-stat-value">
                {journeyMap.reduce((sum, item) => sum + item.jobCount, 0)}
              </div>
              <div className="mink-journey-map-stat-label">Pages</div>
            </div>
            <div className="mink-journey-map-stat">
              <div className="mink-journey-map-stat-value">
                {journeyMap.reduce((sum, item) => sum + item.uniqueDomains, 0)}
              </div>
              <div className="mink-journey-map-stat-label">Domains</div>
            </div>
          </div>
        </div>
      );
    }

    // Calculate progress percentage based on completed jobs
    const progressPercentage = Math.round((currentDirectionData.completedJobCount / currentDirectionData.jobCount) * 100);
    
    // Generate insights based on the data
    const generateInsight = () => {
      if (currentDirectionData.jobCount < 3) {
        return "Just getting started! Keep exploring to build a more comprehensive journey.";
      } else if (currentDirectionData.avgRelevanceScore > 0.7) {
        return "Great progress! You're finding highly relevant content for your direction.";
      } else if (currentDirectionData.uniqueDomains > 3) {
        return "You're exploring diverse sources, which helps build a well-rounded understanding.";
      } else {
        return "Continue your journey to discover more connections and insights.";
      }
    };

    return (
      <div className="mink-journey-map">
        <div className="mink-journey-map-title">
          Today's Journey Progress
        </div>
        <div className="mink-journey-map-subtitle">
          Your progress on "{currentDirectionData.direction}"
        </div>
        
        <div className="mink-journey-map-stats">
          <div className="mink-journey-map-stat">
            <div className="mink-journey-map-stat-value">{currentDirectionData.jobCount}</div>
            <div className="mink-journey-map-stat-label">Pages</div>
          </div>
          <div className="mink-journey-map-stat">
            <div className="mink-journey-map-stat-value">{currentDirectionData.uniqueDomains}</div>
            <div className="mink-journey-map-stat-label">Domains</div>
          </div>
          <div className="mink-journey-map-stat">
            <div className="mink-journey-map-stat-value">
              {Math.round(currentDirectionData.avgRelevanceScore * 100)}%
            </div>
            <div className="mink-journey-map-stat-label">Relevance</div>
          </div>
        </div>
        
        <div className="mink-journey-map-progress">
          <div className="mink-journey-map-progress-label">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="mink-journey-map-progress-bar">
            <div 
              className="mink-journey-map-progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        {currentDirectionData.uniqueDomains > 0 && (
          <>
            <div className="mink-journey-map-subtitle">Domains explored:</div>
            <div className="mink-journey-map-domains">
              {Array.from(new Set(currentDirectionData.entries.map((entry: JourneyEntry) => {
                try {
                  return new URL(entry.url).hostname;
                } catch (e) {
                  return "";
                }
              }))).filter(Boolean).map((domain: string, index: number) => (
                <div key={index} className="mink-journey-map-domain">{domain}</div>
              ))}
            </div>
          </>
        )}
        
        <div className="mink-journey-map-insights">
          {generateInsight()}
        </div>
      </div>
    );
  };

  return (
    <div id="plasmo-root" className={isDialogVisible ? 'mink-active' : 'mink-inactive'}>
      <button 
        onClick={handleClick}
        className={`mink-fab ${isProcessing ? 'processing' : ''} ${settings?.options?.minkRunFrequency === 'manual' ? 'manual-mode' : ''} ${isDragging ? 'dragging' : ''}`}
        ref={fabRef}
        aria-label="Mink Assistant"
      >
        <img src={minkIcon} alt="Mink" draggable="false" />
      </button>

      <div className={`mink-dialog ${isDialogVisible ? 'visible' : 'hidden'}`} ref={dialogRef}>
        <div className="mink-dialog-header" ref={dialogHeaderRef}>
          <div className="mink-drag-handle"></div>
          <h2 className="mink-dialog-title">
            {direction ? 'Your Journey' : 'Set Your Direction'}
          </h2>
          <div className="mink-dialog-controls">
            {user && (
              <div className="mink-user-info">
                <span className="mink-user-email">{user.email}</span>
                <span className="mink-user-plan">{user.planTier || 'Free'}</span>
                {usageStats && (
                  <div className="mink-usage-stats">
                    <div className="mink-stat-row">
                      <span className="mink-stat">
                        Journeys: {usageStats.journey_stats?.journeys_used || 0}/{usageStats.journey_stats?.journeys_allowed || 10}
                        <span className="mink-stat-separator">•</span>
                        Remaining: {usageStats.journey_stats?.journeys_remaining || 0}
                      </span>
                    </div>
                    <div className="mink-progress-bar">
                      <div 
                        className="mink-progress-fill" 
                        style={{ 
                          width: `${Math.min(100, (usageStats.journey_stats?.journeys_used / usageStats.journey_stats?.journeys_allowed) * 100 || 0)}%` 
                        }}
                      ></div>
                    </div>
                    <div>
                    {(!user.planTier || user.planTier === 'free') && (
                        <button 
                          className="mink-upgrade-button mink-small-upgrade-button"
                          onClick={handleUpgradeClick}
                          style={{
                            backgroundColor: '#22c55e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginLeft: '8px',
                            display: 'inline-block'
                          }}
                        >
                          Upgrade
                        </button>
                      )}
                    </div>
                    <div className="mink-reset-info">
                      {resetTimeText}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="mink-run-frequency-container">
              <select 
                className="mink-run-frequency"
                onChange={(e) => {
                  if (!isProcessing) {
                    // Fix the order of properties to ensure minkRunFrequency isn't overwritten
                    const updatedSettings = {
                      ...(settings?.options || {}),
                      minkRunFrequency: e.target.value
                    };
                    updateSettings(updatedSettings);
                  } else {
                    // If currently processing, wait until finished
                    const newValue = e.target.value;
                    const checkProcessing = setInterval(() => {
                      if (!isProcessing) {
                        clearInterval(checkProcessing);
                        const updatedSettings = {
                          ...(settings?.options || {}),
                          minkRunFrequency: newValue
                        };
                        updateSettings(updatedSettings);
                      }
                    }, 500);
                    // Clear interval after 10 seconds as a safety measure
                    setTimeout(() => clearInterval(checkProcessing), 10000);
                  }
                }}
                value={settings?.options?.minkRunFrequency || "per-domain"}
                disabled={isProcessing}
              >
                <option value="per-domain">Run once per domain</option>
                <option value="per-link">Run once per link</option>
                <option value="always">Run every time</option>
                <option value="manual">Run manually</option>
              </select>
            </div>
          </div>
        </div>
        <div className={`mink-dialog-content ${isDialogVisible ? 'visible' : 'hidden'}`}>
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
              {renderJourneyHeader()}
              {journeyEntries.map(entry => renderJourneyEntry(entry))}
              {renderJourneyMap()}
            </>
          )}
          <div className="mink-support-text">
            Need help? Reach out to us at support@viroke.com
          </div>
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