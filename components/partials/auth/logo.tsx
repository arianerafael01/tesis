'use client'
import Image from 'next/image';
import { useTheme } from "next-themes";

const Logo = () => {
    const { theme: mode } = useTheme();
  return (
    <div>
      <Image
        src="/images/institutional-logo.png"
        alt="Instituto Técnico Etchegoyen"
        width={144}
        height={144}
        className="w-36"
      />
    </div>
  );
}

export default Logo;