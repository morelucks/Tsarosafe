'use client';


import { useRouter, usePathname } from 'next/navigation';

import { useLocale } from 'next-intl';


export function LanguageSwitcher() {

  const locale = useLocale();

  const router = useRouter();

  const pathname = usePathname();


  const changeLanguage = (newLocale: string) => {

