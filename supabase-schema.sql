-- ============================================
-- Langrushi Quiz Platform - Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Exercises
CREATE TABLE IF NOT EXISTS langrushi_exercises (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2')),
  category TEXT NOT NULL CHECK (category IN ('Listening', 'Writing', 'Reading', 'Grammar', 'Games')),
  sub_part TEXT DEFAULT 'Teil 1',
  type TEXT NOT NULL CHECK (type IN ('Interactive', 'Passive')),
  access TEXT NOT NULL DEFAULT 'FREE_ALL' CHECK (access IN ('FREE_ALL', 'FREE_REGISTERED', 'PAID')),
  media_url TEXT,
  transcript TEXT,
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
CREATE POLICY "Own profile read" ON langrushi_profiles FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Own profile update" ON langrushi_profiles FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Admin full access" ON langrushi_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM langrushi_profiles WHERE id = auth.uid()::text AND tier = 'admin')
);

DROP POLICY IF EXISTS "Allow all for attempts" ON langrushi_attempts;
CREATE POLICY "Allow all for attempts" ON langrushi_attempts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for class_codes" ON langrushi_class_codes;
CREATE POLICY "Allow all for class_codes" ON langrushi_class_codes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for coupons" ON langrushi_coupons;
CREATE POLICY "Allow all for coupons" ON langrushi_coupons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for settings" ON langrushi_settings;
CREATE POLICY "Allow all for settings" ON langrushi_settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Trigger to auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.langrushi_profiles (id, email, name, tier)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'registered'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- Default settings
-- ============================================
INSERT INTO langrushi_settings (key, value) VALUES ('guest_quota', '2') ON CONFLICT (key) DO NOTHING;
INSERT INTO langrushi_settings (key, value) VALUES ('registered_quota', '10') ON CONFLICT (key) DO NOTHING;

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
INSERT INTO langrushi_exercises (id, title, level, category, sub_part, type, access, media_url, transcript, questions, prompt, guidance, model_answer) VALUES

-- A1 Listening
('e1', 'Am Bahnhof', 'A1', 'Listening', 'Teil 1', 'Interactive', 'FREE_ALL',
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
 'Ansage: Achtung, bitte! Der Zug nach Berlin fährt um 14 Uhr ab, Gleis 3.\n\nFrau: Entschuldigung, wo kann ich ein Ticket kaufen?\nMann: Am Schalter dort drüben, links neben dem Ausgang.\nFrau: Danke schön! Und wissen Sie, ob der Zug pünktlich ist?\nMann: Ja, normalerweise ist er pünktlich. Sie haben noch 20 Minuten.\nFrau: Wunderbar, vielen Dank!',
 '[{"id":"q1","text":"Wo befindet sich die Person?","type":"MCQ","options":["Im Park","Am Bahnhof","Im Café","Zu Hause"],"correctAnswer":"Am Bahnhof","hint":"Listen for transport sounds","explanation":"The audio mentions train arrivals."},{"id":"q2","text":"Der Zug fährt um _____ Uhr ab.","type":"FILL_BLANK","correctAnswer":"14","hint":"A number between 12 and 16"},{"id":"q3","text":"Die Person kauft ein Ticket.","type":"TRUE_FALSE","options":["True","False"],"correctAnswer":"True","explanation":"Yes, she purchases a ticket to Berlin."}]',
 NULL, NULL, NULL),

('e2', 'Im Restaurant', 'A1', 'Listening', 'Teil 1', 'Interactive', 'FREE_ALL',
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
 NULL,
 '[{"id":"q1","text":"Was bestellt der Gast?","type":"MCQ","options":["Pizza","Schnitzel","Salat","Suppe"],"correctAnswer":"Schnitzel"},{"id":"q2","text":"Der Gast trinkt _____.","type":"FILL_BLANK","correctAnswer":"Wasser"}]',
 NULL, NULL, NULL),

