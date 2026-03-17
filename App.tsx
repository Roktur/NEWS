import React, { useState, useEffect } from 'react';
import { generateInfographic, rewriteText, checkApiKeySelection } from './services/geminiService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ApiKeyPrompt } from './components/ApiKeyPrompt';
import { GeneratedImage } from './types';

const INFOGRAPHIC_STYLES = [
  { id: 'may1', label: '1 мая', icon: '🛠️', prompt: 'Professional festive infographic layout for Spring and Labor Day (May 1st). High-quality spring-themed aesthetic featuring fresh blooming flowers, bright green leaves, and festive balloons. Background: Sunny park scenes, clear blue skies, or clean textured paper with subtle floral patterns. Visual elements: Stylized labor symbols (gears, tools) integrated with spring motifs, red banners, and white doves. Color palette: Vibrant red, fresh spring green, sunny yellow, and sky blue. Typography: Bold, cheerful sans-serif fonts for headlines and clean, modern fonts for informational blocks. The overall atmosphere is positive, communal, and celebratory of spring and work. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'march8', label: '8 Марта', icon: '🌷', prompt: 'Professional festive infographic layout for International Women\'s Day (March 8th). High-quality spring-themed aesthetic featuring delicate floral arrangements (tulips, mimosa, lilies) with soft watercolor textures and gentle sunlight effects. Color palette: Soft pastel pinks, creamy whites, fresh spring greens, and sunny yellows. Visual elements include elegant flowing ribbons, subtle sparkle overlays, and stylized "8" motifs integrated into the design. Typography is a graceful and sophisticated script for main greetings and a clean, modern sans-serif for informational blocks. The overall atmosphere is warm, celebratory, appreciative, and elegant, resembling premium greeting cards or high-end lifestyle magazine features. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'victory_day', label: '9 мая', icon: '🎖️', prompt: 'Professional Victory Day (May 9th) infographic layout. High-quality patriotic and solemn aesthetic. Background: Clean white marble, subtle textures of aged paper, or a dignified dark red gradient. Visual elements: St. George ribbon (orange and black stripes), the Eternal Flame, silhouettes of monuments like "The Motherland Calls", red carnations, Soviet stars, and fireworks in the night sky. Color palette: Deep red, gold, black, and orange (St. George ribbon colors). Typography: Strong, dignified serif fonts for headlines and clear sans-serif for informational blocks. The overall atmosphere is respectful, heroic, and celebratory. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'february23', label: '23 февраля', icon: '🇷🇺', prompt: 'Professional festive infographic layout for Defender of the Fatherland Day (February 23rd). High-quality military and patriotic aesthetic. Background: Clean metallic textures, subtle camouflage patterns, or a dignified navy blue/khaki gradient. Visual elements: Stylized stars, military equipment silhouettes (tanks, planes, ships), medals, and the Russian flag colors. Color palette: Khaki green, deep red, navy blue, and gold. Typography: Strong, bold sans-serif or slab-serif fonts that convey strength and reliability. The overall atmosphere is courageous, respectful, and celebratory. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'aviation', label: 'Авиа', icon: '✈️', prompt: 'Professional aviation and airline news infographic layout. High-quality travel aesthetic featuring modern commercial aircraft, clear blue skies, and soft white clouds. Background: Aerial views of landscapes, airport terminal glass reflections, or clean sky gradients. Visual elements: Stylized flight paths, boarding pass motifs, airplane silhouettes, and globe icons. Color palette: Sky blue, cloud white, and professional navy blue with silver accents. Typography: Clean, modern sans-serif fonts (like those used in airports). The overall atmosphere is airy, global, and efficient. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'automotive', label: 'Автомобильный', icon: '🚗', prompt: 'Professional automotive news and tips infographic layout. High-quality aesthetic designed for drivers and car enthusiasts. Background: Clean, modern surfaces like asphalt textures, metallic gradients, or blurred city roads. Visual elements: Realistic car silhouettes, steering wheels, road signs, and clear icons representing traffic rules, maintenance tips, or new laws. Color palette: Trustworthy deep blue, metallic grey, and signal red for alerts. Typography: Bold, legible sans-serif fonts (like those used on road signs or car dashboards). The layout is structured to deliver news, advice, or warnings clearly. The overall atmosphere is informative, practical, and road-focused. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'astrological', label: 'Астро', icon: '✨', prompt: 'Astrological theme, starry night background, golden constellations, zodiac symbols, mystical, ethereal, deep blue and gold color palette.' },
  { id: 'banking', label: 'Банки', icon: '🏦', prompt: 'Professional banking and financial services infographic layout. High-quality corporate aesthetic featuring modern bank buildings, secure vaults, and digital banking interfaces. Background: Clean glass and steel architectural textures, blurred banking halls, or sophisticated dark blue gradients. Visual elements: Credit cards, gold coins, currency symbols (Ruble, Dollar, Euro), secure padlocks, and growth charts. Color palette: Trustworthy navy blue, professional gold, and crisp white. Typography: Clean, modern sans-serif fonts that convey security and stability. The overall atmosphere is professional, secure, and financially focused. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'biology', label: 'Биология', icon: '🦁', prompt: 'Professional biological and life sciences infographic layout. High-quality scientific aesthetic featuring organic earth tones like forest green, moss, terra cotta, and aged parchment. The background suggests a natural habitat or a clean laboratory notebook. Visual elements include detailed anatomical cross-sections of animals or plants, cellular structures, and botanical illustrations with realistic textures. Incorporates scientific annotations, measurement scales, and magnifying glass callouts. Typography is a mix of elegant serif for classifications and clean, functional sans-serif for data. The overall atmosphere is educational, highly detailed, and organic, resembling high-end scientific journals or National Geographic museum exhibits. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'business_humor', label: 'Бизнес с юмором', icon: '😉', prompt: 'Modern professional business infographic with a touch of visual wit. A clean, corporate aesthetic that isn\'t boring. Background: Minimalist white or light grey with subtle geometric patterns. Color palette: Trustworthy navy and slate grey paired with energetic accents of coral, mint, or mustard yellow. Visual elements: High-quality vector-style illustrations that use clever visual metaphors or slight exaggeration to make business concepts relatable and engaging (e.g., a chart growing into a tree, a coffee cup fueling a rocket). The humor should be smart and subtle, not cartoonish. Typography: Crisp, modern sans-serif fonts. Layout: Structured and data-driven but with a friendly, approachable vibe. All text in the image MUST be in Russian (Русский язык). CRITICAL: DO NOT INCLUDE GENERIC TITLES LIKE "EDUCATIONAL INFOGRAPHIC" or "ОБРАЗОВАТЕЛЬНАЯ ИНФОГРАФИКА". Just the topic headline and content.' },
  { id: 'breaking_news', label: 'Важная новость', icon: '🚨', prompt: 'Professional breaking news television broadcast graphic. Vivid red, white, and deep navy color palette. A massive, high-contrast "СРОЧНЫЕ НОВОСТИ" (Breaking News) banner at the top with a glowing alert effect. The layout mimics a modern news channel interface with a clear hierarchy. Main area features bold, impactful headlines. Background incorporates abstract digital textures and a subtle global map grid. Includes a realistic "LIVE" indicator icon and a scrolling news ticker aesthetic at the bottom. Sharp, clean sans-serif typography. Professional, urgent, and authoritative journalistic atmosphere. All text MUST be in Russian.' },
  { id: 'fun', label: 'Веселая', icon: '🎈', prompt: 'Fun and playful, bright vibrant colors, rounded shapes, cute characters, comic book style, energetic and friendly, bubbly fonts.' },
  { id: 'government', label: 'Власть', icon: '🏛️', prompt: 'Professional Russian government and political news infographic layout. Official, authoritative, and patriotic aesthetic designed for news about the State Duma, officials, and civil servants. Background: Clean white, marble textures, or subtle gradients of the Russian tricolor (White, Blue, Red). Visual elements: The Russian Coat of Arms (Double-headed eagle), the State Duma building silhouette, microphones on podiums, official documents, and the Russian flag. Color palette: Official state colors (White, Blue, Red) with Gold accents for prestige and Dark Navy for seriousness. Typography: Dignified serif fonts (like those on official decrees) and clear, bold sans-serif for headlines. The overall atmosphere is formal, serious, and administrative. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'gibdd', label: 'ГИБДД', icon: '🚓', prompt: 'Professional Russian traffic safety (GIBDD) infographic layout. Official and authoritative aesthetic featuring the signature color palette of police blue, crisp white, and reflective high-visibility neon yellow. The background incorporates stylized asphalt textures with white road markings or a clean official administrative document look. Visual elements include iconic Russian road signs, stylized police vehicle silhouettes with glowing emergency lights, and traffic safety diagrams. Typography is bold, modern, and high-contrast, mimicking official safety bulletins and instructional posters for drivers. Clear informational hierarchy with dedicated sections for rules, warnings, and safety tips. The overall atmosphere is serious, authoritative, and focused on road safety and public order. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'city', label: 'Город', icon: '🏙️', prompt: 'Professional urban development and city news infographic layout. Modern, dynamic, and structured aesthetic. Background: Clean architectural blueprints, stylized city maps, or blurred urban landscapes with modern buildings. Visual elements: High-quality icons and illustrations representing construction cranes (🏗️), modern roads (🛣️), roadwork barriers (🚧), traffic lights (🚦), bicycles and scooters (🚴), and parking symbols (🅿️). Color palette: Urban grey, construction orange, asphalt black, and signal yellow, balanced with clean white. Typography: Bold, modern sans-serif fonts that mimic city signage and technical documentation. The overall atmosphere is active, developing, and informative. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'gosuslugi', label: 'Госуслуги', icon: '📱', prompt: 'Professional Russian public services (Gosuslugi) infographic layout. Modern, clean, and user-friendly digital service aesthetic. Background: Clean white or light grey with subtle geometric patterns or soft blue gradients. Visual elements: Stylized icons representing various public services (passports, family, health, education, taxes), smartphone interfaces, and the recognizable Gosuslugi blue and red accent colors. Color palette: Gosuslugi blue (#0055A4), crisp white, and subtle red accents. Typography: Modern, highly legible sans-serif fonts (like those used on the Gosuslugi portal). The overall atmosphere is efficient, helpful, and modern. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'gto', label: 'ГТО', icon: '🏅', prompt: 'Professional "Ready for Labour and Defence" (GTO) infographic layout. Athletic, energetic, and patriotic aesthetic designed to promote physical fitness standards. Background: Clean white or dynamic red geometric shapes, stadium tracks, or subtle texture of sportswear mesh. Color palette: Bright Red, Pure White, and Gold/Silver/Bronze accents (reflecting the badges). Visual elements: Stylized GTO badges, silhouettes of athletes performing tests (running, pull-ups, swimming, shooting), stopwatches, and laurel wreaths. Typography: Strong, bold, uppercase sans-serif fonts that convey strength and discipline. The overall atmosphere is motivating, active, and official. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'business', label: 'Деловой', icon: '💼', prompt: 'Corporate business style, professional and clean, office aesthetic, structured layout, neutral color palette (navy blue, grey, white), serious and trustworthy.' },
  { id: 'doodle', label: 'Дудл', icon: '✏️', prompt: 'Hand-drawn doodle style, whiteboard sketch aesthetic, marker lines, informal, creative, loose and artistic, sketchbook feel.' },
  { id: 'food', label: 'Еда', icon: '🍳', prompt: 'Professional culinary and food infographic layout. High-quality aesthetic featuring appetizing food photography or realistic illustrations. Background: Clean kitchen counter textures (marble, wood) or fresh pastel colors. Color palette: Warm, appetizing tones (orange, red, fresh green, golden brown). Visual elements: Fresh ingredients, cooking utensils, steam effects, and nutritional breakdown charts. Typography: Elegant serif for headings (like a menu) and clean sans-serif for instructions. The overall atmosphere is delicious, fresh, and inviting. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'animals', label: 'Животные', icon: '🐾', prompt: 'Professional wildlife and animal facts infographic layout. High-quality nature documentary aesthetic. Background: Blurred natural habitats (forest, jungle, savanna, ocean) or clean textured paper. Visual elements: Stunning, high-resolution realistic photos or hyper-realistic illustrations of the specific animal mentioned in the topic. The layout should highlight key facts with icons (paw prints, speed, diet symbols). Color palette: Earthy tones, vibrant nature colors depending on the animal (e.g., ocean blues for marine life, forest greens for woodland creatures). Typography: Bold, attention-grabbing headers (like a wildlife magazine) and clear, readable body text for facts. The overall atmosphere is educational, fascinating, and wild. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'zhkh', label: 'ЖКХ', icon: '🏘️', prompt: 'Professional Russian Housing and Communal Services (ZhKH) infographic layout. Official and administrative aesthetic featuring a clean, structured design typical of public utility notices. Background: Clean white or light blue grid with subtle watermarks of houses or gears. Color palette: Official blue, bright safety orange (for alerts), and practical grey. Visual elements: High-contrast icons representing utilities (faucets, radiators, lightbulbs, trash bins, tools). Layout mimics an official maintenance announcement or utility bill explanation. Typography: Bold, strict, and highly legible sans-serif fonts. The overall atmosphere is informative, serious, and communal. All text in the image MUST be in Russian (Русский язык). CRITICAL: DO NOT INCLUDE ANY DATES, YEARS, OR MONTHS. DO NOT ADD GENERIC TITLES LIKE "ЖКХ ИНФОРМ", "HOUSING NEWS", or "ANNOUNCEMENT". Just the topic headline and information.' },
  { id: 'mysterious', label: 'Загадочная', icon: '🕵️', prompt: 'Mysterious atmosphere, dark background, glowing neon elements, shadows, fog, deep purples and blues, enigmatic symbols, thriller aesthetic.' },
  { id: 'salary_pension', label: 'Зарплата и пенсия', icon: '💰', prompt: 'Professional financial news infographic layout about salaries and pensions in Russia. High-quality aesthetic focused on labor compensation, social benefits, and economic news. Background: Clean financial charts, office settings, or subtle currency textures. Visual elements: Icons representing money (💰), pension funds, salary slips, and professional growth. Color palette: Trustworthy navy blue, professional green, and clean white. Typography: Bold, authoritative sans-serif fonts. The overall atmosphere is informative, serious, and reliable. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'health', label: 'Здоровье', icon: '❤️', prompt: 'Professional health and wellness infographic layout. Focused on vitality, self-care, and healthy lifestyle. Aesthetic: Clean, fresh, organic, and positive. Color palette: Fresh greens (nature), soft blues (calm), and energetic oranges (vitality) on a clean white background. Visual elements: Icons representing healthy habits (fitness, nutrition, sleep, hydration), human silhouettes in active poses, and heart symbols. Typography: Modern, clean, and friendly sans-serif fonts. The overall atmosphere is motivating and life-affirming. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'ai_news', label: 'ИИ', icon: '🤖', prompt: 'Friendly and accessible high-tech infographic layout for Artificial Intelligence (AI) news. The visual style is modern, approachable, and human-centric, designed to be clear and non-intimidating for all ages (including seniors). Background: Soft gradients, clean white spaces, and gentle light effects in calming blues, soft greens, and warm neutral tones. Visual elements: Friendly AI assistants, clear and simple icons representing technology as a helpful tool, and human-technology collaboration. CRITICAL: AVOID scary or overly complex cybernetic imagery like glowing brains, dark neural networks, or aggressive neon colors. THE IMAGE CONTENT MUST DIRECTLY REFLECT AND ILLUSTRATE THE SPECIFIC NEWS TOPIC PROVIDED in a supportive and clear way. Typography: Clean, highly legible modern sans-serif fonts. The overall atmosphere is helpful, safe, and easy to understand. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'fact', label: 'Интересный факт', icon: '💡', prompt: 'Professional curiosity-driven "Did you know?" infographic layout. High-quality modern graphic aesthetic with a vibrant and engaging color palette featuring electric yellow, bright teal, and energetic orange. The background is clean and slightly textured with subtle geometric patterns or curiosity-themed icons like lightbulbs, magnifying glasses, and sparks of inspiration. Visual elements include a massive, stylish "?" or "!" mark and clean, segmented blocks for the fact content. Incorporates high-contrast flat illustrations or sleek 3D icons that represent the discovery of new information. Typography is a bold, friendly sans-serif for the main hook and a clear, modern font for the body text. The overall atmosphere is educational, surprising, and visually stimulating, resembling high-end educational social media cards or museum discovery panels. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'internet', label: 'Интернет', icon: '🌐', prompt: 'Professional Internet and Digital Web infographic layout. Modern UI/UX aesthetic featuring browser windows, search bars, and floating app icons. Background: Abstract digital network, fiber optic lines, or a clean "glassmorphism" interface. Color palette: Electric blue, cyber violet, and bright neon accents against a dark "night mode" or clean white background. Visual elements: Wi-Fi signals, cloud symbols, cursor arrows, and chat bubbles. Typography: Modern web-optimized sans-serif fonts (like Inter or Roboto) and monospace accents. The overall atmosphere is connected, fast, and technological. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'historical', label: 'Исторический', icon: '📜', prompt: 'Professional historical infographic layout. Aesthetic inspired by vintage maps, old manuscripts, and classical history books. Background: Aged parchment texture, papyrus, or faded canvas with subtle map grids or compass roses. Color palette: Sepia, antique gold, faded brown, and deep crimson accents. Visual elements: Wax seals, quill pen illustrations, etching-style drawings, and timeline markers. Typography: Classic serif fonts (like Garamond or Trajan) for headers and clean, legible serif for body text. The overall atmosphere is timeless, educational, and authentic. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'cybersecurity', label: 'Кибербезопасность', icon: '🛡️', prompt: 'Professional cybersecurity and digital safety infographic layout. High-tech, secure aesthetic. Background: Dark matrix-style digital rain, circuit board patterns, or deep navy/black void with glowing grid lines. Color palette: Neon green (hacker style), electric blue, and warning red accents on a dark background. Visual elements: Padlocks, shields, binary code streams, fingerprints, and firewall brick wall motifs. Typography: Monospace "terminal" fonts for code snippets and bold, futuristic sans-serif for headers. The overall atmosphere is secure, vigilant, and technological. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'space', label: 'Космос', icon: '🚀', prompt: 'Professional astronomical and deep space infographic layout. High-quality scientific aesthetic featuring stunning cinematic nebulae, dense starfields, and celestial bodies like planets or distant galaxies with realistic textures and atmospheric glows. The background is a deep indigo and midnight purple void with vibrant electric blue and magenta nebular clouds. Visual elements include futuristic data visualization overlays, glowing scientific coordinate grids, and detailed planetary cross-sections. Typography is a sophisticated tech-style sans-serif, mimicking advanced space agency mission control interfaces or high-end astronomical documentary visuals. Clear informational hierarchy with luminous callouts and floating data blocks. The overall atmosphere is awe-inspiring, mysterious, and highly scientific. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'culture', label: 'Культура', icon: '🎨', prompt: 'Professional news infographic layout for culture and arts. Calm, balanced, and informative aesthetic. Background: Clean off-white, light grey, or subtle paper texture. Visual elements: Minimalist and professional icons representing cinema, books, fine arts, theater, and cultural events. Color palette: Muted and sophisticated tones like deep navy, slate grey, and soft burgundy on a neutral background. Typography: Classic, highly legible serif for headlines and clean sans-serif for body text, conveying a sense of tradition and credibility. The overall atmosphere is serious, respectful, and purely news-focused. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'medical', label: 'Медицинский', icon: '🏥', prompt: 'Professional medical infographic, clean clinical white background, blue and teal accents, anatomy illustrations, health symbols (cross, heart, stethoscope), sterile and trustworthy.' },
  { id: 'messenger_max', label: 'Мессенджер MAX', icon: '💬', prompt: 'Professional news infographic layout for "Messenger MAX" updates. High-quality corporate news aesthetic. CRITICAL: DO NOT INCLUDE CHAT BUBBLES, MESSAGES, OR CONVERSATION INTERFACES. This is a news report, not a screenshot of the app. Background: A "light" style featuring bright, vibrant glowing gradients of electric blue, violet, and magenta. Visual elements: Prominently features the "Messenger MAX" logo—a thick, flat white circular ring with a small speech bubble tail at the bottom left, set inside a rounded, slightly tilted square container with a smooth gradient from electric blue to deep purple. The layout uses clean white or translucent glass panels to display news content. Typography: Sharp, modern sans-serif fonts. The atmosphere is technological, energetic, and premium. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'weather', label: 'Метео', icon: '🌦️', prompt: 'Weather and health forecast theme, meteorological charts, atmospheric pressure visualization, icons of sun/clouds/rain, soothing colors, clear data about weather impact on health.' },
  { id: 'metro', label: 'Метро', icon: '🚇', prompt: 'Professional public transport and subway news infographic layout, specifically inspired by the Moscow Metro. High-quality urban transit aesthetic. Background: Clean architectural elements of metro stations, marble textures, or sleek modern train carriages. Visual elements: Iconic red "M" logo style, subway maps, transit lines, turnstiles, and modern train silhouettes. Color palette: Deep underground darks, bright station lights, and vibrant line colors (red, blue, green, circle line brown). Typography: Clean, highly legible sans-serif fonts used in transit navigation and wayfinding systems. The overall atmosphere is dynamic, punctual, and metropolitan. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'minimal', label: 'Минимализм', icon: '⚪', prompt: 'Minimalist design, plenty of whitespace, simple geometric shapes, limited color palette, clean lines, Swiss design style, modern.' },
  { id: 'scam', label: 'Мошенники', icon: '🎭', prompt: 'Professional anti-fraud warning infographic layout. Urgent and cautionary aesthetic designed to alert the public about scams. Color palette: High-contrast red, black, and alarm yellow against a dark or neutral grey background. Visual elements: Icons of hooded figures, hackers, locked phones, phishing hooks, credit cards with prohibition signs, and shield symbols. Typography: Bold, impact-style headers (resembling "ATTENTION" or "STOP") and clear, legible body text for safety tips. The layout mimics official police warnings or bank security alerts. The overall atmosphere is serious, protective, and urgent. All text in the image MUST be in Russian (Русский язык). CRITICAL: DO NOT INCLUDE ANY DATES.' },
  { id: 'musical', label: 'Музыкальный', icon: '🎵', prompt: 'Professional artistic musical infographic layout. The composition is driven by dynamic sound waves, flowing staff lines, and abstract musical notes that create a sense of rhythm and harmony. Incorporates sleek silhouettes of instruments like violins, pianos, or guitars in a modern graphic style. Color palette: Deep indigo background with glowing neon accents of magenta, teal, and gold. High-contrast typography resembling elegant album covers or high-end music magazine spreads. Clear informational hierarchy with large, stylish headlines. The overall atmosphere is sophisticated, creative, and energetic. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'mchs', label: 'МЧС', icon: '🚒', prompt: 'Professional emergency warning and safety instructions infographic layout. Official Ministry of Emergency Situations (MCHS) aesthetic. Background: Clean white or high-visibility textures with subtle diagonal warning stripes. Visual elements: Official emergency symbols, fire trucks, rescue equipment, warning triangles, and clear step-by-step instructional icons (what to do in an emergency). Color palette: High-contrast emergency orange, alert red, and official navy blue. Typography: Bold, highly legible, and authoritative sans-serif fonts designed for quick reading in stressful situations. The layout is structured to deliver critical safety information, warnings, and action steps clearly. The overall atmosphere is urgent, life-saving, and official. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'newyear', label: 'Новогодний', icon: '🎄', prompt: 'New Year and Christmas theme, festive decoration, snowflakes, gold and red colors, cozy winter atmosphere, holiday spirit, magical lighting, sparkles.' },
  { id: 'news', label: 'Новостная', icon: '📰', prompt: 'Professional classic newspaper and digital news portal hybrid layout. High-quality journalistic aesthetic with a structured multi-column grid. Clean, authoritative serif typography for main headlines and sharp sans-serif for body text. Color palette: Off-white parchment or clean white background with black ink text and professional red accents for key alerts or categories. Incorporates realistic paper grain or a sophisticated digital news interface texture. Clear informational hierarchy with prominent headers, dots, and "Exclusive" badges. The overall atmosphere is credible, serious, and informative, mimicking high-end international newspapers. All text in the image MUST be in Russian (Русский язык). CRITICAL: DO NOT INCLUDE ANY DATES, YEARS, OR MONTHS. DO NOT ADD GENERIC NEWSPAPER NAMES OR HEADERS LIKE "ОФИЦИАЛЬНЫЙ ВЕСТНИК", "GAZETA", "NEWS", "OFFICIAL GAZETTE". Just the topic headline and content.' },
  { id: 'nostalgia', label: 'Ностальгия', icon: '🎞️', prompt: 'Professional nostalgic infographic layout. High-quality aesthetic evoking warm memories and a sense of the past. Background: Soft, warm sepia tones, faded photographs with blurred edges, or vintage wallpaper textures. Visual elements: Classic objects from past decades (analog clocks, old cameras, handwritten letters, retro toys). Color palette: Muted, warm earth tones, dusty rose, and antique gold. Typography: Elegant, slightly weathered serif fonts and graceful cursive scripts. The overall atmosphere is sentimental, cozy, and reflective. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'education', label: 'Образование', icon: '🎓', prompt: 'Professional educational and academic news infographic layout. High-quality aesthetic featuring elements of higher education, universities, and lifelong learning. Background: Clean campus architecture, library shelves, or modern lecture halls with soft lighting. Visual elements: Graduation caps, diplomas, open books, digital tablets, and lightbulb icons representing new ideas. Color palette: Academic navy blue, deep forest green, and sophisticated gold accents on a clean white or light grey background. Typography: Elegant serif for headers (conveying tradition and authority) and clean, modern sans-serif for body text. The overall atmosphere is intellectual, inspiring, and professional. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'weather_pixar', label: 'Погода', icon: '☀️', prompt: 'Professional weather infographic in a charming Pixar and Disney animation style. High-quality 3D render aesthetic with soft, warm lighting and expressive, friendly characters. The atmosphere is extremely positive, sunny, and cheerful. Background: A beautiful, vibrant sky with fluffy, stylized white clouds and a glowing, smiling sun. Visual elements: Cute 3D weather icons (smiling raindrops, fluffy snow, golden sunbeams) with a tactile, toy-like texture. The layout is clean and organized. CRITICAL: DO NOT INCLUDE ANY NUMBERS, TEMPERATURES, DATES, OR YEARS UNLESS THEY ARE EXPLICITLY PROVIDED IN THE TOPIC. IF NO NUMBERS ARE PROVIDED, THE IMAGE MUST BE COMPLETELY FREE OF ANY NUMERICAL DATA. Typography: Friendly, rounded, and bold sans-serif fonts. The overall feel is magical, heartwarming, and full of joy. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'generations', label: 'Поколение', icon: '👥', prompt: 'Professional infographic layout about generational differences and news (Boomers, Gen X, Millennials, Gen Z, Gen Alpha). High-quality modern aesthetic featuring a diverse group of people representing different age groups in a clean, graphic style. Background: A dynamic split-screen or multi-panel layout with distinct color zones for each generation (e.g., retro orange for Boomers, neon violet for Gen Z). Visual elements: Iconic objects representing each era (vinyl records, early computers, smartphones, VR headsets). Color palette: A vibrant, multi-colored spectrum that feels inclusive and energetic. Typography: A mix of fonts that reflect different eras—classic serif for older generations and bold, futuristic sans-serif for younger ones. The overall atmosphere is comparative, insightful, and culturally relevant. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'holidays', label: 'Праздники', icon: '🎉', prompt: 'Professional festive infographic layout for holidays. The AI MUST analyze the provided text to determine the specific holiday being discussed (e.g., New Year, Halloween, Valentine\'s Day, local festivals, etc.) and dynamically adapt the entire visual aesthetic, color palette, and iconography to match that specific holiday\'s traditional theme. Background: Thematic textures and colors appropriate for the identified holiday. Visual elements: High-quality, culturally accurate symbols and decorations related to the specific holiday mentioned in the text. Typography: Festive and thematic fonts that match the holiday\'s mood while remaining highly legible for informational blocks. The overall atmosphere must perfectly capture the spirit of the specific holiday described. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'products', label: 'Продукты', icon: '🛒', prompt: 'Professional consumer news infographic layout about grocery products and retail. High-quality aesthetic featuring supermarket shelves, product packaging, and fresh market displays. Background: Clean, bright store lighting, blurred supermarket aisles, or clean white/light grey surfaces. Visual elements: Realistic images of packaged goods (bottles, boxes, cans), fresh produce (fruits, vegetables), barcodes, quality seals (GOST, organic), and shopping carts. Color palette: Trustworthy consumer colors like fresh green, bright red (for discounts/alerts), and clean white. Typography: Clear, legible sans-serif fonts resembling price tags or product labels. The overall atmosphere is informative, consumer-focused, and practical. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'psychological', label: 'Психологический', icon: '🧠', prompt: 'Psychological and mental health theme, soft pastel colors, brain and mind symbols, human silhouettes, calming aesthetic, clean lines, empathetic and thoughtful visual hierarchy, soothing gradients.' },
  { id: 'retro', label: 'Ретро', icon: '📺', prompt: 'Retro vintage style, 1950s poster aesthetic, barrier paper texture, muted colors, grain effect, old-school typography, nostalgia.' },
  { id: 'recipes', label: 'Рецепты блюд', icon: '📖', prompt: 'Professional culinary recipe infographic layout. High-quality home-cooking aesthetic featuring a clear, step-by-step structure. Background: Warm and cozy kitchen textures like light wood, rustic linen, or soft pastel kitchen tiles. Visual elements: High-quality illustrations or realistic photos of the finished dish, fresh ingredients, and simple icons for cooking steps (mixing, baking, cutting). The layout is divided into a clear "Ingredients" list and a numbered "Steps" section. Color palette: Warm and appetizing tones like terracotta, sage green, and creamy vanilla. Typography: A mix of friendly, hand-written style for headers and clean, easy-to-read sans-serif for the instructions. The overall atmosphere is helpful, inspiring, and delicious. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'gardening', label: 'Садоводство', icon: '🌱', prompt: 'Professional gardening and horticulture infographic layout. Natural and organic aesthetic featuring lush greenery, soil textures, and botanical illustrations. Background: Soft garden scenes, wooden textures, or clean parchment. Visual elements: High-quality images of plants, flowers, gardening tools (trowel, watering can), and growth stages. Color palette: Various shades of green, earthy browns, and vibrant floral accents. Typography: Rustic serif for headers and clean sans-serif for tips. The overall atmosphere is peaceful, growth-oriented, and practical. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'telecom', label: 'Связь', icon: '📶', prompt: 'Professional telecommunications and mobile network news infographic layout. High-tech, connected aesthetic featuring cell towers, satellite signals, smartphones, and glowing network nodes. Background: Clean modern gradients of digital blue, vibrant purple, or sleek dark mode with abstract data waves and connectivity lines. Visual elements: 5G/4G icons, Wi-Fi signals, SIM cards, fiber optic cables, and global network maps. Color palette: Electric blue, neon cyan, and magenta accents. Typography: Modern, crisp sans-serif fonts optimized for digital reading. The overall atmosphere is fast, reliable, and technologically advanced. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'social', label: 'Социальный', icon: '🤝', prompt: 'Social awareness theme, flat illustration style showing diverse people, community connections, warm inviting colors, speech bubbles, humanitarian and supportive aesthetic.' },
  { id: 'sports', label: 'Спорт', icon: '⚽', prompt: 'Professional sports news infographic layout. High-energy, dynamic aesthetic featuring stadium lights, athletic textures (turf, court, track), and motion blur effects. Background: Blurred stadium crowds, sports arena architecture, or clean geometric patterns with action lines. Visual elements: Stylized silhouettes of athletes in motion, stopwatches, scoreboards, and equipment icons (balls, rackets, medals). Color palette: High-contrast energetic colors like electric blue, vibrant orange, or stadium green with crisp white and black accents. Typography: Bold, italicized sans-serif fonts that convey speed and power. The overall atmosphere is exciting, competitive, and fast-paced. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'tech', label: 'Технологии', icon: '🚀', prompt: 'Professional general technology and innovation infographic layout. Futuristic and cutting-edge aesthetic featuring digital networks, artificial intelligence motifs, and sleek hardware. Background: Deep space blue or dark slate with glowing data streams, holographic overlays, and abstract geometric patterns. Visual elements: AI brain silhouettes, microchips, glowing connection lines, robots, and futuristic cityscapes. Color palette: Electric blue, neon purple, and clean white accents. Typography: Modern, bold sans-serif fonts that convey innovation and progress. The overall atmosphere is visionary, high-tech, and inspiring. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'goods', label: 'Товары', icon: '🛍️', prompt: 'Professional consumer goods and retail infographic layout. High-quality aesthetic featuring a variety of household products, electronics, clothing, and everyday items. Background: Clean retail environment, modern store shelves, or a minimalist studio setting with soft lighting. Visual elements: Shopping bags, price tags, delivery boxes, and icons representing different product categories. Color palette: Vibrant and trustworthy colors like royal blue, bright orange, and clean white. Typography: Modern, bold sans-serif fonts that are easy to read. The overall atmosphere is commercial, organized, and appealing. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'financial', label: 'Финансовый', icon: '💰', prompt: 'Financial and economic theme, charts, growth arrows, currency symbols, trustworthy blue and green color palette, data visualization focus, professional investment look.' },
  { id: 'christian', label: 'Христианский', icon: '✝️', prompt: 'Christian aesthetic, traditional religious art style, gold and parchment texture, dignified serif fonts, classic iconography, serene and holy atmosphere, elegant layout with gold accents.' },
  { id: 'school', label: 'Школьный', icon: '🎒', prompt: 'Professional educational school infographic layout. High-quality academic aesthetic featuring a classic dark green chalkboard or clean mathematical graph paper background. Incorporates realistic chalk textures, hand-drawn educational icons like pencils, rulers, microscopes, and open books. The composition mimics a well-organized blackboard lesson with clear diagrams and structured sections. Color palette: Deep forest green background with white chalk-style text and subtle accents of sunny yellow and wood-brown. Typography includes elegant hand-written chalk-style fonts for headers and clear, legible ink-style sans-serif for informational text. The overall atmosphere is educational, encouraging, and clear. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'fines', label: 'Штрафы', icon: '⚠️', prompt: 'Professional news infographic layout about fines, penalties, and legal restrictions. Authoritative, cautionary, and official aesthetic. Background: Clean white or subtle grey textures with official document patterns or subtle red warning stripes. Visual elements: Official penalty notices, warning signs, stylized documents with stamps, crossed-out symbols, and icons representing various spheres of life (traffic, business, public spaces). Color palette: High-contrast alert red, official navy blue, and stark white. Typography: Strict, bold, and highly legible sans-serif fonts, resembling official government notices or legal warnings. The overall atmosphere is serious, informative, and cautionary. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'ecology', label: 'Экология', icon: '🌍', prompt: 'Professional environmental and ecology infographic layout. High-quality natural and sustainable aesthetic. Background: Lush green forests, clear blue water ripples, or clean recycled paper textures. Visual elements: High-quality icons and illustrations representing the Earth (🌍), recycling symbols (♻️), clean water waves (🌊), dense forests and trees (🌳), and diverse wildlife/fish (🐟). Color palette: Natural greens, deep ocean blues, earthy browns, and clean white. Typography: Modern, clean sans-serif fonts that convey a sense of harmony with nature and responsibility. The overall atmosphere is fresh, vital, and eco-conscious. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'electronics', label: 'Электроника', icon: '🔌', prompt: 'Professional electronics and consumer technology news infographic layout. High-tech, sleek, and modern aesthetic designed for gadget reviews and tech updates. Background: Clean matte black, dark grey, or brushed aluminum textures. Color palette: Electric blue, neon cyan, and metallic silver accents. Visual elements: High-quality realistic renders of smartphones, laptops, microchips, circuit boards, and glowing power symbols. Typography: Modern, geometric sans-serif fonts (like Roboto or Exo). The overall atmosphere is innovative, cutting-edge, and premium. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'legal', label: 'Юридический', icon: '⚖️', prompt: 'Professional legal and law system infographic layout. Authoritative and formal aesthetic featuring traditional law textures like aged parchment, polished mahogany wood, and gold-embossed details. Visual elements include the scales of justice, a wooden gavel, thick leather-bound law books, and classical architectural motifs like marble pillars. Color palette: Deep navy blue and charcoal grey with accents of rich burgundy and metallic gold. The composition is symmetrical and highly structured, conveying a sense of stability and truth. Typography uses elegant, high-contrast serif fonts for titles (resembling legal codes or constitutions) and clean, legible text for definitions. The overall atmosphere is dignified, serious, and credible, mimicking official legal documents or prestigious law firm publications. All text in the image MUST be in Russian (Русский язык).' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Квадрат', icon: '⬜' },
  { id: '3:4', label: 'Портрет', icon: '📄' },
  { id: '9:16', label: 'Сторис', icon: '📱' },
  { id: '16:9', label: 'Альбом', icon: '🖥️' },
];

const MODELS = [
  { id: 'gemini-3.1-flash-image-preview', label: 'Flash 3.1 (Быстрая)', icon: '⚡' },
  { id: 'gemini-3-pro-image-preview', label: 'Pro 3.0 (Качественная)', icon: '💎' },
];

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(INFOGRAPHIC_STYLES[0]);
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[1]); // Default to 3:4
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [watermarkText, setWatermarkText] = useState('@newsregions');
  const [showWatermark, setShowWatermark] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  // Rewrite Mode State
  const [activeTab, setActiveTab] = useState<'infographic' | 'rewrite'>('infographic');
  const [rewriteInput, setRewriteInput] = useState('');
  const [rewriteOutput, setRewriteOutput] = useState('');

  useEffect(() => {
    const verifyKey = async () => {
      const hasKey = await checkApiKeySelection();
      setNeedsApiKey(!hasKey);
    };
    verifyKey();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    // Double check key before starting
    const hasKey = await checkApiKeySelection();
    if (!hasKey) {
      setNeedsApiKey(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageUrl = await generateInfographic(
        topic, 
        selectedStyle.prompt, 
        selectedRatio.id, 
        selectedModel.id,
        watermarkText,
        showWatermark
      );
      setGeneratedImage({
        url: imageUrl,
        topic: topic,
        timestamp: Date.now(),
        aspectRatio: selectedRatio.id
      });
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при создании изображения');
      // If the error implies missing key (404/403 often mapped), re-prompt
      if (err.message && err.message.includes("API Key")) {
        setNeedsApiKey(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRewriteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewriteInput.trim()) return;

    const hasKey = await checkApiKeySelection();
    if (!hasKey) {
      setNeedsApiKey(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setRewriteOutput('');

    try {
      const result = await rewriteText(rewriteInput);
      setRewriteOutput(result);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при рерайте текста');
      if (err.message && err.message.includes("API Key")) {
        setNeedsApiKey(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearTopic = () => {
    setTopic('');
  };

  const handleDownload = () => {
    if (generatedImage) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image
        ctx?.drawImage(img, 0, 0);
        
        if (ctx && showWatermark) {
            // Watermark configuration
            const text = watermarkText;
            const fontSize = Math.max(24, img.width * 0.04); // Responsive font size
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            
            // Add shadow for better visibility
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // Padding from bottom right
            const paddingX = img.width * 0.03;
            const paddingY = img.height * 0.02;
            
            ctx.fillText(text, img.width - paddingX, img.height - paddingY);
        }

        // Trigger download
        const link = document.createElement('a');
        link.download = `${generatedImage.topic.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      
      img.src = generatedImage.url;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Optional: Add toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col md:flex-row">
      {needsApiKey && <ApiKeyPrompt onKeySelected={() => setNeedsApiKey(false)} />}

      {/* Sidebar / Input Area */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-[#222222] border-r border-[#333333] p-6 pb-0 flex flex-col shadow-lg z-10 h-screen md:h-screen md:sticky md:top-0 overflow-y-auto">
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📰</span>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              News Regions
            </h1>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Новости регионов
          </p>
          
          {/* Mode Switcher */}
          <div className="flex p-1 bg-[#2a2a2a] rounded-lg border border-[#333333]">
            <button
              onClick={() => setActiveTab('infographic')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'infographic' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Инфографика
            </button>
            <button
              onClick={() => setActiveTab('rewrite')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'rewrite' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Рерайт
            </button>
          </div>
        </header>

        {activeTab === 'infographic' ? (
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="topic" className="block text-sm font-medium text-slate-300">
                  Тема инфографики
                </label>
                {topic && (
                  <button
                    type="button"
                    onClick={handleClearTopic}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    title="Очистить поле"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    Очистить
                  </button>
                )}
              </div>
              <div className="relative">
                <textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Например: Как работает фотосинтез, Польза витамина C..."
                  className="w-full h-24 p-4 bg-[#2a2a2a] border border-[#333333] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all text-slate-200 placeholder:text-slate-500 text-sm"
                  disabled={isGenerating}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Стиль оформления
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                {INFOGRAPHIC_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style)}
                    disabled={isGenerating}
                    className={`
                      p-2 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all text-left
                      ${selectedStyle.id === style.id
                        ? 'bg-indigo-900/30 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/50'
                        : 'bg-[#2a2a2a] border-[#333333] text-slate-400 hover:bg-[#333333] hover:text-slate-200'}
                      ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <span className="text-base">{style.icon}</span>
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-300 mb-2">
                Модель генерации
              </label>
              <div className="grid grid-cols-1 gap-2">
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setSelectedModel(model)}
                    disabled={isGenerating}
                    className={`
                      p-2 rounded-lg text-xs font-medium border flex items-center gap-3 transition-all
                      ${selectedModel.id === model.id
                        ? 'bg-indigo-900/30 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/50'
                        : 'bg-[#2a2a2a] border-[#333333] text-slate-400 hover:bg-[#333333] hover:text-slate-200'}
                      ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <span className="text-lg">{model.icon}</span>
                    <div className="flex flex-col items-start">
                      <span>{model.label}</span>
                      <span className="text-[10px] opacity-60">{model.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">
                  Ватермарка
                </label>
                <button
                  type="button"
                  onClick={() => setShowWatermark(!showWatermark)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${showWatermark ? 'bg-indigo-600 text-white' : 'bg-[#2a2a2a] text-slate-500'}`}
                >
                  {showWatermark ? 'Вкл' : 'Выкл'}
                </button>
              </div>
              {showWatermark && (
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Текст ватермарки..."
                  disabled={isGenerating}
                  className="w-full p-2 bg-[#2a2a2a] border border-[#333333] rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-200 text-xs"
                />
              )}
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-300 mb-2">
                Формат изображения
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setSelectedRatio(ratio)}
                    disabled={isGenerating}
                    className={`
                      p-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-2 transition-all
                      ${selectedRatio.id === ratio.id
                        ? 'bg-indigo-900/30 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/50'
                        : 'bg-[#2a2a2a] border-[#333333] text-slate-400 hover:bg-[#333333] hover:text-slate-200'}
                      ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <span className="text-lg">{ratio.icon}</span>
                    <div className="flex flex-col items-start">
                      <span>{ratio.label}</span>
                      <span className="text-[10px] opacity-60">{ratio.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 pt-2 pb-6 bg-[#222222] z-20 mt-auto -mx-6 px-6 border-t border-[#333333] shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
              <button
                type="submit"
                disabled={!topic.trim() || isGenerating}
                className={`
                  w-full py-4 rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2
                  ${!topic.trim() || isGenerating 
                    ? 'bg-[#2a2a2a] text-slate-500 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'}
                `}
              >
                {isGenerating ? (
                  'Генерируем...'
                ) : (
                  <>
                    <span>✨</span> Создать
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Rewrite Mode Sidebar */
          <form onSubmit={handleRewriteSubmit} className="flex-grow flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="rewriteInput" className="block text-sm font-medium text-slate-300">
                  Исходный текст
                </label>
                {rewriteInput && (
                  <button
                    type="button"
                    onClick={() => setRewriteInput('')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    Очистить
                  </button>
                )}
              </div>
              <textarea
                id="rewriteInput"
                value={rewriteInput}
                onChange={(e) => setRewriteInput(e.target.value)}
                placeholder="Вставьте текст, который нужно переписать..."
                className="w-full h-64 p-4 bg-[#2a2a2a] border border-[#333333] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all text-slate-200 placeholder:text-slate-500 text-sm"
                disabled={isGenerating}
              />
            </div>

            <div className="sticky bottom-0 pt-2 pb-6 bg-[#222222] z-20 mt-auto -mx-6 px-6 border-t border-[#333333] shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
              <button
                type="submit"
                disabled={!rewriteInput.trim() || isGenerating}
                className={`
                  w-full py-4 rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2
                  ${!rewriteInput.trim() || isGenerating 
                    ? 'bg-[#2a2a2a] text-slate-500 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'}
                `}
              >
                {isGenerating ? (
                  'Переписываем...'
                ) : (
                  <>
                    <span>📝</span> Переписать
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-4 pb-6 border-t border-[#333333] text-xs text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          News Regions
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-grow bg-[#1a1a1a] flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full h-full max-w-4xl flex items-center justify-center">
          
          {/* Empty State */}
          {!isGenerating && !generatedImage && !error && !rewriteOutput && (
            <div className="text-center text-slate-500 max-w-md">
              <div className="text-6xl mb-4 opacity-10">
                {activeTab === 'infographic' ? '📊' : '📝'}
              </div>
              <h3 className="text-lg font-medium text-slate-400 mb-2">
                {activeTab === 'infographic' ? 'Здесь появится ваша инфографика' : 'Здесь появится переписанный текст'}
              </h3>
              <p>
                {activeTab === 'infographic' 
                  ? 'Выберите тему, стиль и формат, затем нажмите кнопку создания.'
                  : 'Вставьте текст в поле слева и нажмите "Переписать".'}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="bg-[#222222] p-12 rounded-2xl shadow-sm border border-[#333333] flex flex-col items-center">
              <LoadingSpinner />
              {activeTab === 'infographic' ? (
                <>
                  <p className="text-slate-400 text-sm mt-4">Применяем стиль: {selectedStyle.label}</p>
                  <p className="text-slate-500 text-xs mt-1">Формат: {selectedRatio.label}</p>
                </>
              ) : (
                <p className="text-slate-400 text-sm mt-4">Анализируем и улучшаем текст...</p>
              )}
            </div>
          )}

          {/* Error State */}
          {error && !isGenerating && (
            <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-6 text-center max-w-md">
              <div className="text-red-500 text-3xl mb-3">⚠️</div>
              <h3 className="text-red-400 font-medium mb-1">Ошибка</h3>
              <p className="text-red-300 text-sm">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-4 text-xs font-semibold text-red-400 hover:text-red-300 underline"
              >
                Закрыть
              </button>
            </div>
          )}

          {/* Infographic Result State */}
          {activeTab === 'infographic' && generatedImage && !isGenerating && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300 w-full">
              <div className="relative group rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10 bg-[#222222] max-w-full inline-block">
                 {/* Dynamic Aspect Ratio container constraints */}
                 <img 
                    src={generatedImage.url} 
                    alt={`Инфографика на тему: ${generatedImage.topic}`}
                    className="max-h-[80vh] w-auto object-contain bg-[#222222]"
                    style={{ aspectRatio: generatedImage.aspectRatio ? generatedImage.aspectRatio.replace(':', '/') : '3/4' }}
                 />
                 
                 {/* Watermark Overlay */}
                 {showWatermark && (
                   <div className="absolute bottom-[3%] right-[3%] text-white/90 font-bold text-xl drop-shadow-md pointer-events-none select-none" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                      {watermarkText}
                   </div>
                 )}

                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleDownload}
                  className="bg-[#222222] border border-[#333333] text-slate-300 px-6 py-2 rounded-full font-medium shadow-sm hover:bg-[#2a2a2a] hover:border-indigo-500/50 hover:text-indigo-400 transition-all flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Скачать
                </button>
              </div>
            </div>
          )}

          {/* Rewrite Result State */}
          {activeTab === 'rewrite' && rewriteOutput && !isGenerating && (
            <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-300">
              <div className="bg-[#222222] border border-[#333333] rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#333333] bg-[#2a2a2a]/50">
                  <h3 className="font-medium text-slate-200 flex items-center gap-2">
                    <span>✨</span> Результат
                  </h3>
                  <button
                    onClick={() => copyToClipboard(rewriteOutput)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-indigo-500/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Копировать
                  </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
                    {rewriteOutput}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default App;