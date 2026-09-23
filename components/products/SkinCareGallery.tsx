
"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/product";

type SkinCareGalleryProps = {
  products: Product[];
};

export default function SkinCareGallery({
  products,
}: SkinCareGalleryProps) {
  const galleryProducts = products
    .filter(
      (product) =>
        product.images &&
        product.images.length > 0
    )
    .slice(0, 11);

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const selectedProduct =
    selectedIndex !== null
      ? galleryProducts[selectedIndex]
      : null;

  function closeModal() {
    setSelectedIndex(null);
  }

  function nextImage() {
    if (selectedIndex === null) return;

    setSelectedIndex(
      (selectedIndex + 1) % galleryProducts.length
    );
  }

  function previousImage() {
    if (selectedIndex === null) return;

    setSelectedIndex(
      (selectedIndex - 1 + galleryProducts.length) %
        galleryProducts.length
    );
  }

  // إغلاق بـ ESC
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }

      if (event.key === "ArrowRight") {
        previousImage();
      }

      if (event.key === "ArrowLeft") {
        nextImage();
      }
    }

    if (selectedIndex !== null) {
      document.addEventListener(
        "keydown",
        handleKeyDown
      );
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  if (galleryProducts.length === 0) {
    return null;
  }

  return (
    <>
      {/* Gallery Section */}
      <section
        dir="rtl"
        className="mb-12"
      >
        {/* Heading */}
       
<div className="mb-5 flex items-end justify-between">
  <div>
    <p className="text-[9px] tracking-[0.3em] text-black/40">
      DISCOVER
    </p>

    <h2 className="mt-1 font-serif text-2xl md:text-3xl">
      اكتشفي مجموعتنا
    </h2>
  </div>

  <p className="hidden text-xs text-black/40 sm:block">
    اسحبي لمشاهدة المزيد
  </p>
</div>
        

        {/* Horizontal Gallery */}
        <div
          className="
            flex
            gap-3
            overflow-x-auto
            pb-2
            scrollbar-hide
            snap-x
            snap-mandatory
          "
        >
          {galleryProducts.map((product, index) => (
            <button
              key={product.id}
              type="button"
              onClick={() =>
                setSelectedIndex(index)
              }
              className="
                group
                relative
                h-[120px]
                w-[95px]
                shrink-0
                overflow-hidden
                bg-[#e3dfda]
                snap-start
                sm:h-[145px]
                sm:w-[115px]
              "
              aria-label={`عرض ${product.name}`}
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="
                  h-full
                  w-full
                  object-contain
                  p-2
                  transition
                  duration-500
                  group-hover:scale-105
                "
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />

              {/* Number */}
              <span className="absolute bottom-2 right-2 text-[9px] text-black/45">
                {String(index + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Fullscreen Modal */}
      {selectedProduct && selectedIndex !== null && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/80
            p-4
            backdrop-blur-sm
          "
          onClick={closeModal}
        >
          {/* Close */}
          <button
            type="button"
            onClick={closeModal}
            className="
              absolute
              right-5
              top-5
              z-20
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-white/10
              text-white
              backdrop-blur
              transition
              hover:bg-white/20
            "
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>

          {/* Previous */}
          {galleryProducts.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                previousImage();
              }}
              className="
                absolute
                right-4
                top-1/2
                z-20
                flex
                h-10
                w-10
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white/10
                text-white
                backdrop-blur
                transition
                hover:bg-white/20
                md:right-8
              "
              aria-label="الصورة السابقة"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Image */}
          <div
            className="
              relative
              flex
              max-h-[50vh]
              max-w-[90vw]
              items-center
              justify-center
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={selectedProduct.images[0]}
              alt={selectedProduct.name}
              className="
                max-h-[82vh]
                max-w-[88vw]
                object-contain
              "
            />

            {/* Product Name */}
            <div
              className="
                absolute
                bottom-4
                left-1/2
                -translate-x-1/2
                whitespace-nowrap
                bg-black/60
                px-4
                py-2
                text-center
                text-xs
                text-white
                backdrop-blur
              "
            >
              {selectedProduct.name}
            </div>
          </div>

          {/* Next */}
          {galleryProducts.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                nextImage();
              }}
              className="
                absolute
                left-4
                top-1/2
                z-20
                flex
                h-10
                w-10
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white/10
                text-white
                backdrop-blur
                transition
                hover:bg-white/20
                md:left-8
              "
              aria-label="الصورة التالية"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Counter */}
          <div
            className="
              absolute
              bottom-6
              left-1/2
              -translate-x-1/2
              text-[10px]
              tracking-[0.2em]
              text-white/60
            "
          >
            {selectedIndex + 1} /{" "}
            {galleryProducts.length}
          </div>
        </div>
      )}
    </>
  );
}
