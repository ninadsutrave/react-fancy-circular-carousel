import React, { FC, ReactNode, Children, useState, useEffect, useLayoutEffect, useRef, CSSProperties } from 'react'

const useIsomorphicLayoutEffect = (typeof window !== 'undefined')?useLayoutEffect:useEffect

// matches the margin on .fancy-carousel-element in FancyCarousel.css
const elementMargin = 2

interface CarouselInfo {
  images?: string[],
  imageAlts?: string[],
  children?: ReactNode,
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
  rotateOnClick?: boolean,
  responsive?: boolean
}

export const FancyCarousel: FC<CarouselInfo>
    = ({
        images,
        imageAlts = [],
        children,
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
        rotateOnClick = true,
        responsive = false
      }: CarouselInfo) => {

  // number of steps the ring has turned, +1 for every "next"
  const [step, setStep] = useState(0)

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

  // images take priority; otherwise any children are placed around the ring
  const childItems: ReactNode[] = Children.toArray(children)
  const noOfImages: number = (images)?images.length:childItems.length
  const theta: number = 360/noOfImages
  // derived from the step so it stays in range when the number of items changes
  const focusElement: number = (noOfImages)?((step % noOfImages) + noOfImages) % noOfImages:0
  const carouselOrientation: number = (noOfImages)?step*theta:0

  const borderElement: string = (border)?`url("data:image/svg+xml,%3csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3crect width=\'100%25\' height=\'100%25\' fill=\'none\' rx=\'${carouselRadius*2}\' ry=\'${carouselRadius*2}\' stroke=\'%23${borderHexColor}FF\' stroke-width=\'${borderWidth}\' stroke-dasharray=\'6%2c 24\' stroke-dashoffset=\'0\' stroke-linecap=\'square\'/%3e%3c/svg%3e")`:''

  const rotateRight = () => {
      setStep(prev => prev + 1)
  }

  const rotateLeft = () => {
      setStep(prev => prev - 1)
  }

  // turn the shorter way round until the given element is in focus
  const rotateTo = (index: number) => {
      setStep(prev => {
          let delta = (((index - prev) % noOfImages) + noOfImages) % noOfImages
          if(delta > noOfImages/2) delta -= noOfImages
          return prev + delta
      })
  }

  useEffect(() => {
    setFocusElement(focusElement)
  }, [focusElement])

  useEffect(() => {
    if(!autoRotateTime) return
    const timer = setInterval(rotateRight, autoRotateTime*1000)
    return () => clearInterval(timer)
  }, [autoRotateTime])

  var newCoordinates: number[][] = []
  for(let index = 0; index < noOfImages; index++) {
    newCoordinates.push([carouselRadius - peripheralImageRadius + carouselRadius*Math.cos(2*Math.PI * index/noOfImages), carouselRadius - peripheralImageRadius + carouselRadius*Math.sin(2*Math.PI * index/noOfImages)])
  }

  // rotate point around (carouselRadius-peripheralRadius, carouselRadius-peripheralRadius) by (offset+90) deg
  const totalDeviation: number = offsetAngle*Math.PI/180 + Math.PI/2

  var rotatedCoordinates: number[][] = []
  const centerCoordinate: number = carouselRadius - peripheralImageRadius
  newCoordinates.forEach((item, index) => {
    rotatedCoordinates.push([centerCoordinate + (item[0] - centerCoordinate)*Math.cos(totalDeviation) - (item[1] - centerCoordinate)*Math.sin(totalDeviation), centerCoordinate + (item[0] - centerCoordinate)*Math.sin(totalDeviation) + (item[1] - centerCoordinate)*Math.cos(totalDeviation)])
  })

  const content = (index: number, radius: number, className: string) => (
    (images)?
      <img className={className} src={images[index]} alt={imageAlts[index] ?? ''}
        style={{width: `${radius*2}px`, height: `${radius*2}px`, transition: `${transitionTime}s`}} />:
      <div className="fancy-carousel-item"
        style={{width: `${radius*2}px`, height: `${radius*2}px`, transition: `${transitionTime}s`}}>
        {childItems[index]}
      </div>
  )

  // in responsive mode, pad by the peripheral image radius so images on the ring's edge stay inside
  const wrapperStyle: CSSProperties = (responsive)?{width: '100%', boxSizing: 'border-box', contain: 'inline-size', padding: `${peripheralImageRadius + elementMargin}px`}:{}

  if(!scale || !noOfImages) return <div className="fancy-carousel-wrapper-element" ref={wrapperRef} style={wrapperStyle} />

  return (
      <div className="fancy-carousel-wrapper-element" ref={wrapperRef} style={wrapperStyle}>
        <div className="fancy-carousel-border"
             style={{backgroundImage: borderElement, height: `${carouselRadius*2}px`, width: `${carouselRadius*2}px`, transition: `${transitionTime}s`}}
        >
          <div
            className="fancy-carousel"
            style={{
                     transform: `rotate(${carouselOrientation}deg)`,
                     height: `${carouselRadius*2}px`, width: `${carouselRadius*2}px`,
                     transition: `${transitionTime}s`
                   }}
          >
            {rotatedCoordinates.map((coordinate, index) => (
                <div
                  className="fancy-carousel-element"
                  key={index}
                  onClick={(rotateOnClick && index !== focusElement)?() => rotateTo(index):undefined}
                  style={{...{
                            transform: `rotate(${-carouselOrientation}deg)`, width: `${peripheralImageRadius*2}px`, height: `${peripheralImageRadius*2}px`,
                            // take off the margin so each element is centred on the ring it rotates with
                            left:      `${coordinate[0] - elementMargin}px`,
                            bottom:    `${coordinate[1] - elementMargin}px`,
                            boxShadow: `${peripheralImageBoxShadow}`,
                            transition: `${transitionTime}s`,
                            cursor:    (rotateOnClick && index !== focusElement)?'pointer':undefined
                        }, ...((index === focusElement)?focusElementStyling:{})}}
                >
                  {content(index, peripheralImageRadius, 'fancy-carousel-image')}
                </div>
            ))}

            <div
                className="fancy-carousel-element central-img"
                key={noOfImages}
                style={{
                          transform: `rotate(${-carouselOrientation}deg)`, width: `${centralImageRadius*2}px`, height: `${centralImageRadius*2}px`,
                          left: `${carouselRadius - centralImageRadius - elementMargin}px`, bottom: `${carouselRadius - centralImageRadius - elementMargin}px`,
                          boxShadow: `${centralImageBoxShadow}`,
                          transition: `${transitionTime}s`
                      }}
                >
                {content(focusElement, centralImageRadius, 'fancy-carousel-central-image')}
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
