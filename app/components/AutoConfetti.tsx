import { useEffect, useState } from "react"
import ConfettiLibrary from "react-dom-confetti"

export const AutoConfetti = (
  props: Omit<React.ComponentPropsWithoutRef<typeof ConfettiLibrary>, "active">
) => {
  const [showConfetti, setShowConfetti] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    const t = setTimeout(() => {
      setShowConfetti(true)
    }, 100)

    return () => {
      clearTimeout(t)
    }
  }, [])

  if (!mounted) return null

  return <ConfettiLibrary active={showConfetti} {...props} />
}
