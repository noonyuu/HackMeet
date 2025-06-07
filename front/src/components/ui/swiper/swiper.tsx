import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import clsx from "clsx";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./style.css";

type SwiperProps = {
  images: string[];
  title: string;
  css?: string;
};

export const SwiperComponents = ({ images, title, css }: SwiperProps) => {
  const HOST_URL = import.meta.env.VITE_HOST_URL || "";
  const placeholderImage = (text: string = "No Image") =>
    `https://placehold.co/600x400/E2E8F0/A0AEC0?text=${encodeURIComponent(text)}`;
  return (
    <>
      <Swiper pagination={true} modules={[Pagination]} className="mySwiper">
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <img
              src={`${HOST_URL}image/upload/get?date=${encodeURIComponent(image)}`}
              alt={`Slide ${index + 1}`}
              className={clsx(
                css ? css : "h-auto max-h-[45vh] w-full",
                "object-contain",
              )}
              onError={(e) => (e.currentTarget.src = placeholderImage(title))}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};
