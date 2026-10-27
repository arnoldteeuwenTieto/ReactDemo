# Power Apps styling review

Reviewed App.css, index.css and all component TSX files. No component CSS files or inline colors exist. All original hex colors differ from the supplied palette; white is also an extension.

Complete original inventory: #143e58, #173c52, #174d6b, #1b5c89, #203442, #215d78, #225d7b, #236445, #496777, #4c6372, #526673, #556370, #586b79, #627381, #657783, #698a9d, #71838e, #71bdba, #795000, #92afbf, #95a8b4, #9db5c3, #a94d00, #c7dce7, #dbe3e8, #dfe9ef, #e5ebef, #e5f3eb, #e7f2f5, #e8f2fa, #e9eef2, #edf0f2, #edf2f5, #f4f6f8, #f5f9fb, #fff2d5.

## Applied decisions

Exact requested tokens live in src/styles/theme.css, imported once globally. Semantic aliases document provisional roles. Dark gray is body text; steel blue 04 is secondary text, links, header, control borders and actions. Question-border color is used for panel/table separators, light gray 02 for page/hover, steel blue 01 for table headers/prototype label, green 01 for selected rows and Udir green for header accents. White card/control surfaces remain an extension. Open buttons use steel blue on hover.

Status badge colors and labels are preserved as extension tokens. React behavior, grid structure, spacing, breakpoints and table scrolling are unchanged. Corners are 8px, desktop h1/h2 are 33px/30px and radios are 32px. Larger radios can increase row height. Mobile heading overrides remain 20px/25px. Segoe UI is explicit for headings and body. Existing 12px text uses the standard token.

## Verify against original screenshots

- Header, buttons, selected rows, table headers, page and card color roles are provisional. Hue names alone do not establish usage.
- Peach controlfill/controlboks could describe validation/control sections rather than ordinary filter inputs. Defined but left unapplied pending evidence. Base steel blue, light gray 01, green 02 and duplicate colors remain available without speculative assignments.
- Compare desktop headings 33px/30px, mobile headings 20px/25px, 32px radios and 8px corners.
- Existing body 16px, forms 14px, table/labels 13px and badges 12px remain for readability and hierarchy. Verify scope of supplied 12px, 13.044px and status-page 10px; the latter two remain available without assigning speculative scope.
- Confirm white surfaces, retained status colors, hover/selection and narrow-screen rendering.

Power Apps font values are initial CSS pixel equivalents for comparison. Power Apps and browser rendering, scaling and line metrics may differ.

## Accessibility

Panel separators are decorative; interactive boundaries use darker steel blue. Global focus uses peach 04 with inset steel blue on sort buttons. Existing status labels, keyboard behavior, skip link and native controls are retained.