('e3', 'Beim Arzt', 'A1', 'Listening', 'Teil 2', 'Interactive', 'FREE_REGISTERED',
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
 NULL,
 '[{"id":"q1","text":"Was tut weh?","type":"MCQ","options":["Kopf","Bauch","Rücken","Hals"],"correctAnswer":"Kopf"},{"id":"q2","text":"Der Patient bekommt Medizin.","type":"TRUE_FALSE","options":["True","False"],"correctAnswer":"True"}]',
 NULL, NULL, NULL),

-- A1 Writing (Passive)
('e4', 'E-Mail an einen Freund', 'A1', 'Writing', 'Teil 1', 'Passive', 'FREE_ALL',
 NULL, NULL, NULL,
 'Schreiben Sie eine E-Mail an Ihren Freund Tom. Erzählen Sie über Ihr Wochenende.',
 '["Begrüßung","Was haben Sie am Samstag gemacht?","Was haben Sie am Sonntag gemacht?","Verabschiedung"]',
 'Hallo Tom,\n\nwie geht es dir? Mein Wochenende war super! Am Samstag bin ich mit Freunden ins Kino gegangen. Wir haben einen spannenden Film gesehen.\n\nAm Sonntag habe ich lange geschlafen und dann meine Familie besucht. Wir haben zusammen gegessen und Karten gespielt.\n\nWie war dein Wochenende? Schreib mir bald!\n\nViele Grüße,\nAnna'),

('e5', 'Postkarte aus dem Urlaub', 'A1', 'Writing', 'Teil 1', 'Passive', 'FREE_REGISTERED',
 NULL, NULL, NULL,
 'Schreiben Sie eine Postkarte aus Ihrem Urlaub in Spanien.',
 '["Wo sind Sie?","Wie ist das Wetter?","Was machen Sie?","Wann kommen Sie zurück?"]',
 'Liebe Maria,\n\nviele Grüße aus Barcelona! Hier ist es wunderschön. Das Wetter ist sonnig und warm.\n\nIch gehe jeden Tag schwimmen und esse leckeres spanisches Essen. Gestern habe ich die Sagrada Familia besucht.\n\nIch komme am Sonntag zurück. Bis bald!\n\nDeine Lisa'),

-- A1 Grammar
('e6', 'Artikel: der, die, das', 'A1', 'Grammar', 'Teil 1', 'Interactive', 'FREE_ALL',
 NULL, NULL,
 '[{"id":"q1","text":"Welcher Artikel passt zu \"Tisch\"?","type":"MCQ","options":["der","die","das","den"],"correctAnswer":"der","explanation":"Tisch is masculine."},{"id":"q2","text":"_____ Frau ist nett.","type":"FILL_BLANK","correctAnswer":"Die","hint":"Feminine article"},{"id":"q3","text":"\"Das Buch\" ist neutral.","type":"TRUE_FALSE","options":["True","False"],"correctAnswer":"True"}]',
 NULL, NULL, NULL),

('e7', 'Verben konjugieren', 'A1', 'Grammar', 'Teil 2', 'Interactive', 'FREE_ALL',
 NULL, NULL,
 '[{"id":"q1","text":"Ich _____ Deutsch. (lernen)","type":"FILL_BLANK","correctAnswer":"lerne"},{"id":"q2","text":"Welche Form ist richtig für \"du\" + \"sein\"?","type":"MCQ","options":["bin","bist","ist","sind"],"correctAnswer":"bist"}]',
 NULL, NULL, NULL),

-- A1 Games
('e8', 'Wortschatz Quiz: Farben', 'A1', 'Games', 'Teil 1', 'Interactive', 'FREE_ALL',
 NULL, NULL,
 '[{"id":"q1","text":"Was bedeutet \"rot\"?","type":"MCQ","options":["Blue","Red","Green","Yellow"],"correctAnswer":"Red"},{"id":"q2","text":"\"Blau\" means _____.","type":"FILL_BLANK","correctAnswer":"blue"}]',
 NULL, NULL, NULL),

