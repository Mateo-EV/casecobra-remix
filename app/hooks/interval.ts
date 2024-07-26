import { useEffect, useRef, useState } from "react"

export const useInterval = (delay: number) => {
  const [id, setId] = useState(0)
  const intervalId = useRef<ReturnType<typeof setInterval>>()

  const clearActualInterval = () => {
    clearInterval(intervalId.current)
  }

  useEffect(() => {
    intervalId.current = setInterval(() => {
      setId(prevId => prevId + 1)
    }, delay)

    return () => {
      clearInterval(intervalId.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [id, clearActualInterval] as const
}
