export interface Language {
  code: string; // e.g., 'es', 'fr', 'ja'
  name: string; // e.g., 'Spanish', 'French', 'Japanese'
  nativeName: string; // e.g., 'Español', 'Français', '日本語'
  flag: string; // Emoji character or asset name, e.g., '🇪🇸'
  accentColor: string; // Hex color code for branding/borders
}

export interface Unit {
  id: string; // Unique identifier (e.g., 'es-unit-1')
  languageCode: string; // Foreign key reference to Language.code
  title: string; // Unit title, e.g., 'Basics' or 'Greetings'
  description: string; // Learning description
  order: number; // Order index for ordering units
}

export interface VocabularyItem {
  id: string;
  word: string; // Word in the target language (e.g., 'hola')
  translation: string; // Word in English (e.g., 'hello')
  partOfSpeech?: string; // e.g., 'noun', 'verb', 'adjective', 'expression'
  pronunciation?: string; // e.g., 'OH-lah'
  example?: string; // Example sentence in target language
  exampleTranslation?: string; // Translation of the example sentence
}

export interface PhraseItem {
  id: string;
  phrase: string; // Phrase in the target language (e.g., '¿Cómo estás?')
  translation: string; // Translation in English (e.g., 'How are you?')
  pronunciation?: string; // Pronunciation helper
  context?: string; // Cultural context or grammar tip
}

export type ActivityType =
  | 'multiple_choice'
  | 'translation'
  | 'listening'
  | 'speaking'
  | 'matching_pairs'
  | 'fill_in_blank';

export interface BaseActivity {
  id: string;
  type: ActivityType;
  question: string; // Instruction text (e.g. 'Select the correct translation')
  xpReward: number; // XP points awarded on correct completion
}

export interface MultipleChoiceActivity extends BaseActivity {
  type: 'multiple_choice';
  options: string[]; // Options to display
  correctAnswer: string; // Must match one of the options
  context?: string; // Hint or explanation
}

export interface TranslationActivity extends BaseActivity {
  type: 'translation';
  sentence: string; // Sentence in target language to translate to English, or vice versa
  correctTranslations: string[]; // List of valid answers
  wordBank: string[]; // List of words to choose from (scrambled)
}

export interface ListeningActivity extends BaseActivity {
  type: 'listening';
  textToSpeak: string; // Text to be spoken aloud (TTS)
  options: string[]; // Multi-choice answers
  correctAnswer: string;
}

export interface SpeakingActivity extends BaseActivity {
  type: 'speaking';
  textToSpeak: string; // Text the user must speak (STT)
  translation: string;
}

export interface MatchingPairsActivity extends BaseActivity {
  type: 'matching_pairs';
  pairs: {
    left: string; // Target language word (e.g. 'hola')
    right: string; // Translation (e.g. 'hello')
  }[];
}

export interface FillInBlankActivity extends BaseActivity {
  type: 'fill_in_blank';
  textWithBlank: string; // e.g., 'Hola, ¿cómo ___ tú?' (blank should use standard delimiter like '___')
  options: string[]; // Options to fill the blank
  correctAnswer: string;
}

export type Activity =
  | MultipleChoiceActivity
  | TranslationActivity
  | ListeningActivity
  | SpeakingActivity
  | MatchingPairsActivity
  | FillInBlankActivity;

export interface AITeacherPrompt {
  systemPrompt: string; // System instructions for Stream Vision Agent AI Teacher
  welcomeMessage: string; // Opening line spoken by the teacher
  suggestedTopics: string[]; // Discussion starting options for user
  keyVocabulary: string[]; // Target vocab words for AI teacher to guide the user towards
  keyPhrases: string[]; // Target key phrases for the AI teacher to test
}

export interface Lesson {
  id: string; // Unique ID (e.g., 'es-u1-l1')
  unitId: string; // Foreign key referencing Unit.id
  title: string; // Lesson title (e.g., 'First Steps')
  description: string; // Summary of the lesson
  xp: number; // XP awarded on lesson completion (e.g., 20)
  order: number; // Order index within unit
  goals: string[]; // Brief learning goals (e.g. ["Greet someone", "Introduce yourself"])
  vocabulary: VocabularyItem[]; // Vocabulary introduced/reviewed
  phrases: PhraseItem[]; // Conversational phrases introduced
  activities: Activity[]; // Interactive exercises
  aiTeacherPrompt?: AITeacherPrompt; // Agent metadata for interactive AI sessions
}
