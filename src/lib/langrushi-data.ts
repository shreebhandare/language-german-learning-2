// Mock data for Langrushi platform
export type Level = 'A1' | 'A2' | 'B1' | 'B2';
export type Category = 'Listening' | 'Writing' | 'Grammar' | 'Games';
export type ExerciseType = 'Interactive' | 'Passive';
export type AccessFlag = 'FREE_ALL' | 'FREE_REGISTERED' | 'PAID';
export type QuestionType = 'MCQ' | 'FILL_BLANK' | 'TRUE_FALSE';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  hint?: string;
  explanation?: string;
}

export interface Exercise {
  id: string;
  title: string;
  level: Level;
  category: Category;
  subPart: string;
  type: ExerciseType;
  access: AccessFlag;
  // Interactive
  mediaUrl?: string;
  questions?: Question[];
  answerDisplayMode?: 'instant' | 'end' | 'none';
  allowSkip?: boolean;
  // Passive
  prompt?: string;
  guidance?: string[];
  modelAnswer?: string;
}

export interface ClassCode {
  id: string;
  code: string;
  level: Level;
  maxUses: number;
  used: number;
  expiry?: string;
  active: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  value: number;
  maxUses?: number;
  used: number;
  expiry?: string;
  active: boolean;
}

export const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2'];
export const CATEGORIES: Category[] = ['Listening', 'Writing', 'Grammar', 'Games'];

const sampleAudio = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

