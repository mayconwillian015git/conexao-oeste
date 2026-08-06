'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  src: string
  alt: string
  fill?: boolean
  className?: string
  style?: React.CSSProperties
  sizes?: string
  priority?: boolean
}

export default function NoticiaImagem({ src, alt, fill, className, style, sizes, priority }: Props) {
  const [erro, setErro] = useState(false)

  if (erro || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <span className="text-blue-300 text-4xl font-bold">CO</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      style={style}
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={() => setErro(true)}
    />
  )
}
