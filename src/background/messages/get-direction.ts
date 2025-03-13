import type { PlasmoMessaging } from "@plasmohq/messaging"
import { scope as sentryScope } from '@/src/lib/sentry'
import localStorageService from '../services/local-storage.service'

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    // Get saved direction and expiry time
    const savedDirection = await localStorageService.get('mink_direction')
    const savedExpiryTime = await localStorageService.get('mink_direction_expiry')
    
    console.log('Retrieved direction:', savedDirection)
    console.log('Retrieved expiry time:', savedExpiryTime)
    
    if (savedDirection && savedExpiryTime) {
      const now = Date.now()
      
      // Check if the direction is still valid (not expired)
      if (savedExpiryTime > now) {
        console.log('Direction is valid, expires at:', new Date(savedExpiryTime).toLocaleString())
        res.send({ 
          status: true, 
          direction: savedDirection, 
          expiryTime: savedExpiryTime 
        })
      } else {
        console.log('Direction expired, clearing')
        // Clear expired direction
        await localStorageService.delete('mink_direction')
        await localStorageService.delete('mink_direction_expiry')
        res.send({ status: true, direction: null, expiryTime: null })
      }
    } else {
      // No saved direction
      res.send({ status: true, direction: null, expiryTime: null })
    }
  } catch (error) {
    sentryScope.captureException(error)
    console.error('Error retrieving direction:', error)
    res.send({ status: false, error: error.message || error })
  }
}

export default handler 