export const initialExercises: Exercise[] = [
  // A1 Listening
  {
    id: 'e1', title: 'Am Bahnhof', level: 'A1', category: 'Listening', subPart: 'Teil 1',
    type: 'Interactive', access: 'FREE_ALL', mediaUrl: sampleAudio,
    questions: [
      { id: 'q1', text: 'Wo befindet sich die Person?', type: 'MCQ', options: ['Im Park', 'Am Bahnhof', 'Im Café', 'Zu Hause'], correctAnswer: 'Am Bahnhof', hint: 'Listen for transport sounds', explanation: 'The audio mentions train arrivals.' },
      { id: 'q2', text: 'Der Zug fährt um _____ Uhr ab.', type: 'FILL_BLANK', correctAnswer: '14', hint: 'A number between 12 and 16' },
      { id: 'q3', text: 'Die Person kauft ein Ticket.', type: 'TRUE_FALSE', options: ['True', 'False'], correctAnswer: 'True', explanation: 'Yes, she purchases a ticket to Berlin.' },
    ],
  },
  {
    id: 'e2', title: 'Im Restaurant', level: 'A1', category: 'Listening', subPart: 'Teil 1',
    type: 'Interactive', access: 'FREE_ALL', mediaUrl: sampleAudio,
    questions: [
      { id: 'q1', text: 'Was bestellt der Gast?', type: 'MCQ', options: ['Pizza', 'Schnitzel', 'Salat', 'Suppe'], correctAnswer: 'Schnitzel' },
      { id: 'q2', text: 'Der Gast trinkt _____.', type: 'FILL_BLANK', correctAnswer: 'Wasser' },
    ],
  },
  {
    id: 'e3', title: 'Beim Arzt', level: 'A1', category: 'Listening', subPart: 'Teil 2',
    type: 'Interactive', access: 'FREE_REGISTERED', mediaUrl: sampleAudio,
    questions: [
      { id: 'q1', text: 'Was tut weh?', type: 'MCQ', options: ['Kopf', 'Bauch', 'Rücken', 'Hals'], correctAnswer: 'Kopf' },
      { id: 'q2', text: 'Der Patient bekommt Medizin.', type: 'TRUE_FALSE', options: ['True', 'False'], correctAnswer: 'True' },
    ],
  },
  // A1 Writing (Passive)
  {
    id: 'e4', title: 'E-Mail an einen Freund', level: 'A1', category: 'Writing', subPart: 'Teil 1',
    type: 'Passive', access: 'FREE_ALL',
    prompt: 'Schreiben Sie eine E-Mail an Ihren Freund Tom. Erzählen Sie über Ihr Wochenende.',
    guidance: ['Begrüßung', 'Was haben Sie am Samstag gemacht?', 'Was haben Sie am Sonntag gemacht?', 'Verabschiedung'],
    modelAnswer: 'Hallo Tom,\n\nwie geht es dir? Mein Wochenende war super! Am Samstag bin ich mit Freunden ins Kino gegangen. Wir haben einen spannenden Film gesehen.\n\nAm Sonntag habe ich lange geschlafen und dann meine Familie besucht. Wir haben zusammen gegessen und Karten gespielt.\n\nWie war dein Wochenende? Schreib mir bald!\n\nViele Grüße,\nAnna',
  },
  {
    id: 'e5', title: 'Postkarte aus dem Urlaub', level: 'A1', category: 'Writing', subPart: 'Teil 1',
    type: 'Passive', access: 'FREE_REGISTERED',
    prompt: 'Schreiben Sie eine Postkarte aus Ihrem Urlaub in Spanien.',
    guidance: ['Wo sind Sie?', 'Wie ist das Wetter?', 'Was machen Sie?', 'Wann kommen Sie zurück?'],
    modelAnswer: 'Liebe Maria,\n\nviele Grüße aus Barcelona! Hier ist es wunderschön. Das Wetter ist sonnig und warm.\n\nIch gehe jeden Tag schwimmen und esse leckeres spanisches Essen. Gestern habe ich die Sagrada Familia besucht.\n\nIch komme am Sonntag zurück. Bis bald!\n\nDeine Lisa',
  },
  // A1 Grammar (always free)
  {
    id: 'e6', title: 'Artikel: der, die, das', level: 'A1', category: 'Grammar', subPart: 'Teil 1',
    type: 'Interactive', access: 'FREE_ALL',
    questions: [
      { id: 'q1', text: 'Welcher Artikel passt zu "Tisch"?', type: 'MCQ', options: ['der', 'die', 'das', 'den'], correctAnswer: 'der', explanation: 'Tisch is masculine.' },
      { id: 'q2', text: '_____ Frau ist nett.', type: 'FILL_BLANK', correctAnswer: 'Die', hint: 'Feminine article' },
      { id: 'q3', text: '"Das Buch" ist neutral.', type: 'TRUE_FALSE', options: ['True', 'False'], correctAnswer: 'True' },
    ],
  },
  {
    id: 'e7', title: 'Verben konjugieren', level: 'A1', category: 'Grammar', subPart: 'Teil 2',
    type: 'Interactive', access: 'FREE_ALL',
    questions: [
      { id: 'q1', text: 'Ich _____ Deutsch. (lernen)', type: 'FILL_BLANK', correctAnswer: 'lerne' },
      { id: 'q2', text: 'Welche Form ist richtig für "du" + "sein"?', type: 'MCQ', options: ['bin', 'bist', 'ist', 'sind'], correctAnswer: 'bist' },
    ],
  },
  // A1 Games (always free)
  {
    id: 'e8', title: 'Wortschatz Quiz: Farben', level: 'A1', category: 'Games', subPart: 'Teil 1',
    type: 'Interactive', access: 'FREE_ALL',
    questions: [
      { id: 'q1', text: 'Was bedeutet "rot"?', type: 'MCQ', options: ['Blue', 'Red', 'Green', 'Yellow'], correctAnswer: 'Red' },
      { id: 'q2', text: '"Blau" means _____.', type: 'FILL_BLANK', correctAnswer: 'blue' },
    ],
  },
  // A2
  {
    id: 'e9', title: 'Eine Reise planen', level: 'A2', category: 'Listening', subPart: 'Teil 1',
    type: 'Interactive', access: 'PAID', mediaUrl: sampleAudio,
    questions: [
      { id: 'q1', text: 'Wohin reist die Person?', type: 'MCQ', options: ['Italien', 'Frankreich', 'Spanien', 'Griechenland'], correctAnswer: 'Italien' },
      { id: 'q2', text: 'Sie reist mit dem Flugzeug.', type: 'TRUE_FALSE', options: ['True', 'False'], correctAnswer: 'False' },
    ],
  },
  {
    id: 'e10', title: 'Bewerbungsschreiben', level: 'A2', category: 'Writing', subPart: 'Teil 1',
    type: 'Passive', access: 'PAID',
    prompt: 'Schreiben Sie ein kurzes Bewerbungsschreiben für eine Stelle als Praktikant.',
    guidance: ['Anrede', 'Warum bewerben Sie sich?', 'Ihre Erfahrung', 'Schlussformel'],
    modelAnswer: 'Sehr geehrte Damen und Herren,\n\nmit großem Interesse habe ich Ihre Stellenanzeige gelesen und möchte mich hiermit als Praktikant bewerben.\n\nIch studiere derzeit Wirtschaft und möchte praktische Erfahrungen sammeln. Ich bin motiviert, teamfähig und lerne schnell.\n\nÜber eine Einladung zu einem Gespräch würde ich mich sehr freuen.\n\nMit freundlichen Grüßen,\nMax Müller',
  },
  {
    id: 'e11', title: 'Präteritum üben', level: 'A2', category: 'Grammar', subPart: 'Teil 1',
    type: 'Interactive', access: 'FREE_ALL',
    questions: [
      { id: 'q1', text: 'Ich _____ gestern müde. (sein)', type: 'FILL_BLANK', correctAnswer: 'war' },
      { id: 'q2', text: 'Welche Form ist Präteritum von "haben" für "wir"?', type: 'MCQ', options: ['hatten', 'haben', 'gehabt', 'hätten'], correctAnswer: 'hatten' },
    ],
  },
  {
    id: 'e12', title: 'Memory: Tiere', level: 'A2', category: 'Games', subPart: 'Teil 1',
    type: 'Interactive', access: 'FREE_ALL',
    questions: [
      { id: 'q1', text: 'Was bedeutet "Hund"?', type: 'MCQ', options: ['Cat', 'Dog', 'Bird', 'Fish'], correctAnswer: 'Dog' },
    ],
  },
  // B1
  {
    id: 'e13', title: 'Nachrichten verstehen', level: 'B1', category: 'Listening', subPart: 'Teil 1',
    type: 'Interactive', access: 'PAID', mediaUrl: sampleAudio,
    questions: [
      { id: 'q1', text: 'Worüber wird berichtet?', type: 'MCQ', options: ['Wetter', 'Politik', 'Sport', 'Wirtschaft'], correctAnswer: 'Wetter' },
    ],
  },
  {
    id: 'e14', title: 'Argumentation schreiben', level: 'B1', category: 'Writing', subPart: 'Teil 1',
    type: 'Passive', access: 'PAID',
    prompt: 'Schreiben Sie einen Text über die Vor- und Nachteile von Homeoffice.',
    guidance: ['Einleitung', 'Vorteile', 'Nachteile', 'Ihre Meinung'],
    modelAnswer: 'In den letzten Jahren ist Homeoffice immer beliebter geworden. Es gibt sowohl Vorteile als auch Nachteile.\n\nEin großer Vorteil ist die Flexibilität. Man spart Zeit, weil man nicht zur Arbeit fahren muss. Außerdem kann man in einer ruhigen Umgebung arbeiten.\n\nEs gibt aber auch Nachteile. Der soziale Kontakt zu Kollegen fehlt, und manche Menschen können sich zu Hause schlecht konzentrieren.\n\nMeiner Meinung nach ist eine Mischung aus Homeoffice und Büro die beste Lösung.',
  },
  {
    id: 'e15', title: 'Konjunktiv II', level: 'B1', category: 'Grammar', subPart: 'Teil 1',
    type: 'Interactive', access: 'FREE_ALL',
    questions: [
      { id: 'q1', text: 'Wenn ich Zeit _____, würde ich reisen. (haben)', type: 'FILL_BLANK', correctAnswer: 'hätte' },
    ],
  },
  // B2
  {
    id: 'e16', title: 'Diskussion: Klimawandel', level: 'B2', category: 'Listening', subPart: 'Teil 1',
    type: 'Interactive', access: 'PAID', mediaUrl: sampleAudio,
    questions: [
      { id: 'q1', text: 'Welche Maßnahme wird vorgeschlagen?', type: 'MCQ', options: ['CO2-Steuer', 'Mehr Autos', 'Weniger Bäume', 'Mehr Flüge'], correctAnswer: 'CO2-Steuer' },
    ],
  },
  {
    id: 'e17', title: 'Erörterung verfassen', level: 'B2', category: 'Writing', subPart: 'Teil 1',
    type: 'Passive', access: 'PAID',
    prompt: 'Sollten soziale Medien strenger reguliert werden?',
    guidance: ['These', 'Pro-Argumente', 'Contra-Argumente', 'Schlussfolgerung'],
    modelAnswer: 'Soziale Medien sind aus unserem Alltag nicht mehr wegzudenken. Doch immer wieder wird diskutiert, ob sie strenger reguliert werden sollten.\n\nBefürworter argumentieren, dass Falschinformationen und Hassrede ein ernstes Problem darstellen. Eine strengere Regulierung könnte die Demokratie schützen.\n\nKritiker hingegen warnen vor Zensur und Eingriffen in die Meinungsfreiheit. Außerdem sei es schwierig, faire Regeln festzulegen.\n\nMeines Erachtens ist eine ausgewogene Regulierung notwendig, die sowohl die Freiheit als auch den Schutz vor Missbrauch gewährleistet.',
  },
  {
    id: 'e18', title: 'Passiv mit Modalverben', level: 'B2', category: 'Grammar', subPart: 'Teil 1',
    type: 'Interactive', access: 'FREE_ALL',
    questions: [
      { id: 'q1', text: 'Das Auto _____ repariert werden. (müssen)', type: 'FILL_BLANK', correctAnswer: 'muss' },
    ],
  },
];

export const initialClassCodes: ClassCode[] = [
  { id: 'cc1', code: 'GERMAN-A1-MAY2025', level: 'A1', maxUses: 50, used: 12, active: true, expiry: '2025-12-31' },
  { id: 'cc2', code: 'GERMAN-B1-MAY2025', level: 'B1', maxUses: 30, used: 8, active: true, expiry: '2025-12-31' },
  { id: 'cc3', code: 'GERMAN-B2-OCT2025', level: 'B2', maxUses: 25, used: 3, active: true },
];

export const initialCoupons: Coupon[] = [
  { id: 'co1', code: 'WELCOME20', discountType: 'percent', value: 20, used: 5, active: true },
  { id: 'co2', code: 'STUDENT10', discountType: 'fixed', value: 10, maxUses: 100, used: 23, active: true },
  { id: 'co3', code: 'EARLYBIRD', discountType: 'percent', value: 30, used: 0, active: false },
];
