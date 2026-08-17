//CONFIGURACION
export const API_BASE = '';
export const ASSISTANT_NAME = 'Kit';

export const RESTART_DELAY_MS = 250;
export const SPEECH_PULSE_INTERVAL_MS = 170;
export const WORD_DELAY_MS = 380;
export const WORD_FADE_DELAY_MS = 650;
export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const PERSISTENT_KEY = 'holoprojector_conversation_history';
export const SESSION_MODE_KEY = 'holoprojector_mode';
export const SESSION_VIEW_KEY = 'holoprojector_view_mode';
export const SESSION_PALETTE_KEY = 'holoprojector_palette';
export const SESSION_THEME_KEY = 'holoprojector_theme';

export const TONE_VOICE = {
  question:   { pitch: 1.25, rate: 1.0  },
  affirmation:{ pitch: 1.2,  rate: 1.05 },
  sarcasm:    { pitch: 0.95, rate: 0.95 },
  confused:   { pitch: 1.35, rate: 1.1  },
  negative:   { pitch: 0.9,  rate: 0.9  },
  neutral:    { pitch: 1.15, rate: 1.0  },
  thinking:   { pitch: 1.0,  rate: 1.0  }
};
