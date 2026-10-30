import React, { FC, useState, useEffect, useLayoutEffect, useRef, CSSProperties } from 'react'

const useIsomorphicLayoutEffect = (typeof window !== 'undefined')?useLayoutEffect:useEffect

// matches the margin on .fancy-carousel-element in FancyCarousel.css
const elementMargin = 2

interface CarouselInfo {
  images: string[],
  imageAlts?: string[],
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
  navigationButtonStyling?: CSSProperties,
  responsive?: boolean
}

export const FancyCarousel: FC<CarouselInfo> 
    = ({
        images,
        imageAlts = [],
        setFocusElement = () => {},
        offsetAngle = 0,
        carouselRadius: baseCarouselRadius = 400, 
        centralImageRadius: baseCentralImageRadius = 125, 
        centralImageBoxShadow = '5px 10px 18px #888888',
        peripheralImageRadius: basePeripheralImageRadius = 75, 
        peripheralImageBoxShadow = '5px 10px 18px #888888',
        focusElementStyling = {},
        border = true, 
        borderWidth: baseBorderWidth = 5, 
        borderHexColor  = 'CB786C', 
        autoRotateTime = 0,
        transitionTime = 0.5,
        navigationTextSize: baseNavigationTextSize = 2,
        navigationButtonRadius: baseNavigationButtonRadius = 32.5, 
        navigationButtonBgColor = 'CB786C', 
        navigationButtonColor = 'FFFFFF',
        navigationButtonStyling = {},
        responsive = false
      }: CarouselInfo) => {

  const [carousel, setCarousel] = useState({
    carouselOrietation: 0,
    elementOrientation: 0,
    focusElement: 0
  })

  // scale factor for all sizes, 0 until measured so nothing animates in from full size
  const [scale, setScale] = useState(responsive ? 0 : 1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    const wrapper = wrapperRef.current
    if(!responsive || !wrapper) {
      setScale(1)
      return
    }
    // the wrapper fills its parent and ignores its own contents (contain: inline-size),
    // so its width never depends on the scale; fall back to the viewport if it has none
    const fit = () => {
      const width = (wrapper.clientWidth || document.documentElement.clientWidth) - 2*elementMargin
      setScale(Math.min(1, width / (2*(baseCarouselRadius + basePeripheralImageRadius))))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [responsive, baseCarouselRadius, basePeripheralImageRadius])

  const carouselRadius: number = baseCarouselRadius*scale
  const centralImageRadius: number = baseCentralImageRadius*scale
  const peripheralImageRadius: number = basePeripheralImageRadius*scale
  const borderWidth: number = baseBorderWidth*scale
  const navigationTextSize: number = baseNavigationTextSize*scale
  const navigationButtonRadius: number = baseNavigationButtonRadius*scale

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

  // in responsive mode, pad by the peripheral image radius so images on the ring's edge stay inside
  const wrapperStyle: CSSProperties = (responsive)?{width: '100%', boxSizing: 'border-box', contain: 'inline-size', padding: `${peripheralImageRadius + elementMargin}px`}:{}

  if(!scale) return <div className="fancy-carousel-wrapper-element" ref={wrapperRef} style={wrapperStyle} />

  return (
      <div className="fancy-carousel-wrapper-element" ref={wrapperRef} style={wrapperStyle}>
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
                  <img className="fancy-carousel-image" src={item} alt={imageAlts[index] ?? ''}
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
                  <img className="fancy-carousel-image" src={item} alt={imageAlts[index] ?? ''}
                       style={{width: `${peripheralImageRadius*2}px`, height: `${peripheralImageRadius*2}px`, transition: `${transitionTime}s`}} />
                </div>
            ))}

            <div
                className="fancy-carousel-element central-img"
                key={noOfImages}
                style={{ 
                          transform: `rotate(${carousel.elementOrientation}deg)`, width: `${centralImageRadius*2}px`, height: `${centralImageRadius*2}px`,
                          left: `${carouselRadius - centralImageRadius - 10*scale}px`, bottom: `${carouselRadius - centralImageRadius - 10*scale}px`,
                          boxShadow: `${centralImageBoxShadow}`,
                          transition: `${transitionTime}s`
                      }}
                > 
                <img className="fancy-carousel-central-image" src={images[carousel.focusElement]} alt={imageAlts[carousel.focusElement] ?? ''}
                  style={{width: `${centralImageRadius*2}px`, height: `${centralImageRadius*2}px`, transition: `${transitionTime}s`}} 
                />
            </div>
          </div>
        </div>

        <div className={"fancy-carousel-navigators " + ((autoRotateTime)?"invisible":"")}
             style={{gap: `${carouselRadius*2}px`, marginLeft: `-${navigationButtonRadius*1.8}px`}}>
              <button type="button" aria-label="Previous image" className="fancy-carousel-navigation-button" onClick={rotateLeft}
                      style={{...{ 
                              width: `${navigationButtonRadius*2}px`, height: `${navigationButtonRadius*2}px`,
                              backgroundColor: `#${navigationButtonBgColor}`, color: `#${navigationButtonColor}`,
                              fontSize: `${navigationTextSize}rem`
                            }, ...navigationButtonStyling}}
              >
                ↓
              </button>
              <button type="button" aria-label="Next image" className="fancy-carousel-navigation-button" onClick={rotateRight}
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