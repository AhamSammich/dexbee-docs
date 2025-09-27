import { useEffect, useState } from 'react'

export function useScrollPosition(elementRef?: React.RefObject<HTMLElement>) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const isAtTop = scrollPosition === 0
  const isAtBottom
    = elementRef?.current
      && scrollPosition
      === elementRef.current.scrollHeight - elementRef.current.clientHeight

  const isBelow = (element: HTMLElement) => {
    return scrollPosition > element.scrollHeight - element.clientHeight
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(elementRef?.current?.scrollTop ?? window.scrollY)
    }
    const element = elementRef?.current || window
    element.addEventListener('scroll', handleScroll)
    return () => element.removeEventListener('scroll', handleScroll)
  }, [elementRef])

  return { scrollPosition, isAtTop, isAtBottom, isBelow }
}
