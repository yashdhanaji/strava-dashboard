import { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X } from "lucide-react"

// Detect if user is on Mac
const useIsMac = () => {
  return useMemo(() => {
    if (typeof navigator === "undefined") return false
    return /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent)
  }, [])
}

export function SearchBar({ onSearch, placeholder = "Search activities..." }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)
  const isMac = useIsMac()

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsExpanded(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false)
        setQuery("")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isExpanded])

  const handleExpand = () => {
    setIsExpanded(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleCollapse = () => {
    if (!query) {
      setIsExpanded(false)
    }
  }

  const handleClear = () => {
    setQuery("")
    inputRef.current?.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch && query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <motion.div
      initial={false}
      animate={{
        width: isExpanded ? 320 : 140,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
      className="relative"
    >
      <form onSubmit={handleSubmit}>
        <motion.div
          className={`
            flex items-center h-11 rounded-xl overflow-hidden
            transition-colors duration-200
            ${isExpanded
              ? "bg-white/80 backdrop-blur-xl border border-black/5 shadow-lg shadow-black/5"
              : "bg-[#F5F5F5] hover:bg-[#EBEBEB] cursor-pointer"
            }
          `}
          onClick={!isExpanded ? handleExpand : undefined}
        >
          {/* Search Icon */}
          <motion.div
            className="flex items-center justify-center w-11 h-11 shrink-0"
            whileTap={{ scale: 0.95 }}
          >
            <Search className={`w-[18px] h-[18px] ${isExpanded ? "text-black" : "text-[#666666]"}`} />
          </motion.div>

          {/* Collapsed state - show hint text */}
          {!isExpanded && (
            <div className="flex items-center justify-between flex-1 pr-3">
              <span className="text-[13px] text-[#999999]">Search...</span>
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-black/5 text-[#888888]">
                <span className="text-[11px] font-medium">{isMac ? "⌘" : "Ctrl"}</span>
                <span className="text-[11px] font-medium">K</span>
              </div>
            </div>
          )}

          {/* Input Field */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "100%" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex items-center"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setIsFocused(false)
                    handleCollapse()
                  }}
                  placeholder={placeholder}
                  className="w-full h-full bg-transparent text-[13px] font-medium text-black
                    placeholder:text-[#999999] outline-none pr-2"
                />

                {/* Clear button or ESC hint */}
                <div className="flex items-center gap-1 pr-3">
                  {query ? (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleClear}
                      className="p-1 rounded-md hover:bg-black/5 text-[#666666]"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center px-2 py-1 rounded-md bg-black/5 text-[#888888]"
                    >
                      <span className="text-[11px] font-medium">ESC</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </form>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isExpanded && isFocused && query && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl
              bg-white/90 backdrop-blur-xl border border-black/5
              shadow-xl shadow-black/10 z-50"
          >
            <div className="text-[12px] text-[#888888] px-3 py-2">
              Press <span className="font-medium text-black">Enter</span> to search for "{query}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
