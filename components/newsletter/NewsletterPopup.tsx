"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";

const STORAGE_KEY = "comfort-keepers-newsletter-popup";

type ContactMethod = "email" | "whatsapp";

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [contactMethod, setContactMethod] =
    useState<ContactMethod>("email");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [whatsappConsent, setWhatsappConsent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const data = JSON.parse(stored);

        if (data.subscribed) {
          return;
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // ظهور الـ popup بعد 3 ثواني
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // تغيير طريقة الاشتراك
  const changeContactMethod = (method: ContactMethod) => {
    setContactMethod(method);
    setMessage("");
  };

  // إغلاق الـ popup
  // لا يتم حفظ أي شيء عند الإغلاق
  const closePopup = () => {
    setIsOpen(false);
    setMessage("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");

    // =========================
    // EMAIL
    // =========================

    if (contactMethod === "email") {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail) {
        setMessage("من فضلك أدخل بريدك الإلكتروني.");
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch("/api/newsletter", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            contactMethod: "email",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.message || "حدث خطأ، حاول مرة أخرى."
          );
          return;
        }

        // حفظ الاشتراك
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            subscribed: true,
            contactMethod: "email",
            email: cleanEmail,
          })
        );

        setMessage("أهلًا بك في عالم Comfort Keepers.");

        setTimeout(() => {
          setIsOpen(false);
        }, 1800);
      } catch {
        setMessage(
          "حدث خطأ في الاتصال. حاول مرة أخرى."
        );
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    // =========================
    // WHATSAPP
    // =========================

    const cleanPhone = phone.replace(/\s+/g, "").trim();

    if (!cleanPhone) {
      setMessage("من فضلك أدخل رقم WhatsApp.");
      return;
    }

    if (!whatsappConsent) {
      setMessage(
        "يرجى الموافقة على استقبال رسائل Comfort Keepers عبر WhatsApp."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: cleanPhone,
          contactMethod: "whatsapp",
          whatsappOptIn: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "حدث خطأ، حاول مرة أخرى."
        );
        return;
      }

      // حفظ الاشتراك
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          subscribed: true,
          contactMethod: "whatsapp",
          phone: cleanPhone,
          whatsappOptIn: true,
        })
      );

      setMessage("أهلًا بك في عالم Comfort Keepers.");

      setTimeout(() => {
        setIsOpen(false);
      }, 1800);
    } catch {
      setMessage(
        "حدث خطأ في الاتصال. حاول مرة أخرى."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/50
        px-5
        py-6
        backdrop-blur-[2px]
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          closePopup();
        }
      }}
    >
      <div
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-title"
        className="
          relative
          flex
          w-full
          max-w-[620px]
          overflow-hidden
          bg-white
          shadow-2xl
          md:min-h-[200px]
          md:flex-row
        "
      >
        {/* =====================================
            CLOSE BUTTON
        ====================================== */}

        <button
          type="button"
          onClick={closePopup}
          aria-label="إغلاق"
          className="
            absolute
            left-4
            top-4
            z-40
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-white
            text-[#171717]
            shadow-sm
            transition
            hover:bg-[#171717]
            hover:text-white
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M6 6L18 18M18 6L6 18"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* =====================================
            DESKTOP IMAGE
        ====================================== */}

        <div
          className="
            relative
            hidden
            min-h-[500px]
            w-[48%]
            shrink-0
            bg-[#e5e0d9]
            md:block
          "
        >
          <Image
            src="https://i.pinimg.com/1200x/23/07/ec/2307ecefd9449912049156830a84f71d.jpg"
            alt="Comfort Keepers"
            fill
            priority
            className="object-cover object-center"
            sizes="400px"
          />
        </div>

        {/* =====================================
            MOBILE BACKGROUND
        ====================================== */}

        <div
          className="
            relative
            min-h-[450px]
            w-full
            md:min-h-[500px]
            md:flex-1
          "
        >
          {/* Background Image */}

          <div className="absolute inset-0 md:hidden">
            <Image
              src="https://i.pinimg.com/1200x/23/07/ec/2307ecefd9449912049156830a84f71d.jpg"
              alt=""
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />

            {/* Dark overlay */}

            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* =====================================
              CONTENT
          ====================================== */}

          <div
            className="
              relative
              z-10
              flex
              min-h-[650px]
              w-full
              items-center
              px-7
              py-14
              sm:px-10
              md:min-h-[500px]
              md:px-12
              md:bg-[#f0ede8]
            "
          >
            <div className="w-full">

              {/* Brand */}

              <p
                className="
                  text-[9px]
                  tracking-[0.35em]
                  text-white/75
                  md:text-black/40
                "
              >
                COMFORT KEEPERS
              </p>

              {/* Title */}

              <h2
                id="newsletter-title"
                className="
                  mt-5
                  font-serif
                  text-[34px]
                  leading-[1.25]
                  text-white
                  sm:text-[40px]
                  md:text-[#171717]
                "
              >
                عالمك يبدأ هنا
              </h2>

              {/* Description */}

              <p
                className="
                  mt-5
                  max-w-md
                  text-sm
                  leading-8
                  text-white/85
                  md:text-black/55
                "
              >
                كن أول من يكتشف إصداراتنا الجديدة،
                اختياراتنا الخاصة، والعروض التي نحتفظ بها
                لمشتركينا.
              </p>

              {/* =====================================
                  CONTACT METHOD
              ====================================== */}

              <div className="mt-7">

                <p
                  className="
                    mb-3
                    text-xs
                    text-white/80
                    md:text-black/50
                  "
                >
                  اختر الطريقة المناسبة لك
                </p>

                <div className="grid grid-cols-2 gap-2">

                  {/* Email */}

                  <button
                    type="button"
                    onClick={() =>
                      changeContactMethod("email")
                    }
                    className={`
                      flex
                      h-11
                      items-center
                      justify-center
                      gap-2
                      border
                      text-xs
                      transition
                      ${
                        contactMethod === "email"
                          ? "border-white bg-white text-[#171717] md:border-[#171717] md:bg-[#171717] md:text-white"
                          : "border-white/40 bg-white/10 text-white hover:bg-white/20 md:border-black/15 md:bg-white md:text-[#171717] md:hover:bg-black/5"
                      }
                    `}
                  >
                    {/* Email Icon */}

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M4 6h16v12H4z"
                        strokeLinejoin="round"
                      />

                      <path
                        d="m4 7 8 6 8-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    البريد 
                  </button>

                  {/* WhatsApp */}

                  <button
                    type="button"
                    onClick={() =>
                      changeContactMethod("whatsapp")
                    }
                    className={`
                      flex
                      h-11
                      items-center
                      justify-center
                      gap-2
                      border
                      text-xs
                      transition
                      ${
                        contactMethod === "whatsapp"
                          ? "border-white bg-white text-[#171717] md:border-[#171717] md:bg-[#171717] md:text-white"
                          : "border-white/40 bg-white/10 text-white hover:bg-white/20 md:border-black/15 md:bg-white md:text-[#171717] md:hover:bg-black/5"
                      }
                    `}
                  >
                    {/* WhatsApp Icon */}

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M8.5 8.5c.3-.5.6-.5.9-.5h.4c.2 0 .4.1.5.4l.6 1.4c.1.2.1.4-.1.6l-.5.6c.7 1.2 1.4 1.8 2.7 2.4l.6-.7c.2-.2.4-.2.7-.1l1.3.6c.2.1.3.3.3.5 0 .5-.2 1-.6 1.2-.4.3-1 .3-1.5.1-2.9-.9-5.1-3.1-6-5.5-.2-.5-.1-.9.1-1.2Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    WhatsApp
                  </button>
                </div>
              </div>

              {/* =====================================
                  FORM
              ====================================== */}

              <form
                onSubmit={handleSubmit}
                className="mt-4"
              >

                {/* EMAIL FORM */}

                {contactMethod === "email" && (
                  <>
                    <label
                      htmlFor="newsletter-email"
                      className="sr-only"
                    >
                      البريد الإلكتروني
                    </label>

                    <input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="بريدك الإلكتروني"
                      autoComplete="email"
                      dir="rtl"
                      required
                      className="
                        h-13
                        w-full
                        border
                        border-white/50
                        bg-white/90
                        px-4
                        text-sm
                        text-[#171717]
                        outline-none
                        transition
                        placeholder:text-black/40
                        focus:border-white
                        md:border-black/15
                        md:bg-white
                        md:focus:border-black/50
                      "
                    />
                  </>
                )}

                {/* WHATSAPP FORM */}

                {contactMethod === "whatsapp" && (
                  <>
                    <label
                      htmlFor="newsletter-phone"
                      className="sr-only"
                    >
                      رقم WhatsApp
                    </label>

                    <input
                      id="newsletter-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      placeholder="رقم WhatsApp"
                      autoComplete="tel"
                      dir="ltr"
                      required
                      className="
                        h-13
                        w-full
                        border
                        border-white/50
                        bg-white/90
                        px-4
                        text-sm
                        text-[#171717]
                        outline-none
                        transition
                        placeholder:text-black/40
                        focus:border-white
                        md:border-black/15
                        md:bg-white
                        md:focus:border-black/50
                      "
                    />

                    {/* WhatsApp Consent */}

                    <label
                      className="
                        mt-3
                        flex
                        cursor-pointer
                        items-start
                        gap-2
                        text-[10px]
                        leading-5
                        text-white/85
                        md:text-black/50
                      "
                    >
                      <input
                        type="checkbox"
                        checked={whatsappConsent}
                        onChange={(e) =>
                          setWhatsappConsent(
                            e.target.checked
                          )
                        }
                        className="
                          mt-1
                          h-3.5
                          w-3.5
                          shrink-0
                          accent-[#171717]
                        "
                      />

                      <span>
                        أوافق على استقبال رسائل
                        Comfort Keepers والعروض
                        والتحديثات عبر WhatsApp.
                      </span>
                    </label>
                  </>
                )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (contactMethod === "whatsapp" &&
                      !whatsappConsent)
                  }
                  className="
                    mt-3
                    flex
                    h-13
                    w-full
                    items-center
                    justify-center
                    bg-[#171717]
                    text-sm
                    text-white
                    transition
                    hover:bg-black
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {isSubmitting
                    ? "جاري الاشتراك..."
                    : "انضم الآن"}
                </button>
              </form>

              {/* =====================================
                  MESSAGE
              ====================================== */}

              {message && (
                <p
                  className="
                    mt-4
                    text-center
                    text-xs
                    leading-6
                    text-white
                    md:text-black/55
                  "
                >
                  {message}
                </p>
              )}

              {/* =====================================
                  SMALL TEXT
              ====================================== */}

              {!message && (
                <p
                  className="
                    mt-5
                    text-center
                    text-[10px]
                    leading-6
                    text-white/75
                    md:text-black/35
                  "
                >
                  نعدك برسائل قليلة، لكن تستحق أن تُفتح.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}