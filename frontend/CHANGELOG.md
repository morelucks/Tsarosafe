# Changelog

## [Unreleased]

### Fixed
- **Client-side crash on Vercel**: `createAppKit` now wrapped in try/catch so a
  missing or invalid `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` no longer crashes the
  entire app on load. The modal is exported as nullable; consumers must null-check
  before calling modal methods.
- **NavBar connect button**: guarded `open()` call with modal null-check; button
  is disabled with tooltip when wallet modal is unavailable.
- **QueryClient defaults**: added sensible `retry` and `staleTime` defaults to
  prevent excessive refetching on slow connections.
- **Turbopack root warning**: set `turbopack.root` in `next.config.ts` to silence
  the workspace root detection warning on Vercel.

### Changed
- Improved inline documentation across all components and context providers.

### Verified
- Production build passes with `next build --turbopack` ✓
