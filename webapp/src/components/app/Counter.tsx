"use client";

import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

export default function Counter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const controls = animate(prev.current, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate(v) {
        node.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
      },
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, decimals, prefix, suffix]);

  return (
    <span ref={ref}>{`${prefix}${value.toFixed(decimals)}${suffix}`}</span>
  );
}
