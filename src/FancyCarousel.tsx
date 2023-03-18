import React, { FC, useState } from 'react'
import './FancyCarousel.css'

interface CarouselInfo {
  images: string[],
  setFocusElement?: Function,
  offsetAngle?: number,
  carouselRadius?: number,
  centralImageRadius?: number,
  centralImageBoxShadow?: string,
  peripheralImageRadius?: number,
  peripheralImageBoxShadow?: string,
  focusElementStyling?: any,
  border?: boolean,
  borderWidth?: number,
  borderHexColor?: string,
  autoRotateTime?: number,
  navigationVisibility?: boolean,
  navigationTextSize?: number,
  navigationButtonRadius?: number,
  navigationButtonBackgroundColor?: string,
  navigationButtonColor?: string
}

export const FancyCarousel: FC<CarouselInfo> 
    = ({images, 
        setFocusElement = () => {},
        offsetAngle,
        carouselRadius = 400, 
        centralImageRadius = 125, 
        centralImageBoxShadow = '5px 10px 18px #888888',
        peripheralImageRadius = 75, 
        peripheralImageBoxShadow = '5px 10px 18px #888888',
        focusElementStyling = {},
        border = true, 
        borderWidth = 5, 
        borderHexColor  = '4CAF50', 
        autoRotateTime = 0,
        navigationVisibility = true, 
        navigationTextSize = 2,
        navigationButtonRadius = 32.5, 
        navigationButtonBackgroundColor = '4CAF50', 
        navigationButtonColor = 'FFFFFF'
      }: CarouselInfo) => {

  const [carousel, setCarousel] = useState({
    carouselOrietation: 0,
    elementOrientation: 0,
    focusElement: 0
  })

  setFocusElement(carousel.focusElement)

  if(autoRotateTime) {
    setTimeout(() => {
      rotateRight()
    }, autoRotateTime*1000)
  }
  
  const noOfImages: number = images.length
  const theta: number = 360/noOfImages

  const borderElement: string = (border)?`url("data:image/svg+xml,%3csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3crect width=\'100%25\' height=\'100%25\' fill=\'none\' rx=\'${carouselRadius*2}\' ry=\'${carouselRadius*2}\' stroke=\'%23${borderHexColor}FF\' stroke-width=\'${borderWidth}\' stroke-dasharray=\'6%2c 24\' stroke-dashoffset=\'0\' stroke-linecap=\'square\'/%3e%3c/svg%3e")`:''

  const rotateRight = () => {
      setCarousel({
          carouselOrietation: carousel.carouselOrietation + theta,
          elementOrientation: carousel.elementOrientation - theta,
          focusElement: (carousel.focusElement<(noOfImages-1))?carousel.focusElement + 1:0
      })
  }

  const rotateLeft = () => {
      setCarousel({
          carouselOrietation: carousel.carouselOrietation - theta,
          elementOrientation: carousel.elementOrientation + theta,
          focusElement: (carousel.focusElement>0)?carousel.focusElement - 1:noOfImages-1
      })
  }

  return (
      <div className="fancy-carousel-wrapper-element">
        <div className="fancy-carousel-border" 
             style={{backgroundImage: borderElement, height: `${carouselRadius*2}px`, width: `${carouselRadius*2}px`}}
        >
          <div
            className="fancy-carousel"
            style={{ 
                     transform: `rotate(${carousel.carouselOrietation}deg)`, 
                     height: `${carouselRadius*2}px`, width: `${carouselRadius*2}px` 
                   }}
          >
            {images.map((item, index) => (
              (index !== carousel.focusElement)?
                <div
                  className="fancy-carousel-element"
                  key={index}
                  style={{ 
                            transform: `rotate(${carousel.elementOrientation}deg)`, width: `${peripheralImageRadius*2}px`, height: `${peripheralImageRadius*2}px`,
                            left:      `${carouselRadius - peripheralImageRadius + carouselRadius*Math.cos(2*Math.PI * index/noOfImages)}px`, 
                            bottom:    `${carouselRadius - peripheralImageRadius + carouselRadius*Math.sin(2*Math.PI * index/noOfImages)}px`,
                            boxShadow: `${peripheralImageBoxShadow}`
                        }}
                >
                  <img className="fancy-carousel-image" src={item}
                    style={{width: `${peripheralImageRadius*2}px`, height: `${peripheralImageRadius*2}px`}} />
                </div>:
                <div
                  className="fancy-carousel-element"
                  key={index}
                  style={{...{ 
                            transform: `rotate(${carousel.elementOrientation}deg)`, width: `${peripheralImageRadius*2}px`, height: `${peripheralImageRadius*2}px`,
                            left:      `${carouselRadius - peripheralImageRadius + carouselRadius*Math.cos(2*Math.PI * index/noOfImages)}px`, 
                            bottom:    `${carouselRadius - peripheralImageRadius + carouselRadius*Math.sin(2*Math.PI * index/noOfImages)}px`,
                            boxShadow: `${peripheralImageBoxShadow}`
                        }, ...focusElementStyling}}
                >
                  <img className="fancy-carousel-image" src={item}
                       style={{width: `${peripheralImageRadius*2}px`, height: `${peripheralImageRadius*2}px`}} />
                </div>
            ))}

            <div
                className="fancy-carousel-element central-img"
                key={noOfImages}
                style={{ 
                          transform: `rotate(${carousel.elementOrientation}deg)`, width: `${centralImageRadius*2}px`, height: `${centralImageRadius*2}px`,
                          left: `${carouselRadius - centralImageRadius - 10}px`, bottom: `${carouselRadius - centralImageRadius - 10}px`,
                          boxShadow: `${centralImageBoxShadow}`
                      }}
                > 
                <img className="fancy-carousel-central-image" src={images[carousel.focusElement]}
                  style={{width: `${centralImageRadius*2}px`, height: `${centralImageRadius*2}px`}} 
                />
            </div>

          </div>
        </div>

        <div className={"navigators " + ((navigationVisibility)?"":"invisible")}
             style={{gap: `${carouselRadius*2}px`, marginLeft: `-${navigationButtonRadius*1.5}px`}}>
              <button className="navigation-button" onClick={rotateLeft}
                      style={{ 
                              width: `${navigationButtonRadius*2}px`, height: `${navigationButtonRadius*2}px`,
                              backgroundColor: `#${navigationButtonBackgroundColor}`, color: `#${navigationButtonColor}`,
                              fontSize: `${navigationTextSize}rem`
                            }}
              >
                ↓
              </button>
              <button className="navigation-button" onClick={rotateRight}
                      style={{ 
                              width: `${navigationButtonRadius*2}px`, height: `${navigationButtonRadius*2}px`,
                              backgroundColor: `#${navigationButtonBackgroundColor}`, color: `#${navigationButtonColor}`,
                              fontSize: `${navigationTextSize}rem`
                            }}
              >   
                ↓
              </button>
          </div>
      </div>
  )
}