import createMiddleware from 'next-intl/middleware';


export default createMiddleware({

  locales: ['en', 'es', 'pt', 'fr'],

  defaultLocale: 'en'
});

