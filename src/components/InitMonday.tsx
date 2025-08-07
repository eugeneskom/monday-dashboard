'use client'

import { useEffect } from 'react'
import monday from '@/lib/mondayClient'

export default function InitMonday() {
  useEffect(() => {
    console.log('InitMonday component mounted')
    console.log('Monday SDK instance:', monday)
    console.log('Is in iframe:', window.self !== window.top)
    console.log('Current location:', window.location.href)
    
    // Test if monday SDK is available
    if (monday && typeof monday.listen === 'function') {
      console.log('Monday SDK listen method is available')
      
      monday.listen('context', (res) => {
        console.log('Monday context received:', res)
        // You can use this to know which board/workspace you're in
      });
      
      // Also listen for other events to see if anything is working
      monday.listen('settings', (res) => {
        console.log('Monday settings:', res)
      });
      
      monday.listen('location', (res) => {
        console.log('Monday location:', res)
      });
      
    } else {
      console.error('Monday SDK not properly initialized or listen method not available')
    }
    
    // Check if we're in Monday.com environment
    if (window.self === window.top) {
      console.warn('App is running standalone, not in Monday.com iframe - context events will not fire')
    }
    
  }, [])

  return null // no visible UI, just SDK init
}
