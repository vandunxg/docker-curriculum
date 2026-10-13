# Starlight English/Vietnamese Language Switch

## Status

Approved design. This specification covers the UI and routing foundation for switching between English and Vietnamese documentation. It does not translate documentation content.

## Goal

Add an accessible English/Vietnamese language switch to the existing Astro Starlight header. The switch must preserve the current page slug, use `/vi/` for Vietnamese routes, and avoid sending readers to untranslated pages.

## Architecture

- Enable Starlight native i18n with English as the `root` locale and Vietnamese as the `vi` locale.
- Keep English content directly under `starlight/src/content/docs/`.
- Place Vietnamese mirrors under `starlight/src/content/docs/vi/` with matching relative paths.
- Register a custom `LanguageSelect` override in `starlight/astro.config.mjs`.
- The custom selector derives the equivalent locale URL from the current route and checks the available Vietnamese mirror files at build time.
- A Vietnamese option is disabled when the equivalent mirror does not exist. It becomes available automatically when the mirror file is added.
- Preserve Starlight’s native fallback routing as a safety layer, but do not intentionally link users to fallback content from the selector.
- Do not use query strings, localStorage, or client-side replacement of document content.

## UI behavior

- Render the language switch in the existing header controls beside the theme picker.
- Keep it available on mobile without causing header overflow; use Starlight’s mobile footer behavior where appropriate.
- Use a native select-like control with the translate icon and an accessible label.
- Display `English` and `Tiếng Việt` as the locale labels.
- Selecting an available locale navigates to the same document in that locale.
- Preserve URL hash fragments when switching languages.
- English remains available from Vietnamese pages and maps back to the corresponding root slug.
- Unavailable Vietnamese targets are visibly disabled and cannot navigate.
- Match existing light/dark palette tokens, hover states, focus states, and typography.

## Implementation files

- Update `starlight/astro.config.mjs` with locale configuration and the `LanguageSelect` override.
- Add `starlight/src/components/LanguageSelect.astro`.
- Update `starlight/src/styles/design.css` for language control styling and mobile visibility.
- Do not modify Markdown or MDX content in this feature.

## Data flow

1. Starlight builds the root and `vi` locale route spaces.
2. The custom selector receives the current route context from Starlight.
3. The component normalizes the current path and checks whether the corresponding `vi` document exists in the content mirror.
4. It renders locale options with the current locale selected and unavailable targets disabled.
5. Selecting an enabled option changes `window.location.pathname` to the localized route while retaining the hash.

## Accessibility and responsive behavior

- Use a real form control or equivalent keyboard-operable control with an accessible label.
- Preserve visible focus styles.
- Ensure disabled Vietnamese state is exposed to assistive technology.
- Keep the control usable at desktop and mobile breakpoints.
- Do not hide the language control with the existing mobile header CSS.

## Validation

Run `npm run build` from `starlight/`.

Verify the generated site for:

- an English page with a Vietnamese mirror;
- an English page without a Vietnamese mirror;
- a Vietnamese page switching back to English;
- URLs containing hash fragments;
- desktop and mobile header layouts;
- keyboard focus and screen-reader labeling;
- a repository with no Vietnamese documents yet.

## Non-goals

- Translating any documentation.
- Building a language preference cookie or localStorage setting.
- Changing the sidebar content or page copy beyond native locale behavior.
- Replacing the existing theme selector.
