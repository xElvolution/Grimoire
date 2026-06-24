import Image from "next/image";

type LogoMarkProps = {
  size?: number;
  className?: string;
};

export default function LogoMark({ size = 32, className = "" }: LogoMarkProps) {
  return (
    <Image
      src="/grimoire-logo-nav.png"
      alt="Grimoire"
      width={size}
      height={size}
      className={`rounded-lg glow-arcane shrink-0 ${className}`}
      priority
    />
  );
}
