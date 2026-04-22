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
        src="https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js" 
        onLoad={initMasonry}
      />
      <Script 
        src="https://unpkg.com/imagesloaded@5/imagesloaded.pkgd.min.js" 
        onLoad={initMasonry}
      />

      <article style={{display: 'none'}}>
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
              style={{ width: '100%', height: 'auto' }}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <div className={`modal ${isOpen ? 'modalShow' : ''}`}>
        <div className="modalBackground" onClick={closeModal}></div>
        <div className="modalContent">
          <div className="modalControls">
            <svg id="control-prev" onClick={prevImage} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ebe3d7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{cursor: 'pointer', transform: 'rotate(180deg)'}}>
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            <svg id="control-next" onClick={nextImage} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ebe3d7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{cursor: 'pointer'}}>
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
              style={{ maxHeight: '80vh', width: 'auto', objectFit: 'contain' }}
            />
          </div>
        </div>
        <div className="modalClose" onClick={closeModal}>
          <svg id="Component_3_2" width="27.342" height="27.398" viewBox="0 0 27.342 27.398">
            <g transform="translate(0 0)">
              <line x2="26.635" y2="26.635" transform="translate(0.354 0.374)" fill="none" stroke="#ebe3d7" strokeMiterlimit="10" strokeWidth="1" />
              <line x1="26.617" y2="26.692" transform="translate(0.365 0.353)" fill="none" stroke="#ebe3d7" strokeMiterlimit="10" strokeWidth="1" />
            </g>
          </svg>
        </div>
      </div>
    </>
  )
}