-- A2
('e9', 'Eine Reise planen', 'A2', 'Listening', 'Teil 1', 'Interactive', 'PAID',
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
 NULL,
 '[{"id":"q1","text":"Wohin reist die Person?","type":"MCQ","options":["Italien","Frankreich","Spanien","Griechenland"],"correctAnswer":"Italien"},{"id":"q2","text":"Sie reist mit dem Flugzeug.","type":"TRUE_FALSE","options":["True","False"],"correctAnswer":"False"}]',
 NULL, NULL, NULL),

('e10', 'Bewerbungsschreiben', 'A2', 'Writing', 'Teil 1', 'Passive', 'PAID',
 NULL, NULL, NULL,
 'Schreiben Sie ein kurzes Bewerbungsschreiben für eine Stelle als Praktikant.',
 '["Anrede","Warum bewerben Sie sich?","Ihre Erfahrung","Schlussformel"]',
 'Sehr geehrte Damen und Herren,\n\nmit großem Interesse habe ich Ihre Stellenanzeige gelesen und möchte mich hiermit als Praktikant bewerben.\n\nIch studiere derzeit Wirtschaft und möchte praktische Erfahrungen sammeln. Ich bin motiviert, teamfähig und lerne schnell.\n\nÜber eine Einladung zu einem Gespräch würde ich mich sehr freuen.\n\nMit freundlichen Grüßen,\nMax Müller'),

('e11', 'Präteritum üben', 'A2', 'Grammar', 'Teil 1', 'Interactive', 'FREE_ALL',
 NULL, NULL,
 '[{"id":"q1","text":"Ich _____ gestern müde. (sein)","type":"FILL_BLANK","correctAnswer":"war"},{"id":"q2","text":"Welche Form ist Präteritum von \"haben\" für \"wir\"?","type":"MCQ","options":["hatten","haben","gehabt","hätten"],"correctAnswer":"hatten"}]',
 NULL, NULL, NULL),

('e12', 'Memory: Tiere', 'A2', 'Games', 'Teil 1', 'Interactive', 'FREE_ALL',
 NULL, NULL,
 '[{"id":"q1","text":"Was bedeutet \"Hund\"?","type":"MCQ","options":["Cat","Dog","Bird","Fish"],"correctAnswer":"Dog"}]',
 NULL, NULL, NULL),

-- B1
('e13', 'Nachrichten verstehen', 'B1', 'Listening', 'Teil 1', 'Interactive', 'PAID',
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
 NULL,
 '[{"id":"q1","text":"Worüber wird berichtet?","type":"MCQ","options":["Wetter","Politik","Sport","Wirtschaft"],"correctAnswer":"Wetter"}]',
 NULL, NULL, NULL),

('e14', 'Argumentation schreiben', 'B1', 'Writing', 'Teil 1', 'Passive', 'PAID',
 NULL, NULL, NULL,
 'Schreiben Sie einen Text über die Vor- und Nachteile von Homeoffice.',
 '["Einleitung","Vorteile","Nachteile","Ihre Meinung"]',
 'In den letzten Jahren ist Homeoffice immer beliebter geworden. Es gibt sowohl Vorteile als auch Nachteile.\n\nEin großer Vorteil ist die Flexibilität. Man spart Zeit, weil man nicht zur Arbeit fahren muss. Außerdem kann man in einer ruhigen Umgebung arbeiten.\n\nEs gibt aber auch Nachteile. Der soziale Kontakt zu Kollegen fehlt, und manche Menschen können sich zu Hause schlecht konzentrieren.\n\nMeiner Meinung nach ist eine Mischung aus Homeoffice und Büro die beste Lösung.'),

('e15', 'Konjunktiv II', 'B1', 'Grammar', 'Teil 1', 'Interactive', 'FREE_ALL',
 NULL, NULL,
 '[{"id":"q1","text":"Wenn ich Zeit _____, würde ich reisen. (haben)","type":"FILL_BLANK","correctAnswer":"hätte"}]',
 NULL, NULL, NULL),

