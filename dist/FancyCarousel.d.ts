import { FC, CSSProperties } from 'react';
interface CarouselInfo {
    images: string[];
    setFocusElement?: Function;
    offsetAngle?: number;
    carouselRadius?: number;
    centralImageRadius?: number;
    centralImageBoxShadow?: string;
    peripheralImageRadius?: number;
    peripheralImageBoxShadow?: string;
    focusElementStyling?: CSSProperties;
    border?: boolean;
    borderWidth?: number;
    borderHexColor?: string;
    autoRotateTime?: number;
    transitionTime?: number;
    navigationTextSize?: number;
    navigationButtonRadius?: number;
    navigationButtonBgColor?: string;
    navigationButtonColor?: string;
    navigationButtonStyling?: CSSProperties;
}
export declare const FancyCarousel: FC<CarouselInfo>;
export {};
