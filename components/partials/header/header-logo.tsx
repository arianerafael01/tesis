'use client'
import React from 'react'
import { Link } from '@/components/navigation'
import Image from 'next/image'
import { useConfig } from '@/hooks/use-config'
import { useMediaQuery } from '@/hooks/use-media-query'

const HeaderLogo = () => {
    const [config] = useConfig();

    const isDesktop = useMediaQuery('(min-width: 1280px)');

    return (
        config.layout === 'horizontal' ? (
            <Link href="/dashboard/analytics" className="flex gap-2 items-center">
                <Image
                    src="/images/institutional-logo.png"
                    alt="Instituto Técnico Etchegoyen"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                />
                <h1 className="text-lg font-semibold text-default-900 lg:block hidden">
                    Instituto Técnico Etchegoyen
                </h1>
            </Link>
        ) :
            !isDesktop && (
                <Link href="/dashboard/analytics" className="flex gap-2 items-center">
                    <Image
                        src="/images/institutional-logo.png"
                        alt="Instituto Técnico Etchegoyen"
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                    />
                    <h1 className="text-lg font-semibold text-default-900 lg:block hidden">
                        Instituto Técnico Etchegoyen
                    </h1>
                </Link>
            )
    )
}

export default HeaderLogo