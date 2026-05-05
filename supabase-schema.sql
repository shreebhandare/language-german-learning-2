-- ============================================
-- Langrushi Quiz Platform - Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Exercises
CREATE TABLE IF NOT EXISTS langrushi_exercises (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2')),
  category TEXT NOT NULL,
  sub_part TEXT DEFAULT 'Teil 1',
  type TEXT NOT NULL CHECK (type IN ('Interactive', 'Passive')),
  access TEXT NOT NULL DEFAULT 'FREE_ALL' CHECK (access IN ('FREE_ALL', 'FREE_REGISTERED', 'PAID')),
  media_url TEXT,
  answer_display_mode TEXT DEFAULT 'instant',
  allow_skip BOOLEAN DEFAULT true,
  questions JSONB,
  prompt TEXT,
  guidance JSONB,
  model_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User profiles
CREATE TABLE IF NOT EXISTS langrushi_profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'registered' CHECK (tier IN ('guest', 'registered', 'paid', 'course', 'admin')),
  course_level TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Quiz attempts
CREATE TABLE IF NOT EXISTS langrushi_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES langrushi_profiles(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  date TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Class codes
CREATE TABLE IF NOT EXISTS langrushi_class_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2')),
  max_uses INTEGER NOT NULL DEFAULT 50,
  used INTEGER NOT NULL DEFAULT 0,
  expiry TEXT,
  active BOOLEAN DEFAULT TRUE
);

-- 5. Coupons
CREATE TABLE IF NOT EXISTS langrushi_coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  value NUMERIC NOT NULL,
  max_uses INTEGER,
  used INTEGER NOT NULL DEFAULT 0,
  expiry TEXT,
  active BOOLEAN DEFAULT TRUE
);

