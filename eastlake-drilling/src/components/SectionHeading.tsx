import React from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  align?: "left" | "center";
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  align = "left",
}) => {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="mt-2 text-3xl md:text-4xl font-bold text-ink">
        {title}
      </h2>
      <div
        className={`section-rule ${align === "center" ? "mx-auto" : ""}`}
      />
    </div>
  );
};

export default SectionHeading;