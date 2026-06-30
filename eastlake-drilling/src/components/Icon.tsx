import React from "react";
import * as Lucide from "lucide-react";

type IconProps = {
  name: string;
  className?: string;
};

export default function Icon({ name, className }: IconProps) {
  const icons = Lucide as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >;
  const Cmp = icons[name] ?? Lucide.Circle;
  return <Cmp className={className} />;
}