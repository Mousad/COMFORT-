"use client";

import { Play } from "lucide-react";

const InstagramIcon = ({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
      />
    </svg>
  );
};

const reviews = [
  {
    id: 1,
    type: "video" as const,
    name: "تجربة عميلة",
    username: "@comfortkeepers",
    number: "01",
    media: "/reviews/review-video.mp4",
  },
  {
    id: 2,
    type: "image" as const,
    name: "تجربة عميلة",
    username: "@comfortkeepers",
    number: "02",
    media: "/reviews/review-02.jpeg",
  },
  {
    id: 3,
    type: "image" as const,
    name: "تجربة عميلة",
    username: "@comfortkeepers",
    number: "03",
    media: "/reviews/review-03.jpeg",
  },
  {
    id: 4,
    type: "image" as const,
    name: "تجربة عميلة",
    username: "@comfortkeepers",
    number: "04",
    media: "/reviews/review-04.jpeg",
  },
  {
    id: 5,
    type: "image" as const,
    name: "تجربة عميلة",
    username: "@comfortkeepers",
    number: "05",
    media: "/reviews/review-05.jpeg",
  },
];

export default function InstagramReviews() {
  return (
    <section
      className="
        w-full
        overflow-hidden
        bg-[#f0ede8]
        py-16
        md:py-24
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mx-auto max-w-7xl px-5">
        <div className="text-center">
          <p className="text-[10px] tracking-[0.3em] text-black/40">
            REAL EXPERIENCES
          </p>

          <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
            آراء تستحق المشاهدة
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-black/55">
            تجارب حقيقية من عملائنا مع Comfort Keepers
          </p>
        </div>
      </div>

      {/* =====================================================
          REVIEWS CARDS
      ===================================================== */}

      <div className="mt-10 md:mt-14">
        <div
          className="
            flex
            w-full
            gap-4
            overflow-x-auto
            px-5
            pb-6
            snap-x
            snap-mandatory
            scrollbar-none
            md:gap-5
            md:px-[max(20px,calc((100vw-1280px)/2))]
          "
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              className="
                group
                relative
                w-[240px]
                min-w-[240px]
                shrink-0
                snap-start
                overflow-hidden
                bg-[#171717]
                sm:w-[270px]
                sm:min-w-[270px]
                md:w-[290px]
                md:min-w-[290px]
              "
            >
              <div className="relative aspect-[9/14] overflow-hidden">
                {/* =================================================
                    VIDEO
                ================================================= */}

                {review.type === "video" ? (
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={(e) => {
                      const video =
                        e.currentTarget.querySelector("video");

                      if (!video) return;

                      if (video.paused) {
                        video.play();
                      } else {
                        video.pause();
                      }
                    }}
                  >
                    <video
                      src={review.media}
                      className="
                        absolute
                        inset-0
                        h-full
                        w-full
                        object-cover
                      "
                      muted
                      playsInline
                      preload="metadata"
                    />

                    {/* Video Overlay */}
                    <div
                      className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/70
                        via-black/10
                        to-black/5
                      "
                    />

                    {/* Play Button */}
                    <div
                      className="
                        pointer-events-none
                        absolute
                        left-1/2
                        top-1/2
                        flex
                        h-16
                        w-16
                        -translate-x-1/2
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/40
                        bg-white/15
                        text-white
                        shadow-xl
                        backdrop-blur-md
                        transition
                        duration-300
                        group-hover:scale-110
                        group-hover:bg-white
                        group-hover:text-black
                      "
                    >
                      <Play
                        size={20}
                        fill="currentColor"
                        className="mr-[-2px]"
                      />
                    </div>
                  </div>
                ) : (
                  /* =================================================
                      SCREENSHOT
                  ================================================= */

                  <div className="absolute inset-0 bg-[#111]">
                    <img
                      src={review.media}
                      alt={review.name}
                      className="
                        absolute
                        inset-0
                        h-full
                        w-full
                        object-contain
                        object-center
                        transition
                        duration-500
                        group-hover:scale-[1.02]
                      "
                    />

                    <div
                      className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/70
                        via-transparent
                        to-transparent
                      "
                    />
                  </div>
                )}

                {/* =================================================
                    INSTAGRAM ICON
                ================================================= */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    top-4
                    z-10
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-white/10
                    text-white
                    backdrop-blur-md
                  "
                >
                  <InstagramIcon size={16} />
                </div>

                {/* =================================================
                    NUMBER
                ================================================= */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    left-5
                    top-5
                    z-10
                    text-[10px]
                    tracking-[0.25em]
                    text-white/70
                  "
                >
                  {review.number}
                </div>

                {/* =================================================
                    BOTTOM INFO
                ================================================= */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    bottom-0
                    left-0
                    right-0
                    z-10
                    p-5
                    text-white
                  "
                >
                  <p className="text-sm font-medium">
                    {review.name}
                  </p>

                  <p className="mt-1 text-[11px] text-white/60">
                    {review.username}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-[10px] text-white/70">
                    <InstagramIcon size={13} />

                    <span>
                      {review.type === "video"
                        ? "تجربة فيديو"
                        : "تجربة حقيقية"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          BOTTOM HINT
      ===================================================== */}

      <div className="mt-5 flex justify-center">
        <p className="text-[10px] text-black/35">
          اسحب لمشاهدة المزيد
        </p>
      </div>
    </section>
  );
}