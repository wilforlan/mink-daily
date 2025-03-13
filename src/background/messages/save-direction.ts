import type { PlasmoMessaging } from "@plasmohq/messaging"
import { scope as sentryScope } from '@/src/lib/sentry'
import localStorageService from '../services/local-storage.service'

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { direction, expiryTime } = req.body
    
    // Save direction and expiry time
    await localStorageService.put('mink_direction', direction)
    await localStorageService.put('mink_direction_expiry', expiryTime)
    
    console.log('Direction saved:', direction)
    console.log('Direction expires at:', new Date(expiryTime).toLocaleString())
    
    res.send({ status: true })
  } catch (error) {
    sentryScope.captureException(error)
    console.error('Error saving direction:', error)
    res.send({ status: false, error: error.message || error })
  }
}

export default handler 