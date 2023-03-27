<div align="center"><p align="center"><a href="https://www.npmjs.com/package/react-fancy-circular-carousel"><img src="./React.webp" alt="React Logo - Carousel UI Component" width="140px" /></a></p></div>

<h1 align="center">React Fancy Image Carousel</h1>

## Features

- Circular image carousel
- Everything you see is customisable
- Get focus element to add your own components
- Smooth, easy to implement, fantastic UI

## Install

    $ npm install react-fancy-circular-carousel

## Quickstart

#### Parameters

| **Parameter** | **Type** | **Description** |
|:---|:---|:---|
| images | String[] | `optional` List of image sources, optionallys displays featured Unsplash images |
| setFocusElement | Function | `optional` SetState method to get focus element in parent component |
| offsetAngle | Number | `optional` Angle in degrees to offset the carousel |
| carouselRadius | Number | `optional` Carousel radius in px |
| centralImageRadius | Number | `optional` Central image radius in px |
| centralImageBoxShadow | String | `optional` Central image box shadow property |
| peripheralImageRadius | Number | `optional` Peripheral Image radius in px |
| peripheralImageBoxShadow | String | `optional` Peripheral image box shadow property |
| focusElementStyling | Any | `optional` Custom styling for the element in focus |
| border | Boolean | `optional` Enable/disable bordering |
| borderWidth | Number | `optional` Border stroke width property in px |
| borderHexColor | String | `optional` Border hex color as a string excluding the '#' |
| autoRotateTime | Number | `optional` Time in seconds for an auto rotating carousel |
| navigationVisibility | Boolean | `optional` Enable/disable bordering |
| navigationTextSize | Number | `optional` ↓ Arrow font size in rem |
| navigationButtonRadius | Number | `optional` Navigation button radius in px |
| navigationButtonColor | String | `optional` ↓ Arrow hex color as a string excludin the '#' |
| navigationButtonBackgroundColor | String | `optional` Navigation button hex color as a string excludin the '#' |
| navigationButtonStyling | Any | `optional` Custom styling for navigation buttons |


```jsx
import React from "react";
import FancyCarousel from "react-fancy-circular-carousel";

export default () => (
  <>
    {/* animate individual element. */}
    <FancyCarousel images={}>
  </>
);

```

#### Play with the parameters


## Preview 


## NPM Module

[Npm Page](https://www.npmjs.com/package/react-fancy-circular-carousel)  
Try it out for yourselves and ⭐ this repo if you like it!

## License

MIT © [Ninad Sutrave](https://ninadsutrave.in)