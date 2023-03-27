import { FC } from 'react';
interface CarouselInfo {
    images: string[];
    setFocusElement?: Function;
    offsetAngle?: number;
    carouselRadius?: number;
    centralImageRadius?: number;
    centralImageBoxShadow?: string;
    peripheralImageRadius?: number;
    peripheralImageBoxShadow?: string;
    focusElementStyling?: any;
    border?: boolean;
    borderWidth?: number;
    borderHexColor?: string;
    autoRotateTime?: number;
    navigationVisibility?: boolean;
    navigationTextSize?: number;
    navigationButtonRadius?: number;
    navigationButtonBackgroundColor?: string;
    navigationButtonColor?: string;
    navigationButtonStyling?: any;
}
export declare const FancyCarousel: FC<CarouselInfo>;
export {};
