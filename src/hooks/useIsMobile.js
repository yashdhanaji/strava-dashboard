import { useState, useEffect } from 'react'

/**
 * Hook to detect if the current viewport is mobile (below md breakpoint: 768px)
 * @returns {boolean} true if viewport width is less than 768px
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width: 767px)').matches
    }
    return false
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')

    const handleChange = (event) => {
      setIsMobile(event.matches)
    }

    // Add listener for changes
    mediaQuery.addEventListener('change', handleChange)

    // Set initial value
    setIsMobile(mediaQuery.matches)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return isMobile
}

export default useIsMobile
