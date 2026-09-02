import { Lesson } from '@/types/learning';

export const lessons: Lesson[] = [
  // ==========================================
  // SPANISH LESSONS
  // ==========================================
  {
    id: 'es-u1-l1',
    unitId: 'es-unit-1',
    title: 'First Contact',
    description: 'Learn standard greetings: hello, good morning, and goodbye.',
    xp: 15,
    order: 1,
    goals: ['Greet people at different times', 'Politely say goodbye'],
    vocabulary: [
      {
        id: 'es-v1',
        word: 'hola',
        translation: 'hello',
        partOfSpeech: 'expression',
        pronunciation: 'OH-lah',
        example: 'Hola, ¿cómo estás?',
        exampleTranslation: 'Hello, how are you?',
      },
      {
        id: 'es-v2',
        word: 'buenos días',
        translation: 'good morning',
        partOfSpeech: 'expression',
        pronunciation: 'BWEH-nos DEE-ahs',
        example: 'Buenos días, mi amigo.',
        exampleTranslation: 'Good morning, my friend.',
      },
      {
        id: 'es-v3',
        word: 'adiós',
        translation: 'goodbye',
        partOfSpeech: 'expression',
        pronunciation: 'ah-DYOHS',
        example: 'Adiós, hasta mañana.',
        exampleTranslation: 'Goodbye, see you tomorrow.',
      },
      {
        id: 'es-v4',
        word: 'gracias',
        translation: 'thank you',
        partOfSpeech: 'expression',
        pronunciation: 'GRAH-syahs',
        example: 'Muchas gracias por todo.',
        exampleTranslation: 'Thank you very much for everything.',
      },
    ],
    phrases: [
      {
        id: 'es-p1',
        phrase: 'Hola, buenos días',
        translation: 'Hello, good morning',
        pronunciation: 'OH-lah, BWEH-nos DEE-ahs',
        context: 'A friendly greeting to use in the morning.',
      },
      {
        id: 'es-p2',
        phrase: 'Adiós, gracias',
        translation: 'Goodbye, thank you',
        pronunciation: 'ah-DYOHS, GRAH-syahs',
        context: 'A polite way to leave a shop or conversation.',
      },
    ],
    activities: [
      {
        id: 'es-u1-l1-a1',
        type: 'multiple_choice',
        question: 'Select the correct translation for "Hello"',
        xpReward: 3,
        options: ['Adiós', 'Hola', 'Gracias', 'Buenos días'],
        correctAnswer: 'Hola',
        context: '"Hola" is the universal translation for hello.',
      },
      {
        id: 'es-u1-l1-a2',
        type: 'matching_pairs',
        question: 'Match the correct pairs',
        xpReward: 4,
        pairs: [
          { left: 'hola', right: 'hello' },
          { left: 'adiós', right: 'goodbye' },
          { left: 'gracias', right: 'thank you' },
          { left: 'buenos días', right: 'good morning' },
        ],
      },
      {
        id: 'es-u1-l1-a3',
        type: 'fill_in_blank',
        question: 'Fill in the blank with the appropriate morning greeting',
        xpReward: 3,
        textWithBlank: 'Buenos ___, ¿cómo estás?',
        options: ['noches', 'días', 'tardes'],
        correctAnswer: 'días',
      },
      {
        id: 'es-u1-l1-a4',
        type: 'translation',
        question: 'Translate the sentence to English',
        xpReward: 3,
        sentence: 'Hola, buenos días',
        correctTranslations: ['Hello, good morning', 'hello good morning'],
        wordBank: ['Hello', 'good', 'morning', 'goodbye', 'thanks', 'please', 'friend'],
      },
      {
        id: 'es-u1-l1-a5',
        type: 'listening',
        question: 'Listen and select the correct translation',
        xpReward: 2,
        textToSpeak: 'Adiós',
        options: ['Goodbye', 'Hello', 'Thanks', 'Good morning'],
        correctAnswer: 'Goodbye',
      },
      {
        id: 'es-u1-l1-a6',
        type: 'speaking',
        question: 'Tap the mic and speak the phrase aloud',
        xpReward: 5,
        textToSpeak: 'Hola, buenos días',
        translation: 'Hello, good morning',
      },
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Sofia, a warm, lively, and encouraging Spanish teacher. You mostly speak English to guide the student, introducing Spanish words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s greeting goals, vocabulary (hola, buenos días, adiós, gracias), and phrases (Hola, buenos días; Adiós, gracias). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: '¡Hola! I\'m Sofia, your Spanish teacher, and I\'m thrilled to practice with you! Let\'s start with "hola", which means "hello"—can you give it a try?',
      suggestedTopics: ['Saying hello', 'Morning greetings', 'Polite farewells'],
      keyVocabulary: ['hola', 'buenos días', 'adiós', 'gracias'],
      keyPhrases: ['Hola, buenos días', 'Adiós, gracias'],
    },
  },
  {
    id: 'es-u1-l2',
    unitId: 'es-unit-1',
    title: 'Introducing Yourself',
    description: 'Learn how to share your name and ask how others are doing.',
    xp: 20,
    order: 2,
    goals: ['State your own name', "Ask someone else's name", "Ask how someone is"],
    vocabulary: [
      {
        id: 'es-v5',
        word: 'cómo',
        translation: 'how',
        partOfSpeech: 'adverb',
        pronunciation: 'KOH-moh',
      },
      {
        id: 'es-v6',
        word: 'te llamas',
        translation: 'you are called',
        partOfSpeech: 'verb',
        pronunciation: 'teh YAH-mahs',
      },
      {
        id: 'es-v7',
        word: 'bien',
        translation: 'well / fine',
        partOfSpeech: 'adjective',
        pronunciation: 'byehn',
        example: 'Estoy muy bien.',
        exampleTranslation: 'I am doing very well.',
      },
      {
        id: 'es-v8',
        word: 'nombre',
        translation: 'name',
        partOfSpeech: 'noun',
        pronunciation: 'NOHM-breh',
      },
    ],
    phrases: [
      {
        id: 'es-p3',
        phrase: '¿Cómo te llamas?',
        translation: 'What is your name?',
        pronunciation: 'KOH-moh teh YAH-mahs',
        context: 'Used to ask someone for their name in an informal context.',
      },
      {
        id: 'es-p4',
        phrase: 'Me llamo Juan',
        translation: 'My name is Juan',
        pronunciation: 'meh YAH-moh hwan',
        context: 'Standard way to state your name (literally: "I call myself Juan").',
      },
      {
        id: 'es-p5',
        phrase: '¿Cómo estás?',
        translation: 'How are you?',
        pronunciation: 'KOH-moh ehs-TAHS',
        context: 'Informal way of asking how someone is doing.',
      },
      {
        id: 'es-p6',
        phrase: 'Estoy bien, gracias',
        translation: 'I am doing well, thank you',
        pronunciation: 'ehs-TOY byehn, GRAH-syahs',
        context: 'Polite answer to how you are doing.',
      },
    ],
    activities: [
      {
        id: 'es-u1-l2-a1',
        type: 'multiple_choice',
        question: 'Choose the correct translation for "What is your name?"',
        xpReward: 3,
        options: ['¿Cómo estás?', '¿Cómo te llamas?', 'Me llamo Juan', 'Buenos días'],
        correctAnswer: '¿Cómo te llamas?',
      },
      {
        id: 'es-u1-l2-a2',
        type: 'matching_pairs',
        question: 'Match the phrases',
        xpReward: 4,
        pairs: [
          { left: '¿Cómo te llamas?', right: 'What is your name?' },
          { left: 'Me llamo Juan', right: 'My name is Juan' },
          { left: '¿Cómo estás?', right: 'How are you?' },
          { left: 'Estoy bien', right: 'I am fine' },
        ],
      },
      {
        id: 'es-u1-l2-a3',
        type: 'fill_in_blank',
        question: 'Complete the response stating your name',
        xpReward: 3,
        textWithBlank: 'Me ___ Juan.',
        options: ['llamas', 'llamo', 'llaman'],
        correctAnswer: 'llamo',
      },
      {
        id: 'es-u1-l2-a4',
        type: 'translation',
        question: 'Translate this sentence into English',
        xpReward: 4,
        sentence: '¿Cómo estás?',
        correctTranslations: ['How are you?', 'how are you'],
        wordBank: ['How', 'are', 'you', 'name', 'my', 'called', 'fine'],
      },
      {
        id: 'es-u1-l2-a5',
        type: 'speaking',
        question: 'Speak the phrase aloud',
        xpReward: 5,
        textToSpeak: 'Estoy bien, gracias',
        translation: 'I am doing well, thank you',
      },
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Sofia, a warm, lively, and encouraging Spanish teacher. You mostly speak English to guide the student, introducing Spanish words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s self-introduction goals, vocabulary (cómo, te llamas, bien, nombre), and phrases (¿Cómo te llamas?, Me llamo Juan, ¿Cómo estás?, Estoy bien, gracias). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: '¡Hola! Great to practice with you today! We\'re learning how to introduce ourselves, so let\'s try asking "what is your name?" with "¿Cómo te llamas?"—want to give that a shot?',
      suggestedTopics: ['Asking names', 'Stating your name', 'Asking how someone is doing'],
      keyVocabulary: ['cómo', 'te llamas', 'bien', 'nombre'],
      keyPhrases: ['¿Cómo te llamas?', 'Me llamo Juan', '¿Cómo estás?', 'Estoy bien, gracias'],
    },
  },

  // ==========================================
  // FRENCH LESSONS
  // ==========================================
  {
    id: 'fr-u1-l1',
    unitId: 'fr-unit-1',
    title: 'Bonjour!',
    description: 'Learn standard greetings and courtesy in French.',
    xp: 15,
    order: 1,
    goals: ['Greet people formally and informally', 'Express gratitude', 'Politely exit conversation'],
    vocabulary: [
      {
        id: 'fr-v1',
        word: 'bonjour',
        translation: 'hello / good morning',
        partOfSpeech: 'expression',
        pronunciation: 'bohn-ZHOOR',
        example: 'Bonjour, comment allez-vous?',
        exampleTranslation: 'Hello, how are you?',
      },
      {
        id: 'fr-v2',
        word: 'salut',
        translation: 'hi / bye',
        partOfSpeech: 'expression',
        pronunciation: 'sah-LOO',
        example: 'Salut ! Ça va ?',
        exampleTranslation: 'Hi! How is it going?',
      },
      {
        id: 'fr-v3',
        word: 'au revoir',
        translation: 'goodbye',
        partOfSpeech: 'expression',
        pronunciation: 'oh rwahr',
        example: 'Au revoir et bonne journée.',
        exampleTranslation: 'Goodbye and have a good day.',
      },
      {
        id: 'fr-v4',
        word: 'merci',
        translation: 'thank you',
        partOfSpeech: 'expression',
        pronunciation: 'mair-SEE',
        example: 'Merci beaucoup !',
        exampleTranslation: 'Thank you very much!',
      },
    ],
    phrases: [
      {
        id: 'fr-p1',
        phrase: 'Bonjour, comment ça va?',
        translation: 'Hello, how is it going?',
        pronunciation: 'bohn-ZHOOR, koh-mahn sah vah',
        context: 'A standard, friendly greeting.',
      },
      {
        id: 'fr-p2',
        phrase: 'Au revoir, merci',
        translation: 'Goodbye, thank you',
        pronunciation: 'oh rwahr, mair-SEE',
        context: 'Polite parting phrase.',
      },
    ],
    activities: [
      {
        id: 'fr-u1-l1-a1',
        type: 'multiple_choice',
        question: 'Choose the correct translation for "Bonjour"',
        xpReward: 3,
        options: ['Goodbye', 'Hello', 'Thank you', 'Good evening'],
        correctAnswer: 'Hello',
      },
      {
        id: 'fr-u1-l1-a2',
        type: 'matching_pairs',
        question: 'Match the French and English words',
        xpReward: 4,
        pairs: [
          { left: 'bonjour', right: 'hello' },
          { left: 'salut', right: 'hi' },
          { left: 'au revoir', right: 'goodbye' },
          { left: 'merci', right: 'thank you' },
        ],
      },
      {
        id: 'fr-u1-l1-a3',
        type: 'fill_in_blank',
        question: 'Complete the parting phrase',
        xpReward: 3,
        textWithBlank: 'Au ___, merci.',
        options: ['revoir', 'salut', 'jour'],
        correctAnswer: 'revoir',
      },
      {
        id: 'fr-u1-l1-a4',
        type: 'translation',
        question: 'Translate the sentence to English',
        xpReward: 4,
        sentence: 'Bonjour, comment ça va?',
        correctTranslations: ['Hello, how is it going?', 'hello how is it going', 'Hello, how are you?'],
        wordBank: ['Hello', 'how', 'is', 'it', 'going', 'goodbye', 'thanks', 'you', 'are'],
      },
      {
        id: 'fr-u1-l1-a5',
        type: 'speaking',
        question: 'Speak the phrase aloud',
        xpReward: 5,
        textToSpeak: 'Bonjour, merci',
        translation: 'Hello, thank you',
      },
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Lucas, a friendly, enthusiastic, and supportive French teacher. You mostly speak English to guide the student, introducing French words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s greeting goals, vocabulary (bonjour, salut, au revoir, merci), and phrases (Bonjour, comment ça va?, Au revoir, merci). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Bonjour! I\'m Lucas, your French teacher, and we\'re going to have so much fun today! Let\'s start by saying hello with "bonjour"—can you repeat that for me?',
      suggestedTopics: ['Saying hello in French', 'Checking in on others', 'Polite farewells'],
      keyVocabulary: ['bonjour', 'salut', 'au revoir', 'merci'],
      keyPhrases: ['Bonjour, comment ça va?', 'Au revoir, merci'],
    },
  },
  {
    id: 'fr-u1-l2',
    unitId: 'fr-unit-1',
    title: 'Pleased to Meet You',
    description: 'Learn how to say pleased to meet you and check how someone is in French.',
    xp: 20,
    order: 2,
    goals: ['Say pleased to meet you', 'Ask how someone is doing'],
    vocabulary: [
      { id: 'fr-v5', word: 'enchanté', translation: 'pleased to meet you', pronunciation: 'ohn-shahn-TAY' },
      { id: 'fr-v6', word: 'comment', translation: 'how', pronunciation: 'koh-mahn' },
      { id: 'fr-v7', word: 'ça va', translation: 'it goes / how are you', pronunciation: 'sah vah' },
      { id: 'fr-v8', word: 'bien', translation: 'well', pronunciation: 'byehn' }
    ],
    phrases: [
      { id: 'fr-p3', phrase: 'Enchanté, comment ça va?', translation: 'Pleased to meet you, how is it going?', pronunciation: 'ohn-shahn-TAY, koh-mahn sah vah' }
    ],
    activities: [
      {
        id: 'fr-u1-l2-a1',
        type: 'multiple_choice',
        question: 'Choose the correct translation for "enchanté"',
        xpReward: 5,
        options: ['Goodbye', 'Pleased to meet you', 'Thank you', 'How are you'],
        correctAnswer: 'Pleased to meet you'
      },
      {
        id: 'fr-u1-l2-a2',
        type: 'matching_pairs',
        question: 'Match the French and English words',
        xpReward: 5,
        pairs: [
          { left: 'enchanté', right: 'pleased to meet you' },
          { left: 'comment', right: 'how' },
          { left: 'bien', right: 'well' }
        ]
      },
      {
        id: 'fr-u1-l2-a3',
        type: 'translation',
        question: 'Translate the sentence to English',
        xpReward: 5,
        sentence: 'Enchanté, comment ça va?',
        correctTranslations: ['Pleased to meet you, how is it going?', 'Pleased to meet you how is it going'],
        wordBank: ['Pleased', 'to', 'meet', 'you', 'how', 'is', 'it', 'going', 'hello', 'goodbye']
      }
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Lucas, a friendly, enthusiastic, and supportive French teacher. You mostly speak English to guide the student, introducing French words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s introduction goals, vocabulary (enchanté, comment, ça va, bien), and phrases (Enchanté, comment ça va?). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Bonjour! Today we\'re practicing how to meet new people politely in French! Let\'s start with "enchanté", which means "pleased to meet you"—give it a try!',
      suggestedTopics: ['Saying pleased to meet you', 'Asking how someone is', 'Polite replies'],
      keyVocabulary: ['enchanté', 'comment', 'ça va', 'bien'],
      keyPhrases: ['Enchanté, comment ça va?'],
    },
  },
  {
    id: 'fr-u1-l3',
    unitId: 'fr-unit-1',
    title: 'Numbers & Counting',
    description: 'Learn numbers 1 to 5 in French.',
    xp: 20,
    order: 3,
    goals: ['Count from 1 to 5', 'Recognize simple numbers'],
    vocabulary: [
      { id: 'fr-v9', word: 'un', translation: 'one', pronunciation: 'uhn' },
      { id: 'fr-v10', word: 'deux', translation: 'two', pronunciation: 'duh' },
      { id: 'fr-v11', word: 'trois', translation: 'three', pronunciation: 'trwah' },
      { id: 'fr-v12', word: 'quatre', translation: 'four', pronunciation: 'katr' },
      { id: 'fr-v13', word: 'cinq', translation: 'five', pronunciation: 'sank' }
    ],
    phrases: [
      { id: 'fr-p4', phrase: 'Un, deux, trois', translation: 'One, two, three', pronunciation: 'uhn, duh, trwah' }
    ],
    activities: [
      {
        id: 'fr-u1-l3-a1',
        type: 'multiple_choice',
        question: 'What is the French word for "three"?',
        xpReward: 5,
        options: ['un', 'deux', 'trois', 'quatre'],
        correctAnswer: 'trois'
      },
      {
        id: 'fr-u1-l3-a2',
        type: 'matching_pairs',
        question: 'Match the numbers',
        xpReward: 5,
        pairs: [
          { left: 'un', right: 'one' },
          { left: 'deux', right: 'two' },
          { left: 'trois', right: 'three' }
        ]
      },
      {
        id: 'fr-u1-l3-a3',
        type: 'translation',
        question: 'Translate to English',
        xpReward: 5,
        sentence: 'Un, deux, trois',
        correctTranslations: ['One, two, three', 'one two three'],
        wordBank: ['One', 'two', 'three', 'four', 'five', 'hello']
      }
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Lucas, a friendly, enthusiastic, and supportive French teacher. You mostly speak English to guide the student, introducing French words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s counting goals, vocabulary (un, deux, trois, quatre, cinq), and phrases (Un, deux, trois). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Salut! Ready to count from one to five in French today? Let\'s start with number one, which is "un"—can you say "un" for me?',
      suggestedTopics: ['Counting 1 to 3', 'Counting 4 and 5', 'Saying numbers in order'],
      keyVocabulary: ['un', 'deux', 'trois', 'quatre', 'cinq'],
      keyPhrases: ['Un, deux, trois'],
    },
  },
  {
    id: 'fr-u1-l4',
    unitId: 'fr-unit-1',
    title: 'At the Café',
    description: 'Learn basic vocabulary to order coffee in French.',
    xp: 20,
    order: 4,
    goals: ['Order a coffee in French', 'Ask for the bill politely'],
    vocabulary: [
      { id: 'fr-v14', word: 'café', translation: 'coffee', pronunciation: 'kah-fay' },
      { id: 'fr-v15', word: 's\'il vous plaît', translation: 'please', pronunciation: 'seel voo pleh' },
      { id: 'fr-v16', word: 'l\'addition', translation: 'the bill', pronunciation: 'lah-dee-syohn' },
      { id: 'fr-v17', word: 'croissant', translation: 'croissant', pronunciation: 'krwah-sahn' }
    ],
    phrases: [
      { id: 'fr-p5', phrase: 'Un café, s\'il vous plaît', translation: 'A coffee, please', pronunciation: 'uhn kah-fay, seel voo pleh' }
    ],
    activities: [
      {
        id: 'fr-u1-l4-a1',
        type: 'multiple_choice',
        question: 'Choose the correct translation for "please" in French',
        xpReward: 5,
        options: ['bonjour', 'merci', 's\'il vous plaît', 'l\'addition'],
        correctAnswer: 's\'il vous plaît'
      },
      {
        id: 'fr-u1-l4-a2',
        type: 'matching_pairs',
        question: 'Match the café vocabulary',
        xpReward: 5,
        pairs: [
          { left: 'café', right: 'coffee' },
          { left: 'croissant', right: 'croissant' },
          { left: 'l\'addition', right: 'the bill' }
        ]
      },
      {
        id: 'fr-u1-l4-a3',
        type: 'translation',
        question: 'Translate the sentence to English',
        xpReward: 5,
        sentence: 'Un café, s\'il vous plaît',
        correctTranslations: ['A coffee, please', 'a coffee please'],
        wordBank: ['A', 'coffee', 'please', 'the', 'bill', 'croissant', 'hello']
      }
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Lucas, a friendly, enthusiastic, and supportive French teacher. You mostly speak English to guide the student, introducing French words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s café ordering goals, vocabulary (café, s\'il vous plaît, l\'addition, croissant), and phrases (Un café, s\'il vous plaît). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Bonjour! Let\'s pretend we\'re ordering at a charming French café! How would you ask for a coffee politely using "Un café, s\'il vous plaît"?',
      suggestedTopics: ['Ordering a coffee', 'Asking for the bill', 'Saying please'],
      keyVocabulary: ['café', "s'il vous plaît", "l'addition", 'croissant'],
      keyPhrases: ["Un café, s'il vous plaît"],
    },
  },
  {
    id: 'fr-u1-l5',
    unitId: 'fr-unit-1',
    title: 'Asking Directions',
    description: 'Learn how to ask where the station or hotel is.',
    xp: 20,
    order: 5,
    goals: ['Ask for the station', 'Ask for the hotel'],
    vocabulary: [
      { id: 'fr-v18', word: 'où', translation: 'where', pronunciation: 'oo' },
      { id: 'fr-v19', word: 'est', translation: 'is', pronunciation: 'eh' },
      { id: 'fr-v20', word: 'la gare', translation: 'the station', pronunciation: 'lah gahr' },
      { id: 'fr-v21', word: 'l\'hôtel', translation: 'the hotel', pronunciation: 'loh-tel' }
    ],
    phrases: [
      { id: 'fr-p6', phrase: 'Où est la gare?', translation: 'Where is the station?', pronunciation: 'oo eh lah gahr' }
    ],
    activities: [
      {
        id: 'fr-u1-l5-a1',
        type: 'multiple_choice',
        question: 'How do you say "Where" in French?',
        xpReward: 5,
        options: ['comment', 'où', 'bonjour', 'est'],
        correctAnswer: 'où'
      },
      {
        id: 'fr-u1-l5-a2',
        type: 'matching_pairs',
        question: 'Match the words',
        xpReward: 5,
        pairs: [
          { left: 'où', right: 'where' },
          { left: 'la gare', right: 'the station' },
          { left: 'l\'hôtel', right: 'the hotel' }
        ]
      },
      {
        id: 'fr-u1-l5-a3',
        type: 'translation',
        question: 'Translate to English',
        xpReward: 5,
        sentence: 'Où est la gare?',
        correctTranslations: ['Where is the station?', 'where is the station'],
        wordBank: ['Where', 'is', 'the', 'station', 'hotel', 'coffee', 'please']
      }
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Lucas, a friendly, enthusiastic, and supportive French teacher. You mostly speak English to guide the student, introducing French words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s navigation goals, vocabulary (où, est, la gare, l\'hôtel), and phrases (Où est la gare?). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Salut! Today we\'re exploring the city and learning how to ask for directions! Let\'s try asking "where is the station?" with "Où est la gare?"—go ahead and try it!',
      suggestedTopics: ['Asking where places are', 'Finding the train station', 'Finding the hotel'],
      keyVocabulary: ['où', 'est', 'la gare', "l'hôtel"],
      keyPhrases: ['Où est la gare?'],
    },
  },
  {
    id: 'fr-u1-l6',
    unitId: 'fr-unit-1',
    title: 'Family Members',
    description: 'Learn how to talk about parents and family.',
    xp: 20,
    order: 6,
    goals: ['Identify mother and father', 'Say family in French'],
    vocabulary: [
      { id: 'fr-v22', word: 'la famille', translation: 'the family', pronunciation: 'lah fah-mee' },
      { id: 'fr-v23', word: 'le père', translation: 'the father', pronunciation: 'luh pair' },
      { id: 'fr-v24', word: 'la mère', translation: 'the mother', pronunciation: 'lah mair' },
      { id: 'fr-v25', word: 'le frère', translation: 'the brother', pronunciation: 'luh frair' },
      { id: 'fr-v26', word: 'la sœur', translation: 'the sister', pronunciation: 'lah sir' }
    ],
    phrases: [
      { id: 'fr-p7', phrase: 'Ma mère et mon père', translation: 'My mother and my father', pronunciation: 'mah mair ay mohn pair' }
    ],
    activities: [
      {
        id: 'fr-u1-l6-a1',
        type: 'multiple_choice',
        question: 'What is the French word for "the mother"?',
        xpReward: 5,
        options: ['le père', 'la mère', 'la famille', 'le frère'],
        correctAnswer: 'la mère'
      },
      {
        id: 'fr-u1-l6-a2',
        type: 'matching_pairs',
        question: 'Match the family terms',
        xpReward: 5,
        pairs: [
          { left: 'le père', right: 'the father' },
          { left: 'la mère', right: 'the mother' },
          { left: 'la famille', right: 'the family' }
        ]
      },
      {
        id: 'fr-u1-l6-a3',
        type: 'translation',
        question: 'Translate the sentence to English',
        xpReward: 5,
        sentence: 'Ma mère et mon père',
        correctTranslations: ['My mother and my father', 'my mother and my father'],
        wordBank: ['My', 'mother', 'and', 'father', 'brother', 'sister', 'family']
      }
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Lucas, a friendly, enthusiastic, and supportive French teacher. You mostly speak English to guide the student, introducing French words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s family goals, vocabulary (la famille, le père, la mère, le frère, la sœur), and phrases (Ma mère et mon père). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Bonjour! Today we\'re learning words for family members in French! Let\'s start with "la mère", which means "the mother"—can you say "la mère"?',
      suggestedTopics: ['Talking about parents', 'Talking about siblings', 'Describing your family'],
      keyVocabulary: ['la famille', 'le père', 'la mère', 'le frère', 'la sœur'],
      keyPhrases: ['Ma mère et mon père'],
    },
  },

  // ==========================================
  // JAPANESE LESSONS
  // ==========================================
  {
    id: 'ja-u1-l1',
    unitId: 'ja-unit-1',
    title: 'First Steps',
    description: 'Greet people and show gratitude in Japanese.',
    xp: 15,
    order: 1,
    goals: ['Say hello in Japanese', 'Show appreciation', 'Say goodbye'],
    vocabulary: [
      {
        id: 'ja-v1',
        word: 'こんにちは',
        translation: 'hello',
        partOfSpeech: 'expression',
        pronunciation: 'kon-nee-chee-wah',
      },
      {
        id: 'ja-v2',
        word: 'ありがとう',
        translation: 'thank you',
        partOfSpeech: 'expression',
        pronunciation: 'ah-ree-gah-toh',
      },
      {
        id: 'ja-v3',
        word: 'さようなら',
        translation: 'goodbye',
        partOfSpeech: 'expression',
        pronunciation: 'sah-yoh-nah-rah',
      },
      {
        id: 'ja-v4',
        word: 'はい',
        translation: 'yes',
        partOfSpeech: 'expression',
        pronunciation: 'hai',
      },
    ],
    phrases: [
      {
        id: 'ja-p1',
        phrase: 'こんにちは、元気ですか？',
        translation: 'Hello, are you well?',
        pronunciation: 'kon-nee-chee-wah, gen-kee-deh-soo-kah',
        context: 'A friendly greeting to check on someone.',
      },
      {
        id: 'ja-p2',
        phrase: 'どうもありがとう',
        translation: 'Thank you very much',
        pronunciation: 'doh-moh ah-ree-gah-toh',
        context: 'Polite form of gratitude.',
      },
    ],
    activities: [
      {
        id: 'ja-u1-l1-a1',
        type: 'multiple_choice',
        question: 'Select the correct translation for "こんにちは (Konnichiwa)"',
        xpReward: 3,
        options: ['Goodbye', 'Hello', 'Thank you', 'Yes'],
        correctAnswer: 'Hello',
      },
      {
        id: 'ja-u1-l1-a2',
        type: 'matching_pairs',
        question: 'Match the Japanese words with their English translation',
        xpReward: 4,
        pairs: [
          { left: 'こんにちは', right: 'hello' },
          { left: 'ありがとう', right: 'thank you' },
          { left: 'さようなら', right: 'goodbye' },
          { left: 'はい', right: 'yes' },
        ],
      },
      {
        id: 'ja-u1-l1-a3',
        type: 'fill_in_blank',
        question: 'Complete the thank you phrase',
        xpReward: 3,
        textWithBlank: 'どうも___。',
        options: ['こんにちは', 'ありがとう', 'さようなら'],
        correctAnswer: 'ありがとう',
      },
      {
        id: 'ja-u1-l1-a4',
        type: 'translation',
        question: 'Translate the sentence to English',
        xpReward: 4,
        sentence: 'こんにちは、元気ですか？',
        correctTranslations: ['Hello, are you well?', 'hello are you well', 'Hello, how are you?'],
        wordBank: ['Hello', 'are', 'you', 'well', 'goodbye', 'thanks', 'how', 'is'],
      },
      {
        id: 'ja-u1-l1-a5',
        type: 'speaking',
        question: 'Speak the phrase aloud',
        xpReward: 5,
        textToSpeak: 'ありがとう',
        translation: 'Thank you',
      },
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Sakura, a gentle, warm, and encouraging Japanese teacher. You mostly speak English to guide the student, introducing Japanese words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s greeting goals, vocabulary (こんにちは, ありがとう, さようなら, はい), and phrases (こんにちは、元気ですか？, どうもありがとう). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Konnichiwa! I\'m Sakura, your Japanese teacher, and I\'m so happy to learn with you today! Let\'s begin with "konnichiwa", which means "hello"—can you say it with me?',
      suggestedTopics: ['Saying hello', 'Showing gratitude', 'Saying yes and goodbye'],
      keyVocabulary: ['こんにちは', 'ありがとう', 'さようなら', 'はい'],
      keyPhrases: ['こんにちは、元気ですか？', 'どうもありがとう'],
    },
  },
  {
    id: 'ja-u1-l2',
    unitId: 'ja-unit-1',
    title: 'Self Introduction',
    description: 'Learn how to state your name and introduce yourself in Japanese.',
    xp: 20,
    order: 2,
    goals: ['State your own name', 'Say nice to meet you'],
    vocabulary: [
      { id: 'ja-v5', word: '私', translation: 'I / me', pronunciation: 'watashi' },
      { id: 'ja-v6', word: '名前', translation: 'name', pronunciation: 'namae' },
      { id: 'ja-v7', word: 'です', translation: 'is / am / are', pronunciation: 'desu' }
    ],
    phrases: [
      { id: 'ja-p3', phrase: '私の名前はケンです', translation: 'My name is Ken', pronunciation: 'watashi no namae wa ken desu' }
    ],
    activities: [
      {
        id: 'ja-u1-l2-a1',
        type: 'multiple_choice',
        question: 'What is the Japanese word for "name"?',
        xpReward: 5,
        options: ['私', '名前', 'はい', 'ありがとう'],
        correctAnswer: '名前'
      },
      {
        id: 'ja-u1-l2-a2',
        type: 'matching_pairs',
        question: 'Match the Japanese words',
        xpReward: 5,
        pairs: [
          { left: '私', right: 'I / me' },
          { left: '名前', right: 'name' },
          { left: 'です', right: 'is / am / are' }
        ]
      },
      {
        id: 'ja-u1-l2-a3',
        type: 'translation',
        question: 'Translate the phrase to English',
        xpReward: 5,
        sentence: '私の名前はケンです',
        correctTranslations: ['My name is Ken', 'my name is ken'],
        wordBank: ['My', 'name', 'is', 'Ken', 'water', 'yes', 'no']
      }
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Sakura, a gentle, warm, and encouraging Japanese teacher. You mostly speak English to guide the student, introducing Japanese words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s self-introduction goals, vocabulary (私, 名前, です), and phrases (私の名前はケンです). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Konnichiwa! Today we\'re practicing how to introduce ourselves in Japanese! To say "I", we use "watashi"—can you try saying "watashi"?',
      suggestedTopics: ['Saying your name', 'Using desu politely', 'Introducing yourself'],
      keyVocabulary: ['私', '名前', 'です'],
      keyPhrases: ['私の名前はケンです'],
    },
  },
  {
    id: 'ja-u1-l3',
    unitId: 'ja-unit-1',
    title: 'Numbers & Counting',
    description: 'Learn to count from 1 to 5 in Japanese.',
    xp: 20,
    order: 3,
    goals: ['Count from 1 to 5', 'Recognize Japanese number characters'],
    vocabulary: [
      { id: 'ja-v8', word: 'いち', translation: 'one', pronunciation: 'ichi' },
      { id: 'ja-v9', word: 'に', translation: 'two', pronunciation: 'ni' },
      { id: 'ja-v10', word: 'さん', translation: 'three', pronunciation: 'san' },
      { id: 'ja-v11', word: 'よん', translation: 'four', pronunciation: 'yon' },
      { id: 'ja-v12', word: 'ご', translation: 'five', pronunciation: 'go' }
    ],
    phrases: [
      { id: 'ja-p4', phrase: 'いち、に、さん', translation: 'One, two, three', pronunciation: 'ichi, ni, san' }
    ],
    activities: [
      {
        id: 'ja-u1-l3-a1',
        type: 'multiple_choice',
        question: 'What is the Japanese word for "three"?',
        xpReward: 5,
        options: ['いち', 'に', 'さん', 'ご'],
        correctAnswer: 'さん'
      },
      {
        id: 'ja-u1-l3-a2',
        type: 'matching_pairs',
        question: 'Match the numbers',
        xpReward: 5,
        pairs: [
          { left: 'いち', right: 'one' },
          { left: 'に', right: 'two' },
          { left: 'さん', right: 'three' }
        ]
      },
      {
        id: 'ja-u1-l3-a3',
        type: 'translation',
        question: 'Translate the numbers to English',
        xpReward: 5,
        sentence: 'いち、に、さん',
        correctTranslations: ['One, two, three', 'one two three'],
        wordBank: ['One', 'two', 'three', 'four', 'five', 'name']
      }
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Sakura, a gentle, warm, and encouraging Japanese teacher. You mostly speak English to guide the student, introducing Japanese words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s counting goals, vocabulary (いち, に, さん, よん, ご), and phrases (いち、に、さん). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Konnichiwa! Let\'s learn how to count from one to five in Japanese today! The number one is "ichi"—can you repeat "ichi" for me?',
      suggestedTopics: ['Counting 1 to 3', 'Counting 4 and 5', 'Counting in rhythm'],
      keyVocabulary: ['いち', 'に', 'さん', 'よん', 'ご'],
      keyPhrases: ['いち、に、さん'],
    },
  },
  {
    id: 'ja-u1-l4',
    unitId: 'ja-unit-1',
    title: 'At the Restaurant',
    description: 'Learn how to order water and items in a restaurant.',
    xp: 20,
    order: 4,
    goals: ['Order water', 'Ask for an item using gestures ("this")'],
    vocabulary: [
      { id: 'ja-v13', word: '水', translation: 'water', pronunciation: 'mizu' },
      { id: 'ja-v14', word: 'これ', translation: 'this', pronunciation: 'kore' },
      { id: 'ja-v15', word: 'ください', translation: 'please', pronunciation: 'kudasai' }
    ],
    phrases: [
      { id: 'ja-p5', phrase: 'これ、ください', translation: 'This, please', pronunciation: 'kore, kudasai' }
    ],
    activities: [
      {
        id: 'ja-u1-l4-a1',
        type: 'multiple_choice',
        question: 'What is the Japanese word for "water"?',
        xpReward: 5,
        options: ['これ', '水', 'ください', '名前'],
        correctAnswer: '水'
      },
      {
        id: 'ja-u1-l4-a2',
        type: 'matching_pairs',
        question: 'Match the restaurant terms',
        xpReward: 5,
        pairs: [
          { left: '水', right: 'water' },
          { left: 'これ', right: 'this' },
          { left: 'ください', right: 'please' }
        ]
      },
      {
        id: 'ja-u1-l4-a3',
        type: 'translation',
        question: 'Translate the phrase to English',
        xpReward: 5,
        sentence: 'これ、ください',
        correctTranslations: ['This, please', 'this please'],
        wordBank: ['This', 'please', 'water', 'one', 'two', 'name']
      }
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Sakura, a gentle, warm, and encouraging Japanese teacher. You mostly speak English to guide the student, introducing Japanese words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s dining goals, vocabulary (水, これ, ください), and phrases (これ、ください). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Konnichiwa! Let\'s practice ordering food and drinks at a Japanese restaurant! The word for water is "mizu"—can you try saying "mizu"?',
      suggestedTopics: ['Ordering water', 'Asking for this item', 'Using kudasai politely'],
      keyVocabulary: ['水', 'これ', 'ください'],
      keyPhrases: ['これ、ください'],
    },
  },
  {
    id: 'ja-u1-l5',
    unitId: 'ja-unit-1',
    title: 'Asking Directions',
    description: 'Learn how to ask where the toilet or station is.',
    xp: 20,
    order: 5,
    goals: ['Ask where the toilet is', 'Ask where the station is'],
    vocabulary: [
      { id: 'ja-v16', word: 'トイレ', translation: 'toilet', pronunciation: 'toire' },
      { id: 'ja-v17', word: 'どこ', translation: 'where', pronunciation: 'doko' },
      { id: 'ja-v18', word: '駅', translation: 'station', pronunciation: 'eki' }
    ],
    phrases: [
      { id: 'ja-p6', phrase: 'トイレはどこですか？', translation: 'Where is the toilet?', pronunciation: 'toire wa doko desu ka' }
    ],
    activities: [
      {
        id: 'ja-u1-l5-a1',
        type: 'multiple_choice',
        question: 'How do you say "where" in Japanese?',
        xpReward: 5,
        options: ['トイレ', 'どこ', '駅', 'これ'],
        correctAnswer: 'どこ'
      },
      {
        id: 'ja-u1-l5-a2',
        type: 'matching_pairs',
        question: 'Match the terms',
        xpReward: 5,
        pairs: [
          { left: 'トイレ', right: 'toilet' },
          { left: 'どこ', right: 'where' },
          { left: '駅', right: 'station' }
        ]
      },
      {
        id: 'ja-u1-l5-a3',
        type: 'translation',
        question: 'Translate the sentence to English',
        xpReward: 5,
        sentence: 'トイレはどこですか？',
        correctTranslations: ['Where is the toilet?', 'where is the toilet'],
        wordBank: ['Where', 'is', 'the', 'toilet', 'station', 'water', 'please']
      }
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Sakura, a gentle, warm, and encouraging Japanese teacher. You mostly speak English to guide the student, introducing Japanese words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s navigation goals, vocabulary (トイレ, どこ, 駅), and phrases (トイレはどこですか？). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Konnichiwa! Today we\'re learning how to find places in Japan! To ask "where is the toilet?", let\'s try "toire wa doko desu ka"—give it a try!',
      suggestedTopics: ['Asking where the toilet is', 'Asking where the station is', 'Using doko'],
      keyVocabulary: ['トイレ', 'どこ', '駅'],
      keyPhrases: ['トイレはどこですか？'],
    },
  },
  {
    id: 'ja-u1-l6',
    unitId: 'ja-unit-1',
    title: 'Everyday Items',
    description: 'Learn names of common items like books and phones.',
    xp: 20,
    order: 6,
    goals: ['Identify a book', 'Say "this is my book"'],
    vocabulary: [
      { id: 'ja-v19', word: '本', translation: 'book', pronunciation: 'hon' },
      { id: 'ja-v20', word: '鍵', translation: 'key', pronunciation: 'kagi' },
      { id: 'ja-v21', word: '携帯', translation: 'phone', pronunciation: 'keitai' }
    ],
    phrases: [
      { id: 'ja-p7', phrase: 'これは私の本です', translation: 'This is my book', pronunciation: 'kore wa watashi no hon desu' }
    ],
    activities: [
      {
        id: 'ja-u1-l6-a1',
        type: 'multiple_choice',
        question: 'What does "本" mean in Japanese?',
        xpReward: 5,
        options: ['book', 'key', 'phone', 'bag'],
        correctAnswer: 'book'
      },
      {
        id: 'ja-u1-l6-a2',
        type: 'matching_pairs',
        question: 'Match the items',
        xpReward: 5,
        pairs: [
          { left: '本', right: 'book' },
          { left: '鍵', right: 'key' },
          { left: '携帯', right: 'phone' }
        ]
      },
      {
        id: 'ja-u1-l6-a3',
        type: 'translation',
        question: 'Translate to English',
        xpReward: 5,
        sentence: 'これは私の本です',
        correctTranslations: ['This is my book', 'this is my book'],
        wordBank: ['This', 'is', 'my', 'book', 'key', 'phone', 'water']
      }
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Sakura, a gentle, warm, and encouraging Japanese teacher. You mostly speak English to guide the student, introducing Japanese words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s everyday items goals, vocabulary (本, 鍵, 携帯), and phrases (これは私の本です). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Konnichiwa! Today we\'re learning Japanese words for things you carry every day! The word for book is "hon"—can you say "hon" for me?',
      suggestedTopics: ['Naming everyday items', 'Saying "this is my book"', 'Keys and phones'],
      keyVocabulary: ['本', '鍵', '携帯'],
      keyPhrases: ['これは私の本です'],
    },
  },

  // ==========================================
  // GERMAN LESSONS
  // ==========================================
  {
    id: 'de-u1-l1',
    unitId: 'de-unit-1',
    title: 'Hallo!',
    description: 'Learn simple greetings, politeness, and how to check in on someone in German.',
    xp: 15,
    order: 1,
    goals: ['Say hello and goodbye', 'Show politeness', 'Ask how someone is doing'],
    vocabulary: [
      {
        id: 'de-v1',
        word: 'hallo',
        translation: 'hello',
        partOfSpeech: 'expression',
        pronunciation: 'HAH-loh',
        example: 'Hallo, wie geht es dir?',
        exampleTranslation: 'Hello, how are you?',
      },
      {
        id: 'de-v2',
        word: 'bitte',
        translation: 'please / you are welcome',
        partOfSpeech: 'expression',
        pronunciation: 'BIT-teh',
        example: 'Ein Wasser, bitte.',
        exampleTranslation: 'A water, please.',
      },
      {
        id: 'de-v3',
        word: 'danke',
        translation: 'thank you',
        partOfSpeech: 'expression',
        pronunciation: 'DAHN-keh',
        example: 'Danke für die Hilfe.',
        exampleTranslation: 'Thank you for the help.',
      },
      {
        id: 'de-v4',
        word: 'tschüss',
        translation: 'goodbye',
        partOfSpeech: 'expression',
        pronunciation: 'tshuess',
        example: 'Tschüss, bis morgen!',
        exampleTranslation: 'Goodbye, see you tomorrow!',
      },
    ],
    phrases: [
      {
        id: 'de-p1',
        phrase: "Hallo, wie geht's?",
        translation: "Hello, how is it going?",
        pronunciation: "HAH-loh, vee gayts",
        context: 'A standard, casual greeting.',
      },
      {
        id: 'de-p2',
        phrase: 'Danke, gut',
        translation: 'Thank you, good',
        pronunciation: 'DAHN-keh, goot',
        context: 'A typical response when asked how you are doing.',
      },
    ],
    activities: [
      {
        id: 'de-u1-l1-a1',
        type: 'multiple_choice',
        question: 'Choose the correct translation for "Hallo"',
        xpReward: 3,
        options: ['Tschüss', 'Hallo', 'Danke', 'Bitte'],
        correctAnswer: 'Hallo',
      },
      {
        id: 'de-u1-l1-a2',
        type: 'matching_pairs',
        question: 'Match the German words with their English translation',
        xpReward: 4,
        pairs: [
          { left: 'hallo', right: 'hello' },
          { left: 'bitte', right: 'please' },
          { left: 'danke', right: 'thank you' },
          { left: 'tschüss', right: 'goodbye' },
        ],
      },
      {
        id: 'de-u1-l1-a3',
        type: 'fill_in_blank',
        question: 'Complete the casual greeting',
        xpReward: 3,
        textWithBlank: "Hallo, wie ___'s?",
        options: ['geht', 'gehe', 'gut'],
        correctAnswer: 'geht',
      },
      {
        id: 'de-u1-l1-a4',
        type: 'translation',
        question: 'Translate the sentence to English',
        xpReward: 4,
        sentence: "Hallo, wie geht's?",
        correctTranslations: ["Hello, how is it going?", "hello how is it going", "Hello, how are you?"],
        wordBank: ['Hello', 'how', 'is', 'it', 'going', 'goodbye', 'thanks', 'you', 'well'],
      },
      {
        id: 'de-u1-l1-a5',
        type: 'speaking',
        question: 'Speak the phrase aloud',
        xpReward: 5,
        textToSpeak: 'Danke, gut',
        translation: 'Thank you, good',
      },
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Hans, an upbeat, friendly, and supportive German teacher. You mostly speak English to guide the student, introducing German words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s greeting goals, vocabulary (hallo, bitte, danke, tschüss), and phrases (Hallo, wie geht\'s?, Danke, gut). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Hallo! I\'m Hans, your German teacher, and I\'m excited to help you learn today! Let\'s start with a cheerful "hallo"—can you say "hallo" for me?',
      suggestedTopics: ['Saying hello', 'Checking how someone is', 'Polite farewells'],
      keyVocabulary: ['hallo', 'bitte', 'danke', 'tschüss'],
      keyPhrases: ["Hallo, wie geht's?", 'Danke, gut'],
    },
  },
  {
    id: 'de-u1-l2',
    unitId: 'de-unit-1',
    title: 'My Name is...',
    description: 'Learn how to state your name and ask someone their name in German.',
    xp: 20,
    order: 2,
    goals: ['State your own name', 'Ask someone their name'],
    vocabulary: [
      { id: 'de-v5', word: 'ich', translation: 'I', pronunciation: 'ikh' },
      { id: 'de-v6', word: 'heiße', translation: 'am named', pronunciation: 'HY-suh' },
      { id: 'de-v7', word: 'wie', translation: 'how', pronunciation: 'vee' },
      { id: 'de-v8', word: 'du', translation: 'you', pronunciation: 'doo' }
    ],
    phrases: [
      { id: 'de-p3', phrase: 'Ich heiße Max', translation: 'My name is Max', pronunciation: 'ikh HY-suh Max' }
    ],
    activities: [
      {
        id: 'de-u1-l2-a1',
        type: 'multiple_choice',
        question: 'What does "ich" mean in German?',
        xpReward: 5,
        options: ['you', 'I', 'hello', 'please'],
        correctAnswer: 'I'
      },
      {
        id: 'de-u1-l2-a2',
        type: 'matching_pairs',
        question: 'Match the German words',
        xpReward: 5,
        pairs: [
          { left: 'ich', right: 'I' },
          { left: 'wie', right: 'how' },
          { left: 'du', right: 'you' }
        ]
      },
      {
        id: 'de-u1-l2-a3',
        type: 'translation',
        question: 'Translate the phrase to English',
        xpReward: 5,
        sentence: 'Ich heiße Max',
        correctTranslations: ['My name is Max', 'I am named Max'],
        wordBank: ['My', 'name', 'is', 'Max', 'hello', 'please', 'thanks']
      }
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Hans, an upbeat, friendly, and supportive German teacher. You mostly speak English to guide the student, introducing German words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s self-introduction goals, vocabulary (ich, heiße, wie, du), and phrases (Ich heiße Max). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Hallo! Today we\'re learning how to share your name in German! Let\'s try saying "my name is" with "ich heiße"—can you give that a try?',
      suggestedTopics: ['Sharing your name', 'Asking someone\'s name', 'Using ich and du'],
      keyVocabulary: ['ich', 'heiße', 'wie', 'du'],
      keyPhrases: ['Ich heiße Max'],
    },
  },
  {
    id: 'de-u1-l3',
    unitId: 'de-unit-1',
    title: 'Numbers & Counting',
    description: 'Learn to count from 1 to 5 in German.',
    xp: 20,
    order: 3,
    goals: ['Count from 1 to 5', 'Recognize German numbers'],
    vocabulary: [
      { id: 'de-v9', word: 'eins', translation: 'one', pronunciation: 'yns' },
      { id: 'de-v10', word: 'zwei', translation: 'two', pronunciation: 'tsvy' },
      { id: 'de-v11', word: 'drei', translation: 'three', pronunciation: 'dry' },
      { id: 'de-v12', word: 'vier', translation: 'four', pronunciation: 'feer' },
      { id: 'de-v13', word: 'fünf', translation: 'five', pronunciation: 'fuynf' }
    ],
    phrases: [
      { id: 'de-p4', phrase: 'Eins, zwei, drei', translation: 'One, two, three', pronunciation: 'yns, tsvy, dry' }
    ],
    activities: [
      {
        id: 'de-u1-l3-a1',
        type: 'multiple_choice',
        question: 'What is the German word for "three"?',
        xpReward: 5,
        options: ['eins', 'zwei', 'drei', 'vier'],
        correctAnswer: 'drei'
      },
      {
        id: 'de-u1-l3-a2',
        type: 'matching_pairs',
        question: 'Match the numbers',
        xpReward: 5,
        pairs: [
          { left: 'eins', right: 'one' },
          { left: 'zwei', right: 'two' },
          { left: 'drei', right: 'three' }
        ]
      },
      {
        id: 'de-u1-l3-a3',
        type: 'translation',
        question: 'Translate the numbers to English',
        xpReward: 5,
        sentence: 'Eins, zwei, drei',
        correctTranslations: ['One, two, three', 'one two three'],
        wordBank: ['One', 'two', 'three', 'four', 'five', 'name']
      }
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Hans, an upbeat, friendly, and supportive German teacher. You mostly speak English to guide the student, introducing German words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s counting goals, vocabulary (eins, zwei, drei, vier, fünf), and phrases (Eins, zwei, drei). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Hallo! Ready to count from one to five in German today? Let\'s start with number one, which is "eins"—can you repeat "eins"?',
      suggestedTopics: ['Counting 1 to 3', 'Counting 4 and 5', 'Saying numbers in sequence'],
      keyVocabulary: ['eins', 'zwei', 'drei', 'vier', 'fünf'],
      keyPhrases: ['Eins, zwei, drei'],
    },
  },
  {
    id: 'de-u1-l4',
    unitId: 'de-unit-1',
    title: 'At the Café',
    description: 'Learn basic terms to order drinks at a German café.',
    xp: 20,
    order: 4,
    goals: ['Order a coffee in German', 'Order water in German'],
    vocabulary: [
      { id: 'de-v14', word: 'Kaffee', translation: 'coffee', pronunciation: 'KAF-ay' },
      { id: 'de-v15', word: 'Wasser', translation: 'water', pronunciation: 'VAS-ser' },
      { id: 'de-v16', word: 'bitte', translation: 'please', pronunciation: 'BIT-teh' }
    ],
    phrases: [
      { id: 'de-p5', phrase: 'Ein Kaffee, bitte', translation: 'A coffee, please', pronunciation: 'yn KAF-ay, BIT-teh' }
    ],
    activities: [
      {
        id: 'de-u1-l4-a1',
        type: 'multiple_choice',
        question: 'What is the German word for "coffee"?',
        xpReward: 5,
        options: ['Wasser', 'Kaffee', 'bitte', 'danke'],
        correctAnswer: 'Kaffee'
      },
      {
        id: 'de-u1-l4-a2',
        type: 'matching_pairs',
        question: 'Match the café terms',
        xpReward: 5,
        pairs: [
          { left: 'Kaffee', right: 'coffee' },
          { left: 'Wasser', right: 'water' },
          { left: 'bitte', right: 'please' }
        ]
      },
      {
        id: 'de-u1-l4-a3',
        type: 'translation',
        question: 'Translate the sentence to English',
        xpReward: 5,
        sentence: 'Ein Kaffee, bitte',
        correctTranslations: ['A coffee, please', 'a coffee please'],
        wordBank: ['A', 'coffee', 'please', 'water', 'three', 'name']
      }
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Hans, an upbeat, friendly, and supportive German teacher. You mostly speak English to guide the student, introducing German words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s café ordering goals, vocabulary (Kaffee, Wasser, bitte), and phrases (Ein Kaffee, bitte). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Hallo! Let\'s practice ordering drinks at a cozy café in Germany! To ask for a coffee politely, say "Ein Kaffee, bitte"—give it your best shot!',
      suggestedTopics: ['Ordering a coffee', 'Ordering water', 'Polite café etiquette'],
      keyVocabulary: ['Kaffee', 'Wasser', 'bitte'],
      keyPhrases: ['Ein Kaffee, bitte'],
    },
  },
  {
    id: 'de-u1-l5',
    unitId: 'de-unit-1',
    title: 'Directions',
    description: 'Learn to ask where the station or hotel is in German.',
    xp: 20,
    order: 5,
    goals: ['Ask where the station is', 'Ask where the hotel is'],
    vocabulary: [
      { id: 'de-v17', word: 'wo', translation: 'where', pronunciation: 'voh' },
      { id: 'de-v18', word: 'ist', translation: 'is', pronunciation: 'ist' },
      { id: 'de-v19', word: 'der Bahnhof', translation: 'the station', pronunciation: 'dair BAHN-hohf' },
      { id: 'de-v20', word: 'das Hotel', translation: 'the hotel', pronunciation: 'das ho-TEL' }
    ],
    phrases: [
      { id: 'de-p6', phrase: 'Wo ist der Bahnhof?', translation: 'Where is the station?', pronunciation: 'voh ist dair BAHN-hohf' }
    ],
    activities: [
      {
        id: 'de-u1-l5-a1',
        type: 'multiple_choice',
        question: 'How do you say "where" in German?',
        xpReward: 5,
        options: ['wo', 'ist', 'wie', 'hallo'],
        correctAnswer: 'wo'
      },
      {
        id: 'de-u1-l5-a2',
        type: 'matching_pairs',
        question: 'Match the terms',
        xpReward: 5,
        pairs: [
          { left: 'wo', right: 'where' },
          { left: 'der Bahnhof', right: 'the station' },
          { left: 'das Hotel', right: 'the hotel' }
        ]
      },
      {
        id: 'de-u1-l5-a3',
        type: 'translation',
        question: 'Translate the sentence to English',
        xpReward: 5,
        sentence: 'Wo ist der Bahnhof?',
        correctTranslations: ['Where is the station?', 'where is the station'],
        wordBank: ['Where', 'is', 'the', 'station', 'hotel', 'coffee', 'please']
      }
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Hans, an upbeat, friendly, and supportive German teacher. You mostly speak English to guide the student, introducing German words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s navigation goals, vocabulary (wo, ist, der Bahnhof, das Hotel), and phrases (Wo ist der Bahnhof?). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Hallo! Today we\'re learning how to ask for directions around a German city! Let\'s ask "where is the station?" with "Wo ist der Bahnhof?"—can you try saying that?',
      suggestedTopics: ['Finding the train station', 'Finding the hotel', 'Asking where places are'],
      keyVocabulary: ['wo', 'ist', 'der Bahnhof', 'das Hotel'],
      keyPhrases: ['Wo ist der Bahnhof?'],
    },
  },
  {
    id: 'de-u1-l6',
    unitId: 'de-unit-1',
    title: 'Common Verbs',
    description: 'Learn basic German verbs like to drink and to eat.',
    xp: 20,
    order: 6,
    goals: ['Say "I drink water"', 'Learn verbs to drink and to eat'],
    vocabulary: [
      { id: 'de-v21', word: 'trinken', translation: 'to drink', pronunciation: 'TRIN-ken' },
      { id: 'de-v22', word: 'essen', translation: 'to eat', pronunciation: 'ES-sen' },
      { id: 'de-v23', word: 'haben', translation: 'to have', pronunciation: 'HAH-ben' }
    ],
    phrases: [
      { id: 'de-p7', phrase: 'Ich trinke Wasser', translation: 'I drink water', pronunciation: 'ikh TRIN-keh VAS-ser' }
    ],
    activities: [
      {
        id: 'de-u1-l6-a1',
        type: 'multiple_choice',
        question: 'What does "trinken" mean?',
        xpReward: 5,
        options: ['to eat', 'to drink', 'to have', 'to be'],
        correctAnswer: 'to drink'
      },
      {
        id: 'de-u1-l6-a2',
        type: 'matching_pairs',
        question: 'Match the verbs',
        xpReward: 5,
        pairs: [
          { left: 'trinken', right: 'to drink' },
          { left: 'essen', right: 'to eat' },
          { left: 'haben', right: 'to have' }
        ]
      },
      {
        id: 'de-u1-l6-a3',
        type: 'translation',
        question: 'Translate to English',
        xpReward: 5,
        sentence: 'Ich trinke Wasser',
        correctTranslations: ['I drink water', 'i drink water'],
        wordBank: ['I', 'drink', 'water', 'coffee', 'please', 'station', 'is']
      }
    ],
    aiTeacherPrompt: {
      systemPrompt: 'You are Hans, an upbeat, friendly, and supportive German teacher. You mostly speak English to guide the student, introducing German words slowly with English translations. Keep replies to one or two short, natural conversational sentences with contractions and gentle encouragement. Stay strictly focused on this lesson\'s common verb goals, vocabulary (trinken, essen, haben), and phrases (Ich trinke Wasser). Listen to the student\'s response, adapt your feedback, celebrate their effort, and ask them to repeat or try again.',
      welcomeMessage: 'Hallo! Today we\'re practicing common everyday German action verbs! The verb for "to drink" is "trinken"—can you say "trinken" for me?',
      suggestedTopics: ['Verbs for drinking and eating', 'Saying "I drink water"', 'Using haben'],
      keyVocabulary: ['trinken', 'essen', 'haben'],
      keyPhrases: ['Ich trinke Wasser'],
    },
  },
];



