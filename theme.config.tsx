import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import Image from 'next/image';

const config: DocsThemeConfig = {
  logo: (
    <span className=" inline-flex gap-2.5 items-center">
      <Image src="/images/institutional-logo.png" alt="Instituto Etchegoyen" width={32} height={32} className="h-8 w-8" />
      <span className="  text-lg font-bold text-default ">Instituto Etchegoyen</span>
    </span>
  ),
  project: {
    link: "https://github.com/shuding/nextra",
  },
  banner: {
    key: "1.0-release",
    text: (
      <a href="/dashboard" target="_blank">
        🎉 Instituto Técnico Etchegoyen
      </a>
    ),
  },
  footer: {
    text: (
      <span>
        {new Date().getFullYear()} ©{" "}
        <a href="https://codeshaper.net/" target="_blank">
          CodeShaper
        </a>
        .
      </span>
    ),
  },
  themeSwitch: {
    useOptions() {
      return {
        light: 'Light',
        dark: 'Dark',
        system: 'System', 
      };
    },
  },
  useNextSeoProps() {
    return {
      titleTemplate: "%s – Instituto Etchegoyen",
    };
  },
};

export default config