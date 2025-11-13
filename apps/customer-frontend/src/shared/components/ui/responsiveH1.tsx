import React, { useState, useEffect } from "react";

interface ResponsiveH1Props {
  children: React.ReactNode;
  className?: string;
  desktopSize?: string; // ví dụ "48px"
  mobileSize?: string; // ví dụ "32px"
}

const ResponsiveH1: React.FC<ResponsiveH1Props> = ({
  children,
  className = "",
  desktopSize = "48px",
  mobileSize = "28px",
}) => {
  const [fontSize, setFontSize] = useState(desktopSize);

  useEffect(() => {
    const updateFontSize = () => {
      if (window.innerWidth < 768) {
        setFontSize(mobileSize);
      } else {
        setFontSize(desktopSize);
      }
    };

    updateFontSize(); // chạy lần đầu
    window.addEventListener("resize", updateFontSize);
    return () => window.removeEventListener("resize", updateFontSize);
  }, [desktopSize, mobileSize]);

  return (
    <h1
      style={{ fontSize }}
      className={`font-semibold leading-loose ${className}`}
    >
      {children}
    </h1>
  );
};

export default ResponsiveH1;
