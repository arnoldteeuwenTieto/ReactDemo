import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'
export function SchoolyardIllustration() {
  useTranslation('ui')
  return (
    <svg className="schoolyard-illustration" viewBox="0 0 560 420" role="img" aria-label={ui("Illustrasjon av en norsk skole med trær, husker og en skolegård")}>
      <g stroke="#667D79" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M37 281C15 216 40 96 136 60C232 24 305 56 370 42C477 20 548 112 522 218L510 310Z" fill="#EFF6F3" stroke="none" />
        <path d="M28 306Q145 272 275 294T531 301L524 376Q290 412 34 372Z" fill="#DEF2E7" stroke="none" />
        <path d="M139 304L142 155L359 153L363 303Z" fill="#F2E6D6" />
        <path d="M124 156L249 76L376 154Z" fill="#BAC6D8" />
        <path d="M136 158L250 87L365 157" fill="none" />
        <path d="M169 116L168 79L192 79L193 101" fill="#D8B5A5" />
        <path d="M229 303L230 240L271 239L273 304" fill="#809AAB" />
        <path d="M250 242L251 301M259 274L261 274" fill="none" />
        <path d="M219 237L282 236L276 226L226 227Z" fill="#BAC6D8" />
        {[174, 287].map(x => <g key={x}>
          <path d={`M${x} 183l37 -1l1 34l-39 1Z`} fill="#DCE5F3" />
          <path d={`M${x + 18} 184v31m-17 -15h35`} fill="none" />
          <path d={`M${x} 244l37 1l-1 34l-37 -1Z`} fill="#DCE5F3" />
          <path d={`M${x + 18} 246v31m-17 -16h35`} fill="none" />
        </g>)}
        <path d="M225 188L276 188L275 208L225 209Z" fill="#DEF2E7" />
        <text x="250" y="202" textAnchor="middle" stroke="none" fill="#4E6689" fontSize="12" fontFamily="Segoe UI, sans-serif" fontWeight="600">{ui("SKOLE")}</text>
        <path d="M224 306L275 306L295 325L206 325Z" fill="#D6DDDB" />
        <path d="M236 326Q255 348 289 375" fill="none" stroke="#BAC6B9" strokeWidth="18" />
        <path d="M391 293L410 225L472 226L495 295M411 226L434 294M473 227L451 296" fill="none" />
        <path d="M428 227L427 269M454 228L455 269" fill="none" strokeWidth="2" />
        <path d="M421 270Q441 276 461 270L460 278L423 277Z" fill="#D8B5A5" />
        <path d="M393 338L451 320L487 338L429 357Z" fill="#E7D7B7" />
        <path d="M393 338L395 346L429 365L487 347L487 338M429 357V365" fill="#D8B5A5" />
        <path d="M96 314L98 198M74 252L98 269L121 245" fill="none" strokeWidth="5" />
        <path d="M95 156C68 148 55 174 62 191C40 210 59 241 80 235C93 254 126 245 129 225C156 211 139 178 122 178C121 161 108 153 95 156Z" fill="#BAE1CC" />
        <path d="M487 218L489 153M476 185L489 193" fill="none" strokeWidth="4" />
        <path d="M488 119C467 114 455 135 462 148C444 166 463 189 479 182C493 196 517 181 512 166C529 151 510 127 500 131C499 124 494 120 488 119Z" fill="#C8DACA" />
        <path d="M369 259L370 117" fill="none" />
        <path d="M371 118L399 123L397 145L371 140Z" fill="#C88E86" />
        <path d="M380 121L379 142M371 130L398 135" stroke="#FFFFFF" strokeWidth="7" />
        <path d="M380 121L379 142M371 130L398 135" stroke="#7185A1" strokeWidth="3" />
        <path d="M105 342L132 329L154 340L128 354ZM117 336L141 347M128 331L151 343M114 348L140 336" fill="none" stroke="#FFFFFF" />
        <circle cx="335" cy="343" r="10" fill="#D8B5A5" />
        <path d="M330 336L337 344L330 350M337 344L344 343" fill="none" />
        <path d="M57 341L54 333M60 340L65 331M506 320L505 311M510 320L515 312" fill="none" stroke="#91AD95" />
      </g>
    </svg>
  )
}
