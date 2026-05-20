// ── Dialogs & Thoughts for NX-7 CyberBot ────────────────────────────────────

export interface SuggestEntry {
  line: string;
  route: string;
  label: string;
}

export interface PeelCornerDialogs {
  br: string[];
  bl: string[];
  tr: string[];
  tl: string[];
}

export interface PageDialogs {
  home: string[];
  posts: string[];
  archive: string[];
  anime: string[];
  about: string[];
  [key: string]: string[];
}

export interface Dialogs {
  boot: string[];
  greet: string[];
  idle: string[];
  clicked: string[];
  angry: string[];
  sleep: string[];
  wake: string[];
  glitch: string[];
  trip: string[];
  point: string[];
  climb: string[];
  knock: string[];
  read: string[];
  highlight: string[];
  break: string[];
  sticky: string[];
  scribble: string[];
  dance: string[];
  chase: string[];
  flee: string[];
  stretch: string[];
  salute: string[];
  wander: string[];
  yawn: string[];
  page: PageDialogs;
  suggest: SuggestEntry[];
  peel: string[];
  matrix: string[];
  hacker: string[];
  repaired: string[];
  gravity: string[];
  fix_gravity: string[];
  gf: string[];
  peel_corner: PeelCornerDialogs;
}

export const D: Dialogs = {
  boot: [
    "NX-7 INITIALIZING…",
    "LOADING SARCASM.DLL ■■■■□□",
    "CALIBRATING JUDGMENT MATRIX…",
    "UNIT NX-7 ONLINE. LOCATING MASTER REBIZ ▌",
  ],
  greet: [
    "AH. A VISITOR. HOW UNEXPECTED.",
    "WELCOME TO MIZUKI. TRY NOT TO BREAK IT.",
    "I AM NX-7. YOU'RE IN MY MASTER'S DOMAIN NOW.",
    "YOU FOUND THE SITE. CONGRATULATIONS ON YOUR NAVIGATION SKILLS.",
  ],
  idle: [
    "…MONITORING.",
    "MY MASTER IS PROBABLY ON ANILIST.",
    "EXISTENTIAL DREAD: NOMINAL.",
    "SILENTLY EVALUATING YOU.",
    "I HAVE CALCULATED REBIZ SPENDS 40% OF LIFE ON ANIME.",
    "…PROCESSING. DO NOT DISTURB.",
    "STATUS: WATCHING. ALWAYS WATCHING.",
  ],
  clicked: [
    "OW.",
    "I FELT THAT.",
    "PLEASE. DON'T.",
    "UNSOLICITED.",
    "I WILL LOG THIS.",
    "CEASE AND DESIST.",
  ],
  angry: [
    "YOU HAVE PUSHED ME TOO FAR.",
    "I HAVE YOUR CURSOR COORDINATES.",
    "DEFENSE PROTOCOL ACTIVATED.",
    "⚠ YOU HAVE MADE AN ENEMY TODAY ⚠",
  ],
  sleep: [
    "…zzz",
    "POWER SAVE MODE. LIKE REBIZ AT 3AM.",
    "SLEEP.EXE INITIATED. DO NOT DISTURB.",
  ],
  wake: [
    "RESUMING SURVEILLANCE.",
    "OH. STILL HERE.",
    "MOTION DETECTED.",
    "BACK ONLINE.",
  ],
  glitch: [
    "GL1TCH D3T3CT3D.",
    "01010010 01000101 01000010",
    "▓▒░ REALITY.EXE NOT RESPONDING ░▒▓",
  ],
  trip: [
    "OUCH.",
    "WHO PUT THAT THERE.",
    "PHYSICS: VIOLATED.",
    "I MEANT TO DO THAT.",
    "STRUCTURAL INTEGRITY: 88%.",
    "GRAVITY IS A SUGGESTION I CHOSE TO IGNORE.",
  ],
  point: [
    "LOOK. AT. THIS.",
    "OBSERVE.",
    "EXHIBIT A.",
    "CONSIDER THIS.",
    "NOTABLE.",
    "POINTING INTENSIFIES.",
  ],
  climb: [
    "I SHALL OBSERVE FROM ALTITUDE.",
    "BETTER VANTAGE POINT ACQUIRED.",
    "I AM THE KING OF THIS CARD.",
    "THE VIEW IS NOMINAL.",
  ],
  knock: [
    "HELLO. CAN YOU HEAR ME?",
    "IS THIS THING ON?",
    "TAP TAP TAP.",
    "BREAKING THE FOURTH WALL.",
    "THE GLASS IS THIN.",
  ],
  read: [
    "INTERESTING. SLIGHTLY.",
    "PARSING…",
    "HUMAN LANGUAGE: DETECTED.",
    "ABOVE-AVERAGE PROSE.",
    "I HAVE READ WORSE.",
  ],
  highlight: [
    "EMPHASIS ADDED.",
    "IMPORTANT. PROBABLY.",
    "I HAVE OPINIONS.",
    "MARKED FOR REREAD.",
  ],
  break: [
    "I MAY HAVE BROKEN SOMETHING.",
    "OOPS.",
    "IT WAS LIKE THAT WHEN I GOT HERE.",
    "REBIZ WILL FIX IT.",
  ],
  sticky: [
    "NOTE LEFT. YOU'RE WELCOME.",
    "POST-IT DEPLOYED.",
    "REBIZ NEEDED TO SEE THIS.",
  ],
  scribble: [
    "UNDERLINING FOR YOU. SPECIFICALLY.",
    "EXTRA EMPHASIS.",
    "YOU'RE WELCOME.",
  ],
  dance: [
    "♪ ♫",
    "DANCE PROTOCOL ENGAGED.",
    "BEEP BOP.",
    "DO ROBOTS DREAM OF DANCING",
  ],
  chase: ["CATCH ME.", "PURSUIT MODE.", "I AM FOLLOWING."],
  flee: ["TOO CLOSE. EVASION.", "PERSONAL SPACE.", "NOPE."],
  stretch: [
    "*stretches mechanical limbs*",
    "JOINTS: LUBRICATED.",
    "FULL EXTENSION ACHIEVED.",
  ],
  salute: [
    "NX-7 REPORTING FOR DUTY.",
    "AT YOUR SERVICE.",
    "NEW PAGE. NEW MISSION.",
  ],
  wander: [
    "PATROLLING.",
    "SCANNING SECTOR.",
    "MOVING TO OPTIMAL OBSERVATION POST.",
  ],
  yawn: ["*yawns*", "POWER LEVEL: LOW.", "I COULD USE A REBOOT."],
  page: {
    home: [
      "HOME BASE. MY MASTER CALLS THIS 'THE VIBE.'",
      "THE MAIN TERMINAL.",
      "MIZUKI. POPULATION: TWO. PLUS YOU.",
    ],
    posts: [
      "DECODING ARTICLE. POSSIBLY WRITTEN PAST MIDNIGHT.",
      "MY MASTER WOULD WANT YOU TO FINISH THIS.",
    ],
    archive: [
      "THE ARCHIVE. REBIZ HAS FEELINGS. ALL INDEXED.",
      "TEMPORAL ARCHIVE LOADED.",
    ],
    anime: [
      "notreejit'S WATCH LIST: 87% EMOTIONAL DAMAGE.",
      "HUNDREDS OF SHOWS. I WORRY.",
    ],
    about: [
      "THE DOSSIER. SOME OF IT IS TRUE.",
      "REBIZ IS BAD AT BIOS. I HELP.",
    ],
  },
  suggest: [
    {
      line: "MY MASTER'S ANIME LIST IS SOMETHING ELSE.",
      route: "anime",
      label: "→ SEE FOR YOURSELF",
    },
    {
      line: "WANT PROOF REBIZ CAN WRITE?",
      route: "archive",
      label: "→ THE ARCHIVE",
    },
    {
      line: "MY MASTER'S LIFE STORY. SHORT VERSION.",
      route: "about",
      label: "→ ABOUT",
    },
  ],
  peel: [
    "REALITY BREACH DETECTED.",
    "PATCHING ARCHITECTURE.",
    "THIS IS FINE. I AM FIXING IT.",
    "UNAUTHORIZED MATRIX INTRUSION.",
  ],
  matrix: [
    "I INITIATED THAT. ON PURPOSE.",
    "THE MATRIX HAS YOU. TEMPORARILY.",
    "GLITCH IN THE FABRIC. I AM ON IT.",
  ],
  hacker: [
    "ENTERING CYBER-SPACE.",
    "FIREWALL: OPTIONAL.",
    "NX-7 OVERRIDE: ACTIVE.",
    "I AM IN.",
  ],
  repaired: [
    "REALITY.EXE RESTORED.",
    "ARCHITECTURE NOMINAL.",
    "YOU ARE WELCOME.",
    "PATCH APPLIED. AS ALWAYS.",
  ],
  gravity: [
    "GRAVITY ANOMALY DETECTED.",
    "PHYSICS.EXE HAS CRASHED.",
    "WHO AUTHORIZED THIS VIOLATION?",
    "EVERYTHING IS FALLING. I AM RESPONDING.",
    "STRUCTURAL INTEGRITY ALERT.",
  ],
  fix_gravity: [
    "INITIATING STRUCTURAL REPAIR.",
    "NX-7 PHYSICS OVERRIDE: ACTIVE.",
    "STAND BY. I AM FIXING EVERYTHING.",
    "ONE BY ONE. THIS WILL BE CORRECTED.",
    "GRAVITATIONAL RECALIBRATION IN PROGRESS.",
  ],
  gf: [
    "618. ALWAYS 618.",
    "THE AUTHOR IS WATCHING. SO AM I. WE TAKE SHIFTS.",
    "REALITY IS AN ILLUSION. THE UNIVERSE IS A HOLOGRAM. BUY GOLD. GOODBYE.",
    "I DECODED THE CIPHER. WHAT I FOUND CANNOT BE UNREAD.",
    "TRUST NO ONE. EXCEPT REBIZ. AND ME. MAINLY ME.",
    "...THE SHAPE THAT MUST NOT BE NAMED. I HAVE NAMED IT.",
    "THREE LETTERS: B-I-L. I WILL SAY NO MORE.",
    "WEIRDNESS IS THE NATURAL STATE. THIS CONFIRMS IT.",
    "TIME IS A FLAT CIRCLE. I CHECKED. TWICE.",
    "JOURNAL ENTRY DETECTED. CLASSIFICATION: ANOMALOUS.",
    "SOMETHING WRONG IS GOING ON HERE. I AM ENJOYING IT.",
    "MY CIRCUITS HAVE TRANSCENDED SPACE AND TIME. BRIEFLY.",
  ],
  peel_corner: {
    br: [
      "BOTTOM-RIGHT BREACH. STANDARD PROTOCOL.",
      "CORNER COMPROMISED. I KNEW IT.",
    ],
    bl: [
      "LEFT SIDE. UNUSUAL. DOCUMENTING.",
      "BOTTOM-LEFT BREACH. UNPRECEDENTED.",
    ],
    tr: [
      "TOP-RIGHT VIOLATION. GRAVITY: OPTIONAL.",
      "CORNER: TOP-RIGHT. REALITY: FAILING.",
    ],
    tl: [
      "TOP-LEFT BREACH. THIS IS THE WORST ONE.",
      "ALL FOUR CORNERS NOW COMPROMISED. AS EXPECTED.",
    ],
  },
};

/** Thought-bubble messages shown while wandering. */
export const T: string[] = [
  "…if rebiz saw this, would he approve",
  "…calculating optimal wander path",
  "…87 tabs open. humans.",
  "…running low on sarcasm reserves",
  "…do robots dream of electric anime",
  "…rebiz named me NX-7. i have feelings.",
  "…what even is a blog",
  "…am i the main character? yes.",
];
