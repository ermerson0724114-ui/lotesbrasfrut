## Packages
jwt-decode | For decoding the JWT token to extract user info and role locally
recharts | For beautiful dashboard charts
lucide-react | Icons for the mobile-first bottom navigation and UI
react-hook-form | Form state management
@hookform/resolvers | Zod validation integration for forms
date-fns | Formatting dates nicely

## Notes
- Tailwind Config: Need to extend font family to support `--font-sans` (Plus Jakarta Sans) and `--font-display` (Outfit).
- Auth Strategy: JWT Bearer token stored in localStorage. All API requests use a custom fetch wrapper to attach this token.
- Mobile First: App is designed with a bottom navigation bar, tailored for mobile screens (max-w-md mx-auto on desktop).
- File Upload: Sample photo capture uses native HTML5 `<input type="file" capture="environment">` with FormData.
