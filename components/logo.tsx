'use client'
import React from "react";
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useConfig } from "@/hooks/use-config";
import { useMenuHoverConfig } from "@/hooks/use-menu-hover";
import { useMediaQuery } from "@/hooks/use-media-query";



const Logo = () => {
    const [config] = useConfig()
    const [hoverConfig] = useMenuHoverConfig();
    const { hovered } = hoverConfig
    const isDesktop = useMediaQuery('(min-width: 1280px)');

    if (config.sidebar === 'compact') {
        return <Link href="/dashboard/analytics" className="flex gap-2 items-center justify-center">
            <Image
                src="/images/institutional-logo.png"
                alt="Instituto Técnico Etchegoyen"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
            />
        </Link>
    }
    if (config.sidebar === 'two-column' || !isDesktop) return null

    return (
        <Link href="/dashboard/analytics" className="flex gap-2 items-center">
            <Image
                src="/images/institutional-logo.png"
                alt="Instituto Técnico Etchegoyen"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
            />
            {(!config?.collapsed || hovered) && (
                <h1 className="text-lg font-semibold text-default-900">
                    Instituto Técnico Etchegoyen
                </h1>
            )}
        </Link>

    );
};

export default Logo;
