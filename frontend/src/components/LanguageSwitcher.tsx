'use client';


import { useRouter, usePathname } from 'next/navigation';

import { useLocale } from 'next-intl';


export function LanguageSwitcher() {

  const locale = useLocale();

