'use client'

import { useState } from 'react'

export default function MessageBar() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="message">
      <span className="messageContent">We are closed for a winter break from 1 - 24 July</span>
      <button 
        className="messageClose" 
        onClick={() => setIsVisible(false)}
        aria-label="Close message"
      />
    </div>
  )
}
