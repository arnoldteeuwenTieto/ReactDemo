# Shared GSI buttons

Genuine action buttons opt in with `gsi-button`. Its visual reference is
Innledning's “Gå til rapporteringen” button: the existing action blue, white text,
1px border, the existing button-radius token, and weight 600.

`src/styles/theme.css` defines the `--button-*` state tokens;
`src/styles/buttons.css` consumes them. Component classes retain their placement,
padding, minimum heights and icon spacing. Where an existing zero-width border was
replaced by a 1px border, padding was compensated to preserve the control's size.
The fixed 44px help buttons and existing introduction/pagination heights remain.

```tsx
<button className="gsi-button existing-sizing-class" type="button" disabled={busy}>
  Action label
</button>
```

| State | Token sources / treatment | Measured text contrast |
| --- | --- | ---: |
| Normal | `--action` blue / `--surface` text and blue border | 5.86:1 |
| Hover | `--surface` background / `--action` text and border | 5.86:1 |
| Active while pressed | Darker blue derived with `color-mix` from existing `--action` and `--text`; white text | 6.62:1 |
| Disabled | Existing `--farge-stalblaa` muted grey-blue fill and `--text`; no opacity reduction or hover/active effect | 7.64:1 |
| Keyboard focus | 3px contrasting outline and an inset light ring for clipped/inset controls; white outline on blue surfaces | Check against the owning surface; dark on white 5.77:1, white on blue 5.86:1 |

Colors switch immediately. Fading foreground and background together briefly
reduces contrast during their crossover, so only the supplementary focus shadow
can transition (120ms). With `prefers-reduced-motion: reduce`, transitions are off.
Disabled controls never transition. There are no layout or size animations.

This applies to open-report/reset actions, Forrige/Neste, introduction actions,
the help drawer's full-width close action and save retries. It does **not** apply
to section-menu items or the menu toggle, language controls, table sorting headers,
or icon-only question-help/drawer-close controls. Those keep their original scoped
styles from commit `2cbb8be`, including active/inactive language colors, selected
section weight and table-header appearance. A small inset light keyboard-focus
ring is retained on language controls so selected blue buttons remain identifiable.
Native semantics, `aria-pressed`, `aria-current` and disabled attributes are unchanged.

`Nullstill filtre` keeps its action appearance and receives the dedicated
`filter-reset-button` sizing class (`padding: 6px 14px`). Its existing flex placement
and reset handler are unchanged. No global selector gives all HTML buttons the
action appearance; `gsi-button` is exclusively opt-in.

Do not use this class on links, dropdowns, status badges, disclosures or other
non-button elements. Their existing appearance and behavior remain unchanged.
Keep future component-specific rules limited to sizing/placement rather than
reintroducing conflicting button colors or borders.

Verification lives in `e2e/button-styles.spec.ts`, the existing header contrast and
keyboard tests, and the full axe/functional regressions. The initial color-fade
implementation failed an existing contrast assertion (1.09:1 mid-transition);
the transition was corrected in the stylesheet, not suppressed in the test.

Final verification (1 November 2026): **98 Playwright tests passed (1.8m)**,
including 24 axe scans and the production build. `npm run lint` also passed.
After the targeted specialized-control restoration, all **98 tests passed again
(1.9m)**, including original menu/language/sort styling and the increased reset padding.
