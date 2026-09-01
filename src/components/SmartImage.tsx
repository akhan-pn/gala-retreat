'use client'

import Image, { type ImageProps } from 'next/image'
import { useRef, useState } from 'react'

/**
 * next/image wrapped so every photo fades up out of the ground colour
 * instead of popping in. Also carries `data-placeholder` for the
 * `check:placeholders` gate.
 */
export default function SmartImage({
  className,
  placeholder: isStandIn,
  wrapperClassName,
  alt,
  ...props
}: Omit<ImageProps, 'placeholder'> & {
  placeholder?: boolean
  wrapperClassName?: string
}) {
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  return (
    <span className={`u-img block overflow-hidden ${wrapperClassName ?? ''}`}>
      <Image
        {...props}
        alt={alt}
        ref={ref}
        className={className}
        data-loaded={loaded}
        data-placeholder={isStandIn ? 'true' : undefined}
        onLoad={() => setLoaded(true)}
        // An image restored from bfcache can miss onLoad entirely.
        onError={() => setLoaded(true)}
      />
    </span>
  )
}
