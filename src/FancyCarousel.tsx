import React, { FC, useState, useEffect, CSSProperties } from 'react'

interface CarouselInfo {
  images: string[],
  setFocusElement?: (focusElement: number) => void,
  offsetAngle?: number,
  carouselRadius?: number,
  centralImageRadius?: number,
  centralImageBoxShadow?: string,
  peripheralImageRadius?: number,
  peripheralImageBoxShadow?: string,
  focusElementStyling?: CSSProperties,
  border?: boolean,
  borderWidth?: number,
  borderHexColor?: string,
  autoRotateTime?: number,
  transitionTime?: number,
  navigationTextSize?: number,
  navigationButtonRadius?: number,
  navigationButtonBgColor?: string,
  navigationButtonColor?: string,
  navigationButtonStyling?: CSSProperties
}

export const FancyCarousel: FC<CarouselInfo> 
    = ({
        images, 
        setFocusElement = () => {},
        offsetAngle = 0,
        carouselRadius = 400, 
        centralImageRadius = 125, 
        centralImageBoxShadow = '5px 10px 18px #888888',
        peripheralImageRadius = 75, 
        peripheralImageBoxShadow = '5px 10px 18px #888888',
        focusElementStyling = {},
        border = true, 
        borderWidth = 5, 
        borderHexColor  = 'CB786C', 
        autoRotateTime = 0,
        transitionTime = 0.5,
        navigationTextSize = 2,
        navigationButtonRadius = 32.5, 
        navigationButtonBgColor = 'CB786C', 
        navigationButtonColor = 'FFFFFF',
        navigationButtonStyling = {}
      }: CarouselInfo) => {

  const [carousel, setCarousel] = useState({
    carouselOrietation: 0,
    elementOrientation: 0,
    focusElement: 0
  })

  const noOfImages: number = images.length
  const theta: number = 360/noOfImages

  const borderElement: string = (border)?`url("data:image/svg+xml,%3csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3crect width=\'100%25\' height=\'100%25\' fill=\'none\' rx=\'${carouselRadius*2}\' ry=\'${carouselRadius*2}\' stroke=\'%23${borderHexColor}FF\' stroke-width=\'${borderWidth}\' stroke-dasharray=\'6%2c 24\' stroke-dashoffset=\'0\' stroke-linecap=\'square\'/%3e%3c/svg%3e")`:''

  const rotateRight = () => {
      setCarousel(prev => ({
          carouselOrietation: prev.carouselOrietation + theta,
          elementOrientation: prev.elementOrientation - theta,
          focusElement: (prev.focusElement<(noOfImages-1))?prev.focusElement + 1:0
      }))
  }

  const rotateLeft = () => {
      setCarousel(prev => ({
          carouselOrietation: prev.carouselOrietation - theta,
          elementOrientation: prev.elementOrientation + theta,
          focusElement: (prev.focusElement>0)?prev.focusElement - 1:noOfImages-1
      }))
  }

  useEffect(() => {
    setFocusElement(carousel.focusElement)
  }, [carousel.focusElement])

  useEffect(() => {
    if(!autoRotateTime) return
    const timer = setInterval(rotateRight, autoRotateTime*1000)
    return () => clearInterval(timer)
  }, [autoRotateTime, noOfImages])

  var newCoordinates: number[][] = []
  images.forEach((item, index) => {
    newCoordinates.push([carouselRadius - peripheralImageRadius + carouselRadius*Math.cos(2*Math.PI * index/noOfImages), carouselRadius - peripheralImageRadius + carouselRadius*Math.sin(2*Math.PI * index/noOfImages)])
  })

  // rotate point around (carouselRadius-peripheralRadius, carouselRadius-peripheralRadius) by (offset+90) deg
  const totalDeviation: number = offsetAngle*Math.PI/180 + Math.PI/2

  var rotatedCoordinates: number[][] = []
  const centerCoordinate: number = carouselRadius - peripheralImageRadius
  newCoordinates.forEach((item, index) => {
    rotatedCoordinates.push([centerCoordinate + (item[0] - centerCoordinate)*Math.cos(totalDeviation) - (item[1] - centerCoordinate)*Math.sin(totalDeviation), centerCoordinate + (item[0] - centerCoordinate)*Math.sin(totalDeviation) + (item[1] - centerCoordinate)*Math.cos(totalDeviation)])
  })

  return (
      <div className="fancy-carousel-wrapper-element">
        <div className="fancy-carousel-border" 
             style={{backgroundImage: borderElement, height: `${carouselRadius*2}px`, width: `${carouselRadius*2}px`, transition: `${transitionTime}s`}}
        >
          <div
            className="fancy-carousel"
            style={{ 
                     transform: `rotate(${carousel.carouselOrietation}deg)`, 
                     height: `${carouselRadius*2}px`, width: `${carouselRadius*2}px`,
                     transition: `${transitionTime}s`
                   }}
          >
            {images.map((item, index) => (
              (index !== carousel.focusElement)?
                <div
                  className="fancy-carousel-element"
                  key={index}
                  style={{ 
                            transform: `rotate(${carousel.elementOrientation}deg)`, width: `${peripheralImageRadius*2}px`, height: `${peripheralImageRadius*2}px`,
                            left:      `${rotatedCoordinates[index][0]}px`, 
                            bottom:    `${rotatedCoordinates[index][1]}px`,
                            boxShadow: `${peripheralImageBoxShadow}`,
                            transition: `${transitionTime}s`
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
                            left:      `${rotatedCoordinates[index][0]}px`, 
                            bottom:    `${rotatedCoordinates[index][1]}px`,
                            boxShadow: `${peripheralImageBoxShadow}`,
                            transition: `${transitionTime}s`
                        }, ...focusElementStyling}}
                >
                  <img className="fancy-carousel-image" src={item}
                       style={{width: `${peripheralImageRadius*2}px`, height: `${peripheralImageRadius*2}px`, transition: `${transitionTime}s`}} />
                </div>
            ))}

            <div
                className="fancy-carousel-element central-img"
                key={noOfImages}
                style={{ 
                          transform: `rotate(${carousel.elementOrientation}deg)`, width: `${centralImageRadius*2}px`, height: `${centralImageRadius*2}px`,
                          left: `${carouselRadius - centralImageRadius - 10}px`, bottom: `${carouselRadius - centralImageRadius - 10}px`,
                          boxShadow: `${centralImageBoxShadow}`,
                          transition: `${transitionTime}s`
                      }}
                > 
                <img className="fancy-carousel-central-image" src={images[carousel.focusElement]}
                  style={{width: `${centralImageRadius*2}px`, height: `${centralImageRadius*2}px`, transition: `${transitionTime}s`}} 
                />
            </div>
          </div>
        </div>

        <div className={"fancy-carousel-navigators " + ((autoRotateTime)?"invisible":"")}
             style={{gap: `${carouselRadius*2}px`, marginLeft: `-${navigationButtonRadius*1.8}px`}}>
              <button className="fancy-carousel-navigation-button" onClick={rotateLeft}
                      style={{...{ 
                              width: `${navigationButtonRadius*2}px`, height: `${navigationButtonRadius*2}px`,
                              backgroundColor: `#${navigationButtonBgColor}`, color: `#${navigationButtonColor}`,
                              fontSize: `${navigationTextSize}rem`
                            }, ...navigationButtonStyling}}
              >
                ↓
              </button>
              <button className="fancy-carousel-navigation-button" onClick={rotateRight}
                      style={{...{ 
                              width: `${navigationButtonRadius*2}px`, height: `${navigationButtonRadius*2}px`,
                              backgroundColor: `#${navigationButtonBgColor}`, color: `#${navigationButtonColor}`,
                              fontSize: `${navigationTextSize}rem`
                            }, ...navigationButtonStyling}}
              >   
                ↓
              </button>
          </div>
      </div>
  )
}