-- B2
('e16', 'Diskussion: Klimawandel', 'B2', 'Listening', 'Teil 1', 'Interactive', 'PAID',
 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
 NULL,
 '[{"id":"q1","text":"Welche Maßnahme wird vorgeschlagen?","type":"MCQ","options":["CO2-Steuer","Mehr Autos","Weniger Bäume","Mehr Flüge"],"correctAnswer":"CO2-Steuer"}]',
 NULL, NULL, NULL),

('e17', 'Erörterung verfassen', 'B2', 'Writing', 'Teil 1', 'Passive', 'PAID',
 NULL, NULL, NULL,
 'Sollten soziale Medien strenger reguliert werden?',
 '["These","Pro-Argumente","Contra-Argumente","Schlussfolgerung"]',
 'Soziale Medien sind aus unserem Alltag nicht mehr wegzudenken. Doch immer wieder wird diskutiert, ob sie strenger reguliert werden sollten.\n\nBefürworter argumentieren, dass Falschinformationen und Hassrede ein ernstes Problem darstellen. Eine strengere Regulierung könnte die Demokratie schützen.\n\nKritiker hingegen warnen vor Zensur und Eingriffen in die Meinungsfreiheit. Außerdem sei es schwierig, faire Regeln festzulegen.\n\nMeines Erachtens ist eine ausgewogene Regulierung notwendig, die sowohl die Freiheit als auch den Schutz vor Missbrauch gewährleistet.'),

('e18', 'Passiv mit Modalverben', 'B2', 'Grammar', 'Teil 1', 'Interactive', 'FREE_ALL',
 NULL, NULL,
 '[{"id":"q1","text":"Das Auto _____ repariert werden. (müssen)","type":"FILL_BLANK","correctAnswer":"muss"}]',
 NULL, NULL, NULL),

-- Reading Exercises (Seeded)
('e19', 'Ein Tag in Berlin', 'A1', 'Reading', 'Teil 1', 'Interactive', 'FREE_ALL',
 NULL,
 'Hallo, ich heiße David. Ich wohne in Berlin. Berlin ist eine große Stadt in Deutschland. Mein Tag beginnt früh. Um 7 Uhr trinke ich Kaffee und esse Brot. Danach gehe ich im Park spazieren. Am Nachmittag treffe ich meine Freunde im Café. Wir sprechen Deutsch und trinken Tee. Am Abend bleibe ich zu Hause und lese ein Buch. Ich gehe um 22 Uhr ins Bett.',
 '[{"id":"q1","text":"Wo wohnt David?","type":"MCQ","options":["In München","In Berlin","In Frankfurt","In Hamburg"],"correctAnswer":"In Berlin","explanation":"David sagt: \"Ich wohne in Berlin.\""},{"id":"q2","text":"David trinkt am Morgen _____.","type":"FILL_BLANK","correctAnswer":"Kaffee","hint":"Kaffee oder Tee?","explanation":"David trinkt Kaffee um 7 Uhr."},{"id":"q3","text":"David trifft seine Freunde am Vormittag.","type":"TRUE_FALSE","options":["True","False"],"correctAnswer":"False","explanation":"Er trifft seine Freunde am Nachmittag."}]',
 NULL, NULL, NULL),

