'use client'

import { useState, useRef, useEffect } from 'react'
import Script from 'next/script'
import Image from 'next/image'

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const gridRef = useRef(null)

  const imageFiles = [
    'RAMENHEAD-WS-PIC-01.jpg',
    'RAMENHEAD-WS-PIC-02.jpg',
    'RAMENHEAD-WS-PIC-03.jpg',
    'RAMENHEAD-WS-PIC-04.jpg',
    'RAMENHEAD-WS-PIC-05.jpg',
    'RAMENHEAD-WS-PIC-06.jpg',
    'RAMENHEAD-WS-PIC-07.jpg',
    'RAMENHEAD-WS-PIC-08.jpg',
    'RAMENHEAD-WS-PIC-12.jpg',
    'RAMENHEAD-WS-PIC-13.jpg',
    'RAMENHEAD-WS-PIC-10.jpg',
    'RAMENHEAD-WS-PIC-11.jpg',
    'RAMENHEAD-WS-PIC-09.jpg',
    'RAMENHEAD-WS-PIC-14.jpg',
  ]

  const openModal = (index) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const nextImage = (e) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === imageFiles.length - 1 ? 0 : prev + 1))
  }

  const prevImage = (e) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? imageFiles.length - 1 : prev - 1))
  }

  const initMasonry = () => {
    if (window.Masonry && gridRef.current) {
      const msnry = new window.Masonry(gridRef.current, {
        itemSelector: '.grid-item',
        columnWidth: '.grid-sizer',
        percentPosition: true,
      })

      if (window.imagesLoaded) {
        window.imagesLoaded(gridRef.current, () => {
          msnry.layout()
        })
      }
    }
  }

  useEffect(() => {
    if (window.Masonry) {
      initMasonry()
    }
  }, [])

  return (
    <>
      <Script 
        src="/masonry.pkgd.min.js" 
        strategy="afterInteractive"
        onLoad={initMasonry}
      />
      <Script 
        src="/imagesloaded.pkgd.min.js" 
        strategy="afterInteractive"
        onLoad={initMasonry}
      />

      <article className="hidden-article">
        <h1>Ramenhead: Authentic Japanese Ramen in Cape Town</h1>
        <p>Ramenhead is a premium ramen restaurant with locations at Speaker&apos;s Corner and Time Out Market in Cape Town. We specialize in authentic freshly made noodles, 18-hour simmered Tonkotsu broths, and high-quality Japanese ingredients. Our menu includes classic ramen, vegan options, and a curated selection of sake.</p>
      </article>

      <div className="images grid" ref={gridRef}>
        <div className="grid-sizer"></div>
        {imageFiles.map((file, index) => (
          <div 
            className="grid-item image" 
            key={file} 
            onClick={() => openModal(index)}
          >
            <Image 
              src={`/assets/${file}`} 
              alt={`Ramenhead atmosphere and dishes - ${file}`}
              width={600}
              height={800}
              className="grid-image"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading={index < 2 ? "eager" : "lazy"}
              priority={index < 2}
            />
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="modal">
          <div className="modalBackground" onClick={closeModal}></div>
          <div className="modalContent">
            <div className="modalControls">
              <svg id="control-prev" onClick={prevImage} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ebe3d7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="modal-nav-button modal-prev">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
              <svg id="control-next" onClick={nextImage} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ebe3d7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="modal-nav-button">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
            <div className="modalImage">
              <Image 
                id="modalImageTarget" 
                src={`/assets/${imageFiles[currentIndex]}`} 
                alt="Full size ramenhead image"
                width={1200}
                height={1600}
                className="modal-image-target"
              />
            </div>
          </div>
          <div className="modalClose" onClick={closeModal}>
            <svg id="control-close" width="37" height="37" viewBox="0 0 37 37">
              <path d="M36.863,18.682A18.181,18.181,0,1,1,18.681.5,18.182,18.182,0,0,1,36.863,18.682Z" fill="none" stroke="#ebe3d7" strokeMiterlimit="10" strokeWidth="1" />
              <line x2="9.706" y2="9.706" transform="translate(14.912 8.962)" fill="none" stroke="#ebe3d7" strokeMiterlimit="10" strokeWidth="1" />
              <line x1="9.705" y2="9.732" transform="translate(14.92 18.669)" fill="none" stroke="#ebe3d7" strokeMiterlimit="10" strokeWidth="1" />
            </svg>
          </div>
        </div>
      )}
    </>
  )
}