-- 6. Settings (key-value store)
CREATE TABLE IF NOT EXISTS langrushi_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_attempts_user ON langrushi_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_exercise ON langrushi_attempts(exercise_id);
CREATE INDEX IF NOT EXISTS idx_attempts_date ON langrushi_attempts(date DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON langrushi_profiles(email);
CREATE INDEX IF NOT EXISTS idx_exercises_level ON langrushi_exercises(level);

-- ============================================
-- Row Level Security (RLS) - Allow public access for anon key
-- (Since this is a demo platform using anon key from frontend)
-- ============================================
ALTER TABLE langrushi_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE langrushi_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE langrushi_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE langrushi_class_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE langrushi_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE langrushi_settings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon users (demo mode)
DROP POLICY IF EXISTS "Allow all for exercises" ON langrushi_exercises;
CREATE POLICY "Allow all for exercises" ON langrushi_exercises FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for profiles" ON langrushi_profiles;
CREATE POLICY "Allow all for profiles" ON langrushi_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for attempts" ON langrushi_attempts;
CREATE POLICY "Allow all for attempts" ON langrushi_attempts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for class_codes" ON langrushi_class_codes;
CREATE POLICY "Allow all for class_codes" ON langrushi_class_codes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for coupons" ON langrushi_coupons;
CREATE POLICY "Allow all for coupons" ON langrushi_coupons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for settings" ON langrushi_settings;
CREATE POLICY "Allow all for settings" ON langrushi_settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Default settings
-- ============================================
INSERT INTO langrushi_settings (key, value) VALUES ('guest_quota', '2') ON CONFLICT (key) DO NOTHING;
INSERT INTO langrushi_settings (key, value) VALUES ('registered_quota', '10') ON CONFLICT (key) DO NOTHING;

-- ============================================
-- Seed: Admin user (admin@langrushi.com / admin)
-- Password hash = SHA-256("admin" + "langrushi_salt_v1")
-- ============================================
INSERT INTO langrushi_profiles (id, email, password_hash, name, tier)
VALUES (
  'admin_main',
  'admin@langrushi.com',
  '7d1dc30d519060780aa6048ca4bde42e3057f8a1e23b66f11e4ec7dd543e7837',
  'Admin',
  'admin'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Seed: Class Codes
-- ============================================
INSERT INTO langrushi_class_codes (id, code, level, max_uses, used, active, expiry) VALUES
  ('cc1', 'GERMAN-A1-MAY2025', 'A1', 50, 12, true, '2025-12-31'),
  ('cc2', 'GERMAN-B1-MAY2025', 'B1', 30, 8, true, '2025-12-31'),
  ('cc3', 'GERMAN-B2-OCT2025', 'B2', 25, 3, true, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Seed: Coupons
-- ============================================
INSERT INTO langrushi_coupons (id, code, discount_type, value, max_uses, used, active) VALUES
  ('co1', 'WELCOME20', 'percent', 20, NULL, 5, true),
  ('co2', 'STUDENT10', 'fixed', 10, 100, 23, true),
  ('co3', 'EARLYBIRD', 'percent', 30, NULL, 0, false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Seed: Sample Exercises (18 exercises across A1-B2)
-- ============================================
INSERT INTO langrushi_exercises (id, title, level, category, sub_part, type, access, media_url, questions, prompt, guidance, model_answer) VALUES

-- A1 Listening
('e1', 'Am Bahnhof', 'A1', 'Listening', 'Teil 1', 'Interactive', 'FREE_ALL',
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
 '[{"id":"q1","text":"Wo befindet sich die Person?","type":"MCQ","options":["Im Park","Am Bahnhof","Im Café","Zu Hause"],"correctAnswer":"Am Bahnhof","hint":"Listen for transport sounds","explanation":"The audio mentions train arrivals."},{"id":"q2","text":"Der Zug fährt um _____ Uhr ab.","type":"FILL_BLANK","correctAnswer":"14","hint":"A number between 12 and 16"},{"id":"q3","text":"Die Person kauft ein Ticket.","type":"TRUE_FALSE","options":["True","False"],"correctAnswer":"True","explanation":"Yes, she purchases a ticket to Berlin."}]',
 NULL, NULL, NULL),

('e2', 'Im Restaurant', 'A1', 'Listening', 'Teil 1', 'Interactive', 'FREE_ALL',
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
 '[{"id":"q1","text":"Was bestellt der Gast?","type":"MCQ","options":["Pizza","Schnitzel","Salat","Suppe"],"correctAnswer":"Schnitzel"},{"id":"q2","text":"Der Gast trinkt _____.","type":"FILL_BLANK","correctAnswer":"Wasser"}]',
 NULL, NULL, NULL),

('e3', 'Beim Arzt', 'A1', 'Listening', 'Teil 2', 'Interactive', 'FREE_REGISTERED',
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
 '[{"id":"q1","text":"Was tut weh?","type":"MCQ","options":["Kopf","Bauch","Rücken","Hals"],"correctAnswer":"Kopf"},{"id":"q2","text":"Der Patient bekommt Medizin.","type":"TRUE_FALSE","options":["True","False"],"correctAnswer":"True"}]',
 NULL, NULL, NULL),

-- A1 Writing (Passive)
('e4', 'E-Mail an einen Freund', 'A1', 'Writing', 'Teil 1', 'Passive', 'FREE_ALL',
 NULL, NULL,
 'Schreiben Sie eine E-Mail an Ihren Freund Tom. Erzählen Sie über Ihr Wochenende.',
 '["Begrüßung","Was haben Sie am Samstag gemacht?","Was haben Sie am Sonntag gemacht?","Verabschiedung"]',
 'Hallo Tom,\n\nwie geht es dir? Mein Wochenende war super! Am Samstag bin ich mit Freunden ins Kino gegangen. Wir haben einen spannenden Film gesehen.\n\nAm Sonntag habe ich lange geschlafen und dann meine Familie besucht. Wir haben zusammen gegessen und Karten gespielt.\n\nWie war dein Wochenende? Schreib mir bald!\n\nViele Grüße,\nAnna'),

('e5', 'Postkarte aus dem Urlaub', 'A1', 'Writing', 'Teil 1', 'Passive', 'FREE_REGISTERED',
 NULL, NULL,
 'Schreiben Sie eine Postkarte aus Ihrem Urlaub in Spanien.',
 '["Wo sind Sie?","Wie ist das Wetter?","Was machen Sie?","Wann kommen Sie zurück?"]',
 'Liebe Maria,\n\nviele Grüße aus Barcelona! Hier ist es wunderschön. Das Wetter ist sonnig und warm.\n\nIch gehe jeden Tag schwimmen und esse leckeres spanisches Essen. Gestern habe ich die Sagrada Familia besucht.\n\nIch komme am Sonntag zurück. Bis bald!\n\nDeine Lisa'),

-- A1 Grammar
('e6', 'Artikel: der, die, das', 'A1', 'Grammar', 'Teil 1', 'Interactive', 'FREE_ALL',
 NULL,
 '[{"id":"q1","text":"Welcher Artikel passt zu \"Tisch\"?","type":"MCQ","options":["der","die","das","den"],"correctAnswer":"der","explanation":"Tisch is masculine."},{"id":"q2","text":"_____ Frau ist nett.","type":"FILL_BLANK","correctAnswer":"Die","hint":"Feminine article"},{"id":"q3","text":"\"Das Buch\" ist neutral.","type":"TRUE_FALSE","options":["True","False"],"correctAnswer":"True"}]',
 NULL, NULL, NULL),

('e7', 'Verben konjugieren', 'A1', 'Grammar', 'Teil 2', 'Interactive', 'FREE_ALL',
 NULL,
 '[{"id":"q1","text":"Ich _____ Deutsch. (lernen)","type":"FILL_BLANK","correctAnswer":"lerne"},{"id":"q2","text":"Welche Form ist richtig für \"du\" + \"sein\"?","type":"MCQ","options":["bin","bist","ist","sind"],"correctAnswer":"bist"}]',
 NULL, NULL, NULL),

-- A1 Games
('e8', 'Wortschatz Quiz: Farben', 'A1', 'Games', 'Teil 1', 'Interactive', 'FREE_ALL',
 NULL,
 '[{"id":"q1","text":"Was bedeutet \"rot\"?","type":"MCQ","options":["Blue","Red","Green","Yellow"],"correctAnswer":"Red"},{"id":"q2","text":"\"Blau\" means _____.","type":"FILL_BLANK","correctAnswer":"blue"}]',
 NULL, NULL, NULL),

-- A2
('e9', 'Eine Reise planen', 'A2', 'Listening', 'Teil 1', 'Interactive', 'PAID',
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
 '[{"id":"q1","text":"Wohin reist die Person?","type":"MCQ","options":["Italien","Frankreich","Spanien","Griechenland"],"correctAnswer":"Italien"},{"id":"q2","text":"Sie reist mit dem Flugzeug.","type":"TRUE_FALSE","options":["True","False"],"correctAnswer":"False"}]',
 NULL, NULL, NULL),

('e10', 'Bewerbungsschreiben', 'A2', 'Writing', 'Teil 1', 'Passive', 'PAID',
 NULL, NULL,
 'Schreiben Sie ein kurzes Bewerbungsschreiben für eine Stelle als Praktikant.',
 '["Anrede","Warum bewerben Sie sich?","Ihre Erfahrung","Schlussformel"]',
 'Sehr geehrte Damen und Herren,\n\nmit großem Interesse habe ich Ihre Stellenanzeige gelesen und möchte mich hiermit als Praktikant bewerben.\n\nIch studiere derzeit Wirtschaft und möchte praktische Erfahrungen sammeln. Ich bin motiviert, teamfähig und lerne schnell.\n\nÜber eine Einladung zu einem Gespräch würde ich mich sehr freuen.\n\nMit freundlichen Grüßen,\nMax Müller'),

('e11', 'Präteritum üben', 'A2', 'Grammar', 'Teil 1', 'Interactive', 'FREE_ALL',
 NULL,
 '[{"id":"q1","text":"Ich _____ gestern müde. (sein)","type":"FILL_BLANK","correctAnswer":"war"},{"id":"q2","text":"Welche Form ist Präteritum von \"haben\" für \"wir\"?","type":"MCQ","options":["hatten","haben","gehabt","hätten"],"correctAnswer":"hatten"}]',
 NULL, NULL, NULL),

('e12', 'Memory: Tiere', 'A2', 'Games', 'Teil 1', 'Interactive', 'FREE_ALL',
 NULL,
 '[{"id":"q1","text":"Was bedeutet \"Hund\"?","type":"MCQ","options":["Cat","Dog","Bird","Fish"],"correctAnswer":"Dog"}]',
 NULL, NULL, NULL),

-- B1
('e13', 'Nachrichten verstehen', 'B1', 'Listening', 'Teil 1', 'Interactive', 'PAID',
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
 '[{"id":"q1","text":"Worüber wird berichtet?","type":"MCQ","options":["Wetter","Politik","Sport","Wirtschaft"],"correctAnswer":"Wetter"}]',
 NULL, NULL, NULL),

('e14', 'Argumentation schreiben', 'B1', 'Writing', 'Teil 1', 'Passive', 'PAID',
 NULL, NULL,
 'Schreiben Sie einen Text über die Vor- und Nachteile von Homeoffice.',
 '["Einleitung","Vorteile","Nachteile","Ihre Meinung"]',
 'In den letzten Jahren ist Homeoffice immer beliebter geworden. Es gibt sowohl Vorteile als auch Nachteile.\n\nEin großer Vorteil ist die Flexibilität. Man spart Zeit, weil man nicht zur Arbeit fahren muss. Außerdem kann man in einer ruhigen Umgebung arbeiten.\n\nEs gibt aber auch Nachteile. Der soziale Kontakt zu Kollegen fehlt, und manche Menschen können sich zu Hause schlecht konzentrieren.\n\nMeiner Meinung nach ist eine Mischung aus Homeoffice und Büro die beste Lösung.'),

('e15', 'Konjunktiv II', 'B1', 'Grammar', 'Teil 1', 'Interactive', 'FREE_ALL',
 NULL,
 '[{"id":"q1","text":"Wenn ich Zeit _____, würde ich reisen. (haben)","type":"FILL_BLANK","correctAnswer":"hätte"}]',
 NULL, NULL, NULL),

-- B2
('e16', 'Diskussion: Klimawandel', 'B2', 'Listening', 'Teil 1', 'Interactive', 'PAID',
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
 '[{"id":"q1","text":"Welche Maßnahme wird vorgeschlagen?","type":"MCQ","options":["CO2-Steuer","Mehr Autos","Weniger Bäume","Mehr Flüge"],"correctAnswer":"CO2-Steuer"}]',
 NULL, NULL, NULL),

('e17', 'Erörterung verfassen', 'B2', 'Writing', 'Teil 1', 'Passive', 'PAID',
 NULL, NULL,
 'Sollten soziale Medien strenger reguliert werden?',
 '["These","Pro-Argumente","Contra-Argumente","Schlussfolgerung"]',
 'Soziale Medien sind aus unserem Alltag nicht mehr wegzudenken. Doch immer wieder wird diskutiert, ob sie strenger reguliert werden sollten.\n\nBefürworter argumentieren, dass Falschinformationen und Hassrede ein ernstes Problem darstellen. Eine strengere Regulierung könnte die Demokratie schützen.\n\nKritiker hingegen warnen vor Zensur und Eingriffen in die Meinungsfreiheit. Außerdem sei es schwierig, faire Regeln festzulegen.\n\nMeines Erachtens ist eine ausgewogene Regulierung notwendig, die sowohl die Freiheit als auch den Schutz vor Missbrauch gewährleistet.'),

('e18', 'Passiv mit Modalverben', 'B2', 'Grammar', 'Teil 1', 'Interactive', 'FREE_ALL',
 NULL,
 '[{"id":"q1","text":"Das Auto _____ repariert werden. (müssen)","type":"FILL_BLANK","correctAnswer":"muss"}]',
 NULL, NULL, NULL)

ON CONFLICT (id) DO NOTHING;