('e20', 'Umweltschutz im Alltag', 'B1', 'Reading', 'Teil 1', 'Interactive', 'PAID',
 NULL,
 'Umweltfreundlich zu leben ist in der heutigen Gesellschaft sehr wichtig. Viele Menschen versuchen, Plastikmüll zu vermeiden. Sie kaufen Obst und Gemüse auf dem Markt und benutzen Stofftaschen. Eine weitere einfache Möglichkeit ist das Energiesparen. Man sollte das Licht ausschalten, wenn man einen Raum verlässt, und elektronische Geräte nicht im Standby-Modus lassen. Auch das Fahrrad oder öffentliche Verkehrsmittel zu nutzen, statt mit dem Auto zu fahren, hilft der Umwelt enorm.',
 '[{"id":"q1","text":"Wo kaufen umweltbewusste Menschen oft ihr Obst und Gemüse?","type":"MCQ","options":["Im Supermarkt","Auf dem Markt","Im Internet","Im Kiosk"],"correctAnswer":"Auf dem Markt","explanation":"Im Text steht: \"Sie kaufen Obst und Gemüse auf dem Markt.\""},{"id":"q2","text":"Geräte im Standby-Modus verbrauchen keinen Strom.","type":"TRUE_FALSE","options":["True","False"],"correctAnswer":"False","explanation":"Man sollte elektronische Geräte nicht im Standby-Modus lassen, da sie Strom verbrauchen."},{"id":"q3","text":"Statt mit dem Auto zu fahren, sollte man das _____ oder öffentliche Verkehrsmittel nutzen.","type":"FILL_BLANK","correctAnswer":"Fahrrad","hint":"Ein zweirädriges Fahrzeug","explanation":"Der Text empfiehlt, das Fahrrad oder öffentliche Verkehrsmittel zu nutzen."}]',
 NULL, NULL, NULL),

-- A2 Reading: Brandenburger Tor
('e21', 'Das Brandenburger Tor', 'A2', 'Reading', 'Teil 1', 'Interactive', 'FREE_ALL',
 NULL,
 'Das Brandenburger Tor in Berlin ist eines der bekanntesten historischen Wahrzeichen Deutschlands. Es wurde im 18. Jahrhundert erbaut und diente früher als Stadttor. Während des Kalten Krieges stand es direkt an der Grenze zwischen Ost- und Westberlin und wurde zu einem Symbol der Teilung. Heute steht das Brandenburger Tor für Einheit und Frieden und ist eine der meistbesuchten Sehenswürdigkeiten der Stadt.',
 '[{"id":"q1","text":"Das Brandenburger Tor wurde im 18. Jahrhundert gebaut.","type":"TRUE_FALSE","options":["True","False"],"correctAnswer":"True","explanation":"Der Text sagt: \"Es wurde im 18. Jahrhundert erbaut.\""},{"id":"q2","text":"Das Brandenburger Tor liegt in München.","type":"TRUE_FALSE","options":["True","False"],"correctAnswer":"False","explanation":"Das Brandenburger Tor liegt in Berlin, nicht in München."},{"id":"q3","text":"Es war ein Symbol der Teilung während des Kalten Krieges.","type":"TRUE_FALSE","options":["True","False"],"correctAnswer":"True","explanation":"Im Text steht: \"wurde zu einem Symbol der Teilung.\""},{"id":"q4","text":"Das Brandenburger Tor wurde ursprünglich als Museum gebaut.","type":"TRUE_FALSE","options":["True","False"],"correctAnswer":"False","explanation":"Es diente früher als Stadttor, nicht als Museum."},{"id":"q5","text":"Heute steht das Brandenburger Tor für Einheit und Frieden.","type":"TRUE_FALSE","options":["True","False"],"correctAnswer":"True","explanation":"Der Text sagt: \"Heute steht das Brandenburger Tor für Einheit und Frieden.\""}]',
 NULL, NULL, NULL)

ON CONFLICT (id) DO NOTHING;

-- === 7. Metadata Column & Analytics Table ===
ALTER TABLE langrushi_exercises ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS langrushi_analytics (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  user_email TEXT,
  action_type TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Analytics
ALTER TABLE langrushi_analytics ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (GDPR consented logs)
DROP POLICY IF EXISTS "Allow anonymous logs inserts" ON langrushi_analytics;
CREATE POLICY "Allow anonymous logs inserts" ON langrushi_analytics FOR INSERT WITH CHECK (true);

-- Allow authenticated users (Admins) to read
DROP POLICY IF EXISTS "Allow admin read" ON langrushi_analytics;
CREATE POLICY "Allow admin read" ON langrushi_analytics FOR SELECT TO authenticated USING (true);

