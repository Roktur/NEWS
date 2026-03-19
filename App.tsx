import React, { useState, useCallback, useRef } from 'react';
import { generateInfographic, rewriteText, DEFAULT_MODELS } from './services/geminiService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ApiKeyPrompt } from './components/ApiKeyPrompt';
import { GeneratedImage, InfographicStyle, AIModel } from './types';

// ─── Built-in styles ─────────────────────────────────────────────────────────

const BUILTIN_STYLES: InfographicStyle[] = [
  { id: 'victory_day', label: '9 мая', icon: '🎖️', prompt: 'Professional festive infographic layout for Victory Day (May 9th, День Победы). High-quality patriotic aesthetic featuring Soviet/Russian military symbols, eternal flame, red carnations, St. George ribbon (orange and black stripes), stars, and war memorial elements. Background: Deep red and black with golden accents, dramatic sky, or memorial architectural settings. Visual elements: Victory stars, carnations, St. George ribbon, eternal flame, "1941-1945" period markers, soldier silhouettes. Color palette: Deep reds, black, golden yellow, and orange accents. Typography: Bold, powerful fonts conveying strength, honor, and remembrance. The overall atmosphere is solemn, proud, patriotic, and deeply respectful. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'march8', label: '8 Марта', icon: '🌷', prompt: 'Professional festive infographic layout for International Women\'s Day (March 8th, Международный женский день). High-quality elegant aesthetic featuring spring flowers, tulips, roses, mimosa blossoms, delicate floral patterns, and feminine beauty elements. Background: Soft pinks, lavenders, and warm spring colors. Visual elements: Bouquets, butterflies, spring motifs, hearts, elegant feminine icons. Color palette: Soft pink, lavender purple, warm white, golden accents, and spring greens. Typography: Elegant, graceful script or refined serif fonts. The overall atmosphere is warm, celebratory, beautiful, and joyfully feminine. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'may1', label: '1 мая', icon: '🛠️', prompt: 'Professional festive infographic layout for International Workers\' Day / Labour Day (May 1st, День труда, Первомай). Bold graphic style featuring labor symbols, red flags, spring flowers, worker silhouettes, gear wheels, tools, and solidarity motifs. Background: Bold reds and whites, or spring green with festive elements. Visual elements: Hammers, gears, flags, spring flowers like tulips, fists raised in unity, "1 МАЯ" text decoration. Color palette: Vibrant reds, whites, and spring greens with golden accents. Typography: Bold, expressive display fonts evoking solidarity and celebration. Atmosphere is festive, energetic, hopeful, and celebratory. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'february23', label: '23 февраля', icon: '🇷🇺', prompt: 'Professional festive infographic layout for Defender of the Fatherland Day (February 23rd, День защитника Отечества). High-quality patriotic aesthetic featuring military symbols, camouflage patterns, stars, eagles, Russian military emblems, and masculine strength elements. Background: Military green, dark blue, or dramatic dark backgrounds with light effects. Visual elements: Military stars, helmet, aircraft, tank silhouettes, laurel wreaths, patriotic ribbons. Color palette: Military greens, dark blues, golden stars, and patriotic red accents. Typography: Strong, bold sans-serif fonts conveying military precision and strength. The overall atmosphere is powerful, proud, masculine, and patriotically celebratory. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'aviation', label: 'Авиа', icon: '✈️', prompt: 'Professional aviation and aerospace infographic layout. High-quality modern aesthetic featuring aircraft, airport elements, flight routes, jet engines, and aviation technology. Background: Sky blue gradients, cloud layers, or sleek dark cockpit-style backgrounds. Visual elements: Airplanes, runways, air traffic control, flight paths, propellers, aviation instruments. Color palette: Sky blues, silver metallic, white clouds, with bold accent colors. Typography: Clean, technical sans-serif fonts conveying precision and professionalism. The overall atmosphere is dynamic, technical, modern, and high-altitude. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'automotive', label: 'Авто', icon: '🚗', prompt: 'Professional automotive and transportation infographic layout. High-quality modern aesthetic featuring cars, roads, engines, auto mechanics, and vehicle technology. Background: Dark asphalt, garage scenes, or sleek showroom environments. Visual elements: Cars, tires, engines, speedometers, traffic signs, auto parts, keys. Color palette: Metallic silvers, deep blacks, racing reds, chrome highlights. Typography: Bold, dynamic fonts conveying speed, power, and automotive culture. The overall atmosphere is modern, powerful, technical, and road-ready. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'astrological', label: 'Астро', icon: '✨', prompt: 'Professional astrology and horoscope infographic layout. Mystical, celestial aesthetic featuring zodiac signs, stars, planets, moon phases, celestial maps, and cosmic elements. Background: Deep space purples, midnight blues, dark with glowing star fields. Visual elements: Zodiac wheel, constellation patterns, moon and sun symbols, crystals, mystical patterns. Color palette: Deep purples, navy blues, silver stars, golden celestial symbols, and ethereal glows. Typography: Elegant, mystical serif or decorative fonts evoking cosmic mystery. The overall atmosphere is mystical, cosmic, dreamlike, and astrologically rich. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'banking', label: 'Банки', icon: '🏦', prompt: 'Professional banking and financial services infographic layout. Clean, authoritative aesthetic featuring bank buildings, coins, bank cards, financial graphs, and money flow elements. Background: Deep navy blue or forest green with gold accents, conveying trust and stability. Visual elements: Bank columns, coins, credit cards, percentage symbols, vault doors, financial charts. Color palette: Deep navy, forest green, gold, white, and silver accents. Typography: Trustworthy, professional serif or clean sans-serif fonts. The overall atmosphere is stable, secure, professional, and financially authoritative. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'biology', label: 'Биология', icon: '🦋', prompt: 'Professional biology and life science infographic layout. Scientific aesthetic featuring cells, DNA helixes, organisms, ecosystems, and biological processes. Background: Clean white or deep science-lab backgrounds with bright scientific accents. Visual elements: DNA strands, cell diagrams, microscope imagery, plants, animals, biological cycles. Color palette: Scientific greens, blues, warm organic tones, and clinical whites. Typography: Clean, educational fonts that convey scientific clarity. The overall atmosphere is educational, scientific, precise, and biologically inspiring. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'business_humor', label: 'Бизнес с юмором', icon: '😄', prompt: 'Humorous business infographic layout that blends corporate aesthetics with funny, relatable memes and workplace humor. Playful yet professional style featuring office scenarios, funny business graphs, cartoon executives, and corporate joke elements. Background: Office white or subtle corporate background with comedic elements added. Visual elements: Funny charts (like "productivity vs coffee"), cartoon businesspeople, meme-style icons, office props. Color palette: Professional colors (navy, gray) mixed with bright comedic accent colors. Typography: Mix of formal business fonts with casual, funny script touches. The overall atmosphere is entertaining, relatable, office-humor-forward, and laugh-inducing. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'breaking_news', label: 'Важная новость', icon: '🚨', prompt: 'High-impact breaking news infographic layout. Urgent, attention-grabbing aesthetic featuring news alert elements, bold typography, red warning indicators, and media broadcast design. Background: Deep black or dark red with urgent warning stripes or news ticker elements. Visual elements: Breaking news banner, alert symbols, bold exclamation marks, news camera icons, microphone graphics. Color palette: Urgent reds, alarming oranges, high-contrast blacks and whites. Typography: Bold, heavy display fonts with strong urgency and impact. The overall atmosphere is urgent, important, attention-demanding, and journalistically powerful. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'fun', label: 'Весёлая', icon: '😂', prompt: 'Fun, playful, and humorous infographic layout. Bright, cheerful aesthetic with cartoonish elements, emojis, confetti, and joyful visual design. Background: Bright colorful backgrounds with fun patterns, polka dots, or rainbow gradients. Visual elements: Laughing faces, stars, confetti, speech bubbles, fun icons, cartoon-style graphics. Color palette: Rainbow brights — yellow, pink, orange, cyan, green — all vibrant and cheerful. Typography: Bubbly, rounded display fonts that look friendly and fun. The overall atmosphere is joyful, playful, lighthearted, and genuinely entertaining. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'government', label: 'Власть', icon: '🏛️', prompt: 'Professional government and civic infographic layout. Authoritative, institutional aesthetic featuring government buildings, official seals, patriotic symbols, and civic governance elements. Background: Classic architectural backgrounds — columns, government buildings, official blue/red/white tones. Visual elements: Government seals, flag elements, legislative chambers, official documents, civic emblems. Color palette: Official blues, patriotic reds and whites, gold accents, and authoritative grays. Typography: Formal, dignified serif fonts conveying governmental authority and officialness. The overall atmosphere is authoritative, civic, trustworthy, and institutionally strong. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'gibdd', label: 'ГИБДД', icon: '🚔', prompt: 'Professional traffic police and road safety infographic layout. Official aesthetic featuring police vehicles, road signs, traffic regulations, and road safety elements. Background: Official police blue and white, or road/highway background scenes. Visual elements: Police car, traffic signs, road markings, breathalyzer, speed limit signs, radar gun, handcuffs. Color palette: Official police blues and whites, warning yellows, stop reds, and road safety colors. Typography: Strong, clear official fonts conveying law enforcement authority. The overall atmosphere is official, safety-focused, law-enforcing, and road-regulation-oriented. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'city', label: 'Город', icon: '🏙️', prompt: 'Professional urban city life infographic layout. Modern city aesthetic featuring skylines, streets, architecture, urban culture, and city infrastructure. Background: City skyline panoramas, urban street scenes, or modern architectural backdrops. Visual elements: Skyscrapers, city maps, street signs, transportation, parks, public spaces. Color palette: Urban grays, city blues, glass reflections, with warm evening light accents. Typography: Modern, clean sans-serif fonts reflecting urban sophistication. The overall atmosphere is dynamic, cosmopolitan, modern, and city-life inspired. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'gost', label: 'ГОСТ', icon: '📋', prompt: 'Professional standards and GOST (Russian state standards) infographic layout. Technical, precise aesthetic featuring quality marks, certification symbols, measurement diagrams, and standards documentation. Background: Clean technical white or light gray with precise grid lines and measurement marks. Visual elements: Quality stamps, ГОСТ certification badges, technical diagrams, measurement scales, approval checkmarks. Color palette: Official document colors — whites, grays, blues, and red approval stamps. Typography: Technical, precise monospaced or sans-serif fonts used in official standards. The overall atmosphere is technical, precise, official, and quality-standards-focused. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'gosuslugi', label: 'Госуслуги', icon: '📱', prompt: 'Professional government services and Gosuslugi portal infographic layout. Clean digital government aesthetic featuring the Gosuslugi visual identity, digital documents, online service icons, and citizen service elements. Background: Gosuslugi-inspired blue and white, with digital/app interface elements. Visual elements: Smartphone with government app, digital documents, service categories, verification badges, QR codes. Color palette: Official Gosuslugi blue (#0057FF), white, and supporting accent colors. Typography: Clean, accessible sans-serif fonts matching government digital standards. The overall atmosphere is digital, civic, accessible, and e-government oriented. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'gto', label: 'ГТО', icon: '🏅', prompt: 'Professional GTO (Готов к труду и обороне) fitness standards infographic layout. Energetic sports and fitness aesthetic featuring athletic achievements, GTO badges, fitness exercises, and national fitness program elements. Background: Patriotic sport backgrounds with dynamic athletic movement. Visual elements: GTO gold/silver/bronze badges, running figures, strength exercises, fitness charts, Russian patriotic motifs. Color palette: Gold, silver, bronze award colors with patriotic red, white, and blue accents. Typography: Bold, sporty fonts conveying physical achievement and national pride. The overall atmosphere is athletic, motivated, patriotically sporty, and achievement-focused. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'business', label: 'Деловой', icon: '💼', prompt: 'Professional business and corporate infographic layout. Clean, authoritative aesthetic featuring business charts, corporate settings, professional icons, and executive imagery. Background: Dark corporate backgrounds or clean white with professional accents. Visual elements: Business graphs, briefcase, handshake, corporate building, pie charts, KPI metrics. Color palette: Corporate navy blues, professional grays, gold accents, and clean whites. Typography: Professional, clean sans-serif fonts conveying business authority. The overall atmosphere is professional, strategic, corporate, and executive-level. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'doodle', label: 'Дудл', icon: '✏️', prompt: 'Creative hand-drawn doodle style infographic layout. Artsy, sketchy aesthetic featuring hand-drawn illustrations, pen-and-ink drawings, scribbles, and whimsical artwork. Background: White or kraft paper texture with sketch marks and doodle patterns. Visual elements: Hand-drawn icons, sketch arrows, doodle borders, pen scribbles, cross-hatching, cartoon-style drawings. Color palette: Pen black on white, with selective watercolor-style color accents (blues, yellows, pinks). Typography: Handwriting-style or chalkboard fonts that feel organic and artistic. The overall atmosphere is creative, artistic, handcrafted, and charming. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'food', label: 'Еда', icon: '🍳', prompt: 'Professional food and culinary infographic layout. Appetizing, vibrant aesthetic featuring delicious food photography-inspired art, kitchen elements, cooking tools, and culinary culture. Background: Warm kitchen tones, rustic wood textures, or clean white food photography style. Visual elements: Beautifully rendered food items, cooking utensils, chef hat, ingredients, recipe cards. Color palette: Warm appetizing tones — golden yellows, tomato reds, herb greens, cream whites. Typography: Warm, inviting fonts that feel culinary and approachable. The overall atmosphere is appetizing, warm, culinary, and mouthwateringly inspired. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'animals', label: 'Животные', icon: '🐾', prompt: 'Professional wildlife and animals infographic layout. Natural, vibrant aesthetic featuring diverse animals, their habitats, natural behaviors, and wildlife facts. Background: Natural habitat backgrounds — savanna, forest, ocean, or arctic environments. Visual elements: Illustrated or stylized animals, paw prints, wildlife maps, animal anatomy diagrams, conservation symbols. Color palette: Natural earth tones, forest greens, ocean blues, savanna golds, and vibrant animal colors. Typography: Friendly, educational fonts suitable for nature content. The overall atmosphere is natural, educational, wildlife-celebrating, and beautifully biodiversity-focused. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'zhkh', label: 'ЖКХ', icon: '🏠', prompt: 'Professional housing and communal services (ЖКХ) infographic layout. Clear, practical aesthetic featuring residential buildings, utility services, maintenance, and housing management elements. Background: Residential building facades, utility infrastructure, or clean schematic diagrams. Visual elements: Apartment buildings, utility meters, plumbing symbols, heating radiators, payment receipts, maintenance tools. Color palette: Practical blues and greens for water/gas, warm oranges for heating, institutional grays. Typography: Clear, bureaucratic yet readable fonts suitable for official housing information. The overall atmosphere is practical, informative, civic, and housing-service-oriented. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'mysterious', label: 'Загадочная', icon: '🕵️', prompt: 'Mysterious and detective-style infographic layout. Dark, suspenseful aesthetic featuring detective elements, mystery clues, shadow and light contrasts, and investigative imagery. Background: Dark atmospheric backgrounds with dramatic spotlight effects, foggy ambiance, or noir city night scenes. Visual elements: Magnifying glass, question marks, shadow figures, detective hat, mystery symbols, evidence boards. Color palette: Deep blacks and charcoals, dramatic golds and ambers, mysterious purples, with bright spotlight accents. Typography: Film noir or detective-style fonts — stylized serifs or monospace giving a mysterious feel. The overall atmosphere is suspenseful, intriguing, mysterious, and detective-noir inspired. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'salary_pension', label: 'Зарплата и пенсия', icon: '💰', prompt: 'Professional salary and pension infographic layout. Clear financial aesthetic featuring income charts, pension savings, salary calculations, and retirement planning elements. Background: Financial document style backgrounds — clean whites or professional blues. Visual elements: Money bags, salary graphs, pension piggy bank, calculator, financial charts, banknotes, growth arrows. Color palette: Money greens, financial blues, gold coin yellows, and trustworthy grays. Typography: Clear, professional financial fonts for easy reading of numbers and data. The overall atmosphere is financially informative, clear, trustworthy, and economically practical. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'health', label: 'Здоровье', icon: '❤️', prompt: 'Professional health and wellness infographic layout. Clean, medical-inspired aesthetic featuring health statistics, wellness tips, body systems, and medical information. Background: Clean medical white, fresh greens, or health-focused calm backgrounds. Visual elements: Heart, medical cross, body silhouettes, health charts, vitamins, exercise icons, pulse wave. Color palette: Medical whites, health greens, heart reds, calming blues, and fresh accents. Typography: Clear, readable medical-style fonts conveying health authority. The overall atmosphere is healthy, caring, medically informative, and wellness-promoting. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'ai_news', label: 'ИИ', icon: '🤖', prompt: 'Professional artificial intelligence and technology news infographic layout. Futuristic, cutting-edge aesthetic featuring AI concepts, neural networks, robot elements, and tech innovation imagery. Background: Dark tech backgrounds with glowing circuit patterns, digital grids, or cyberpunk neon effects. Visual elements: Robot faces, neural network diagrams, binary code, AI brain representations, tech gadgets, glowing interfaces. Color palette: Neon blues, electric purples, matrix greens, dark backgrounds, with glowing tech accents. Typography: Futuristic sans-serif or monospace fonts evoking AI and digital intelligence. The overall atmosphere is futuristic, cutting-edge, technically impressive, and AI-forward. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'fact', label: 'Интересный факт', icon: '💡', prompt: 'Professional interesting facts infographic layout. Engaging, discovery-focused aesthetic featuring lightbulb moments, question and answer elements, wow factor visuals, and fact-spotlight design. Background: Clean bright backgrounds with spotlight effects or dark backgrounds with illuminated fact bubbles. Visual elements: Light bulbs, exclamation marks, magnifying glass, "Did you know?" style callouts, number highlights. Color palette: Bright golden yellows, vivid blues, orange accents, and clean whites to highlight key facts. Typography: Bold, readable display fonts that make facts pop and engage the reader. The overall atmosphere is fascinating, educational, surprising, and fact-celebrating. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'internet', label: 'Интернет', icon: '🌐', prompt: 'Professional internet and digital technology infographic layout. Modern, connected aesthetic featuring global networks, internet symbols, digital communication, and web technology. Background: Digital globe networks, fiber optic light trails, or clean tech interfaces. Visual elements: World map with connection lines, WiFi symbols, browser windows, social media icons, data streams. Color palette: Digital blues, network teals, internet purples, white, and electric accent colors. Typography: Modern, clean digital fonts suited for technology content. The overall atmosphere is connected, global, digital, and technology-forward. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'historical', label: 'Исторический', icon: '📜', prompt: 'Professional historical infographic layout. Classic, archival aesthetic featuring historical documents, vintage maps, historical portraits, timeline elements, and period-specific design. Background: Aged parchment textures, old paper, antique map backgrounds, or sepia-toned vintage environments. Visual elements: Scroll documents, historical illustrations, timeline markers, antique portraits, period artifacts, laurel wreaths. Color palette: Sepia browns, aged golds, parchment creams, ink blacks, and vintage warm tones. Typography: Classic serif fonts, calligraphy-inspired styles, or period-appropriate typography. The overall atmosphere is historically rich, scholarly, archival, and timelessly educational. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'cybersecurity', label: 'Кибербезопасность', icon: '🛡️', prompt: 'Professional cybersecurity and digital protection infographic layout. Secure, technical aesthetic featuring shields, locks, encrypted data, firewalls, and digital defense elements. Background: Dark cyberpunk or matrix-style backgrounds with digital protection themes. Visual elements: Shield icons, padlocks, encryption symbols, firewall representations, hacker vs defender imagery, binary code. Color palette: Dark backgrounds, glowing greens (like Matrix), electric blues, security gold, and warning reds. Typography: Monospace or technical fonts conveying code and cybersecurity. The overall atmosphere is secure, technical, protective, and cyber-defense-focused. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'space', label: 'Космос', icon: '🚀', prompt: 'Professional space and astronomy infographic layout. Cosmic, awe-inspiring aesthetic featuring planets, stars, galaxies, spacecraft, and space exploration imagery. Background: Deep space backgrounds — star fields, nebulas, galaxy spirals, or planet surfaces. Visual elements: Rockets, planets, moons, astronauts, space stations, telescopes, cosmic phenomena. Color palette: Deep space blacks, nebula purples and blues, star golds, planet oranges and reds, Milky Way whites. Typography: Futuristic, space-age fonts conveying cosmic grandeur and exploration. The overall atmosphere is vast, awe-inspiring, scientifically exciting, and cosmically magnificent. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'culture', label: 'Культура', icon: '🎨', prompt: 'Professional culture and arts infographic layout. Creative, artistic aesthetic featuring visual arts, theater, architecture, literature, and cultural heritage. Background: Gallery white walls, dramatic theater curtains, or cultural heritage architecture. Visual elements: Paintbrushes, art palette, theatrical masks, musical notes, books, cultural symbols, famous artworks. Color palette: Rich artistic tones — gallery whites, dramatic reds, golden cultural accents, and vibrant artistic colors. Typography: Elegant, cultural fonts that reflect artistic sophistication. The overall atmosphere is cultured, artistic, creative, and humanities-celebrating. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'medical', label: 'Медицинский', icon: '🏥', prompt: 'Professional medical and healthcare infographic layout. Clean, sterile-yet-warm aesthetic featuring medical imagery, health statistics, medical procedures, and healthcare information. Background: Clean hospital white, medical blue, or clinical but humanized environments. Visual elements: Medical cross, stethoscope, pills, anatomical diagrams, hospital building, doctor silhouettes, health charts. Color palette: Clinical whites, medical blues, heart reds, pharmacy greens, and sterile accents. Typography: Clear, authoritative medical fonts ensuring clarity and trustworthiness. The overall atmosphere is professional, health-focused, medically accurate, and care-inspiring. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'messenger_max', label: 'Мессенджер MAX', icon: '💬', prompt: 'Professional messaging app and VK Messenger MAX style infographic layout. Modern digital communication aesthetic featuring chat bubbles, notification elements, messaging interfaces, and VK/MAX visual style. Background: VK-style deep blue gradients or modern messenger app interface backgrounds. Visual elements: Chat bubbles, message notifications, user avatars, emoji, voice/video call icons, file sharing symbols. Color palette: VK blue (#0077FF), white, light grays, and messenger interface accent colors. Typography: Modern, clean sans-serif fonts matching social media and messaging app standards. The overall atmosphere is social, connected, communicative, and digitally friendly. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'weather', label: 'Метео', icon: '🌤️', prompt: 'Professional meteorological weather infographic layout. Clear, atmospheric aesthetic featuring weather maps, atmospheric phenomena, temperature data, and meteorological elements. Background: Atmospheric sky backgrounds — partly cloudy, storm formations, or weather satellite views. Visual elements: Weather symbols, temperature scales, cloud formations, wind arrows, precipitation maps, weather stations. Color palette: Sky blues, cloud whites, storm grays, sunny yellows, rain blues, and atmospheric gradients. Typography: Clear, readable weather forecast fonts suitable for data presentation. The overall atmosphere is informative, atmospheric, weather-science-focused, and forecasting-oriented. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'metro', label: 'Метро', icon: '🚇', prompt: 'Professional metro and subway system infographic layout. Urban transit aesthetic featuring metro maps, station designs, subway trains, and urban transportation elements. Background: Metro station architectural elements — arched ceilings, platform scenes, or metro map backgrounds. Visual elements: Metro train, station signs, metro map lines, turnstiles, escalators, route indicators. Color palette: Metro line colors (various reds, blues, greens, etc.), underground station grays, and signage yellows. Typography: Clear transit-style fonts used in metro signage and maps. The overall atmosphere is urban, efficient, transit-focused, and underground-journey-inspiring. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'world', label: 'Мир', icon: '🌍', prompt: 'Professional world news and global affairs infographic layout. Global, connected aesthetic featuring world maps, international flags, global statistics, and world events. Background: World map projections, globe imagery, or international event backgrounds. Visual elements: World globe, country outlines, international flags, global statistics charts, connection lines, UN-style icons. Color palette: Ocean blues, earth greens, continent browns, with international accent colors. Typography: International, neutral fonts suited for global news presentation. The overall atmosphere is global, informed, internationally-minded, and world-event-aware. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'minimal', label: 'Минимализм', icon: '⬜', prompt: 'Clean minimalist infographic layout. Stripped-back, elegant aesthetic focusing on whitespace, simple geometric shapes, and maximum clarity. Background: Pure white or very light gray — clean and uncluttered. Visual elements: Simple geometric shapes, thin lines, minimal icons, essential data only, generous whitespace. Color palette: White, light gray, with one carefully chosen accent color (black, navy, or a single vivid color). Typography: Elegant thin or regular weight sans-serif fonts — maximum readability and sophistication. The overall atmosphere is refined, sophisticated, clean, and beautifully restrained. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'scam', label: 'Мошенники', icon: '🎭', prompt: 'Professional fraud and scammer awareness infographic layout. Alert, warning-focused aesthetic featuring fraud symbols, warning signs, scam tactics, and public safety messaging. Background: Dark warning backgrounds with red alert elements, or official police-style layouts. Visual elements: Warning triangles, phishing hook, masks, fraud symbols, phone scam icons, cybercriminal imagery. Color palette: Warning reds and oranges, cautionary yellows, dark backgrounds, with white alert text. Typography: Bold, urgent fonts that convey serious public safety warnings. The overall atmosphere is warning-focused, protective, public-safety-oriented, and anti-fraud. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'musical', label: 'Музыкальный', icon: '🎵', prompt: 'Professional music and musical arts infographic layout. Rhythmic, artistic aesthetic featuring musical notes, instruments, sound waves, concert elements, and musical culture. Background: Concert stage lighting, music studio environments, or artistic music-themed backgrounds. Visual elements: Musical notes, treble clefs, piano keys, guitar, violin, microphone, sound equalizer waves. Color palette: Deep concert blacks and purples, spotlight golds, stage lighting colors, vibrant electric blues. Typography: Artistic, rhythmic fonts reflecting musicality and creative expression. The overall atmosphere is musical, rhythmic, creative, and artistically inspiring. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'mchs', label: 'МЧС', icon: '🚒', prompt: 'Professional emergency services and МЧС (Ministry of Emergency Situations) infographic layout. Official emergency aesthetic featuring firefighters, rescue operations, emergency vehicles, and disaster response elements. Background: Emergency red and orange backgrounds, fire scene environments, or official МЧС dark blue. Visual elements: Fire truck, firefighter equipment, rescue helicopter, emergency symbols, МЧС emblem elements, safety warnings. Color palette: Emergency reds and oranges, МЧС official blue, white, yellow safety colors. Typography: Strong, official fonts conveying emergency authority and rapid response. The overall atmosphere is urgent, official, safety-critical, and emergency-response-focused. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'newyear', label: 'Новогодний', icon: '🎄', prompt: 'Festive New Year and Christmas infographic layout. Magical, celebratory aesthetic featuring winter holiday elements, Christmas trees, snowflakes, fireworks, and New Year celebration imagery. Background: Magical winter night sky, decorated Christmas tree backgrounds, or festive starry scenes. Visual elements: Christmas tree, snowflakes, fireworks, champagne glasses, party decorations, "С Новым Годом!" text treatments. Color palette: Festive reds and greens, golden stars, sparkly silvers, deep midnight blues, and glowing warm whites. Typography: Festive, celebratory display fonts with holiday spirit. The overall atmosphere is magical, festive, warm, and joyfully celebratory. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'news', label: 'Новостная', icon: '📰', prompt: 'Professional news media infographic layout. Journalistic, authoritative aesthetic featuring newspaper-inspired design, news headline elements, breaking news banners, and media presentation. Background: Clean newsprint-inspired backgrounds or modern digital news interface designs. Visual elements: Newspaper columns, news banners, reporter microphone, news ticker, camera, editorial graphics. Color palette: Journalistic black and white with selective red headline accents, professional grays. Typography: Newspaper-style serif fonts for body text, bold sans-serif for headlines — classic journalistic presentation. The overall atmosphere is informative, journalistic, authoritative, and news-media-professional. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'nostalgia', label: 'Ностальгия', icon: '🖼️', prompt: 'Nostalgic retro Soviet/Russian infographic layout. Warm, sentimental aesthetic featuring vintage Soviet-era graphic design, old Russian visual culture, and nostalgic elements from the USSR era. Background: Faded Soviet poster backgrounds, vintage wallpaper patterns, or aged photograph textures. Visual elements: Vintage Soviet illustrations, old Russian consumer goods, classic car silhouettes, Sputnik, Stalin-era architecture. Color palette: Faded Soviet reds, warm sepia tones, aged paper yellows, and nostalgic earth tones. Typography: Classic Soviet-era Cyrillic fonts or retro sans-serif styles. The overall atmosphere is nostalgic, sentimental, vintage, and Soviet-era-celebrating. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'education', label: 'Образование', icon: '📚', prompt: 'Professional education and learning infographic layout. Clear, inspiring aesthetic featuring school and university elements, learning symbols, knowledge sharing, and educational content. Background: Clean classroom backgrounds, library settings, or academic institutional environments. Visual elements: Books, graduation cap, pencils, chalkboard elements, knowledge symbols, school building, students. Color palette: Academic blues, warm educational tans, knowledge greens, and cheerful learning yellows. Typography: Clear, readable educational fonts that are approachable and informative. The overall atmosphere is educational, inspiring, knowledge-focused, and academically oriented. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'weather_pixar', label: 'Погода (Пиксар)', icon: '⛅', prompt: 'Pixar animation-style weather infographic. Charming, 3D-rendered aesthetic inspired by Pixar/Disney animated movies featuring adorable anthropomorphic weather elements, soft lighting, and cartoon physics. Background: Soft animated sky backgrounds with fluffy cartoon clouds, warm Pixar-style lighting. Visual elements: Adorable cartoon sun with face, cute rain cloud characters, friendly snowflakes, animated wind, cheerful rainbow. Color palette: Bright, saturated Pixar colors — warm sunlight yellows, soft sky blues, gentle cloud whites, playful rainbow accents. Typography: Friendly, rounded fonts like those in animated movies — warm and inviting. The overall atmosphere is charming, animated, delightfully Pixar-inspired, and heartwarming. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'generations', label: 'Поколение', icon: '👥', prompt: 'Professional generational demographics infographic layout. Multi-generational aesthetic featuring different age groups (Baby Boomers, Gen X, Millennials, Gen Z, Alpha), lifestyle comparisons, and demographic trends. Background: Clean sociological study backgrounds or multi-generational scene illustrations. Visual elements: Generational timeline, age group silhouettes, technology evolution, lifestyle symbols across eras, generation labels. Color palette: Multi-generational palette — vintage tones for older, vibrant modern colors for younger generations. Typography: Clear demographic fonts that feel both journalistic and academic. The overall atmosphere is sociological, multi-generational, insightful, and generationally comparative. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'holidays', label: 'Праздники', icon: '🎉', prompt: 'Festive holidays and celebration infographic layout. Vibrant, joyful aesthetic featuring general celebration elements, party symbols, festive decorations, and holiday cheer. Background: Festive party backgrounds with streamers, confetti, and celebration energy. Visual elements: Party poppers, confetti, balloons, gift boxes, fireworks, celebration banners, clinking glasses. Color palette: Rainbow festive colors — golds, reds, blues, greens, and sparkling silvers all celebrating together. Typography: Celebratory display fonts with festive energy and holiday spirit. The overall atmosphere is joyful, celebratory, festive, and holiday-season-perfect. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'products', label: 'Продукты', icon: '🛒', prompt: 'Professional grocery and consumer products infographic layout. Fresh, retail-oriented aesthetic featuring food products, shopping elements, pricing, and consumer goods. Background: Fresh market or supermarket-inspired backgrounds, clean white product presentation. Visual elements: Shopping cart, product displays, fresh produce, price tags, packaging, store shelves, consumer goods. Color palette: Fresh market greens, clean whites, product-focused colors, retail blues, and appetite-stimulating warm tones. Typography: Clear, retail-appropriate fonts for product information presentation. The overall atmosphere is fresh, consumer-friendly, retail-oriented, and product-showcasing. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'psychological', label: 'Психологический', icon: '🧠', prompt: 'Professional psychology and mental health infographic layout. Thoughtful, mind-focused aesthetic featuring brain imagery, psychological concepts, mental wellness symbols, and cognitive science visuals. Background: Calm, therapeutic backgrounds — soft blues, purples, or mindful neutral tones. Visual elements: Brain illustration, thought bubbles, mind map elements, psychology symbols, cognitive diagrams, mental wellness icons. Color palette: Calming blues, therapeutic purples, mindful teals, gentle pinks, and serene neutrals. Typography: Approachable, thoughtful fonts that feel both professional and human. The overall atmosphere is thoughtful, psychologically informed, mentally-health-positive, and mind-exploring. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'retro', label: 'Ретро', icon: '📺', prompt: 'Retro vintage 70s-80s Soviet/Russian infographic layout. Nostalgic retro aesthetic featuring vintage graphic design styles, old TV set imagery, cassette tapes, vintage electronics, and retro pop art. Background: Retro wallpaper patterns, vintage TV screen effects, or old-school graphic design backdrops. Visual elements: Old TV set, cassette tape, vinyl record, retro telephone, 8-bit game elements, vintage Soviet consumer electronics. Color palette: Retro oranges, browns, harvest golds, avocado greens, and vintage pastel tones. Typography: Retro slab serif, groovy 70s fonts, or pixel-style text. The overall atmosphere is nostalgic, retro-cool, vintage, and timelessly old-school charming. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'recipes', label: 'Рецепты блюд', icon: '🍽️', prompt: 'Professional cooking recipes infographic layout. Warm, appetizing aesthetic featuring recipe ingredients, cooking steps, kitchen elements, and culinary art. Background: Warm kitchen environments, rustic wooden textures, or clean cooking blog-style white. Visual elements: Recipe ingredients laid out artfully, cooking pots, measuring cups, step-by-step instruction graphics, beautiful finished dishes. Color palette: Warm kitchen tones — cream whites, warm yellows, herb greens, spice oranges, and appetizing food colors. Typography: Friendly recipe-style fonts, warm and inviting for culinary content. The overall atmosphere is warm, culinary, step-by-step-instructional, and deliciously appetizing. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'parents_children', label: 'Родители и дети', icon: '👪', prompt: 'Professional family and parenting infographic layout. Warm, loving aesthetic featuring family scenarios, parent-child relationships, parenting tips, and family life content. Background: Warm family home environments, bright playful children\'s areas, or soft domestic scenes. Visual elements: Family silhouettes, parent-child interactions, home symbols, toy icons, family tree, parenting advice visuals. Color palette: Warm family tones — soft yellows, warm pinks, gentle blues, home oranges, and nurturing neutrals. Typography: Warm, approachable fonts that feel family-friendly and parenting-positive. The overall atmosphere is warm, loving, family-centered, and parenting-supportive. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'gardening', label: 'Садоводство', icon: '🌱', prompt: 'Professional gardening and horticulture infographic layout. Fresh, natural aesthetic featuring garden plants, gardening tools, seasonal planting guides, and green-thumb content. Background: Garden environments — vegetable garden rows, flower beds, or greenhouse settings. Visual elements: Watering can, trowel, seed packets, plant growth stages, garden calendar, flowers, vegetables. Color palette: Natural greens, earth soil browns, flower petal colors, sky blues, and fresh outdoor tones. Typography: Natural, earthy fonts that feel organic and gardening-appropriate. The overall atmosphere is green, natural, growth-promoting, and garden-loving. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'telecom', label: 'Связь', icon: '📶', prompt: 'Professional telecommunications infographic layout. Modern signal-focused aesthetic featuring mobile networks, communication towers, data transmission, and telecom technology. Background: Digital signal patterns, cell tower landscapes, or telecom infrastructure visuals. Visual elements: Cell towers, signal bars, fiber optic cables, 5G symbols, mobile phones, satellite dishes, network diagrams. Color palette: Telecom blues and greens, signal whites, technical grays, with modern tech accent colors. Typography: Technical, modern sans-serif fonts used in technology and telecom contexts. The overall atmosphere is connected, technical, communications-focused, and digitally modern. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'social', label: 'Социальный', icon: '🤝', prompt: 'Professional social welfare and community infographic layout. Warm, inclusive aesthetic featuring community support, social services, human connection, and civic solidarity. Background: Community-centered backgrounds — diverse groups, shared spaces, or social support environments. Visual elements: Helping hands, community circles, social support symbols, diverse people silhouettes, heart icons, communal imagery. Color palette: Warm, inclusive tones — caring blues, community greens, warm oranges, hopeful yellows, and human-centered neutrals. Typography: Accessible, inclusive fonts that feel welcoming to all community members. The overall atmosphere is warm, inclusive, community-supporting, and socially conscious. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'sports', label: 'Спорт', icon: '⚽', prompt: 'Professional sports and athletic infographic layout. Dynamic, energetic aesthetic featuring sporting events, athlete imagery, competition elements, and sports statistics. Background: Stadium environments, sports field textures, or dynamic athletic action backgrounds. Visual elements: Sports equipment (ball, racket, etc.), athlete silhouettes, podium, medal, scoreboard, sports data charts. Color palette: Energetic sports colors — champion golds, competitive blues, victory reds, and field greens. Typography: Bold, dynamic sports fonts conveying energy, speed, and athletic achievement. The overall atmosphere is athletic, competitive, champion-celebrating, and sports-culture-celebrating. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'tech', label: 'Технологии', icon: '💻', prompt: 'Professional technology and innovation infographic layout. Modern, forward-looking aesthetic featuring tech gadgets, digital innovation, startup culture, and technology trends. Background: Clean dark tech backgrounds with subtle circuit patterns or modern office technology environments. Visual elements: Laptops, smartphones, tablets, app interfaces, code snippets, tech innovation icons, startup graphics. Color palette: Tech blues, innovation purples, clean whites, dark backgrounds, and neon accent colors. Typography: Modern, clean sans-serif tech fonts conveying innovation and forward-thinking. The overall atmosphere is innovative, tech-forward, modern, and digitally transformative. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'goods', label: 'Товары', icon: '🛍️', prompt: 'Professional consumer goods and retail infographic layout. Clean, product-focused aesthetic featuring product displays, shopping elements, brand imagery, and consumer market content. Background: Clean retail backgrounds, product photography style settings, or market-oriented designs. Visual elements: Shopping bags, product packages, retail tags, store imagery, consumer goods displays, brand elements. Color palette: Clean retail whites, product-highlight colors, shopping-inspired tones, and consumer-friendly accents. Typography: Clean, retail-friendly fonts suitable for product and market information. The overall atmosphere is retail-oriented, consumer-friendly, product-showcasing, and market-aware. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'financial', label: 'Финансовый', icon: '💹', prompt: 'Professional financial markets and investment infographic layout. Authoritative, data-rich aesthetic featuring financial charts, stock market elements, investment analysis, and economic indicators. Background: Financial data screens, stock exchange floors, or clean financial report styles. Visual elements: Stock charts, candlestick graphs, financial indicators, currency symbols, bull/bear market icons, investment portfolios. Color palette: Financial greens and reds, market blues, gold investment tones, and professional corporate colors. Typography: Precise, financial-industry fonts suitable for data and market analysis. The overall atmosphere is financially sophisticated, data-driven, investment-focused, and economically analytical. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'christian', label: 'Христианский', icon: '✝️', prompt: 'Professional Christian religious infographic layout. Reverent, spiritual aesthetic featuring Orthodox Christian symbols, church architecture, religious imagery, and faith-based content. Background: Orthodox church domes and architecture, golden icon-style backgrounds, or spiritual light effects. Visual elements: Cross, church domes, candles, Orthodox icons, religious calendar dates, church symbols, biblical imagery. Color palette: Sacred golds, deep religious blues, holy whites, icon-painting colors, and spiritual purples. Typography: Traditional, reverent serif fonts with a spiritual and ecclesiastical feel. The overall atmosphere is reverent, spiritually meaningful, faith-based, and Orthodox-Christian-respectful. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'school', label: 'Школьный', icon: '🏫', prompt: 'Professional school and student life infographic layout. Bright, educational aesthetic featuring school environments, student life, academic subjects, and educational milestones. Background: Bright classroom environments, school yard settings, or friendly academic illustrations. Visual elements: School building, backpack, pencil, notebook, ruler, globe, student desks, bell, teacher elements. Color palette: Bright school colors — apple reds, chalkboard greens, pencil yellows, notebook blues, and energetic student-friendly tones. Typography: Clear, student-friendly educational fonts that are readable and age-appropriate. The overall atmosphere is educational, youthful, school-celebrating, and student-life-friendly. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'fines', label: 'Штрафы', icon: '⚠️', prompt: 'Professional fines and penalties infographic layout. Clear, authoritative aesthetic featuring warning symbols, penalty amounts, legal consequences, and official fine notices. Background: Official document styling, court paper backgrounds, or warning-colored official designs. Visual elements: Warning triangles, official stamp icons, fine ticket graphics, penalty amounts, legal scales, court building. Color palette: Official warning yellows and oranges, authority reds, legal document blacks and whites. Typography: Official, bureaucratic fonts conveying legal authority and seriousness. The overall atmosphere is authoritative, legally informative, officially styled, and fine-and-penalty-focused. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'ecology', label: 'Экология', icon: '🌿', prompt: 'Professional ecology and environmental infographic layout. Fresh, natural aesthetic featuring environmental issues, green sustainability, climate action, and ecological data. Background: Natural environments — forests, oceans, clean air scenes, or green sustainability backgrounds. Visual elements: Leaf motifs, Earth globe, recycling symbols, clean energy icons, wildlife, environmental data charts. Color palette: Natural greens, earth blues, sustainable earth tones, environmental golds, and eco-friendly accents. Typography: Natural, clean fonts that feel environmentally conscious and sustainability-focused. The overall atmosphere is environmentally aware, green, sustainability-promoting, and ecologically responsible. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'electronics', label: 'Электроника', icon: '📱', prompt: 'Professional consumer electronics infographic layout. Modern, tech-sleek aesthetic featuring smartphones, gadgets, electronics reviews, and consumer technology. Background: Clean tech product backgrounds, dark showroom-style settings, or modern electronics store environments. Visual elements: Smartphones, tablets, laptops, earbuds, smartwatches, electronic components, product spec displays. Color palette: Sleek blacks and silvers, tech blues, clean whites, and modern electronic product accent colors. Typography: Clean, modern product-presentation fonts used in consumer electronics marketing. The overall atmosphere is modern, gadget-focused, tech-savvy, and consumer-electronics-celebrating. All text in the image MUST be in Russian (Русский язык).' },
  { id: 'legal', label: 'Юридический', icon: '⚖️', prompt: 'Professional legal and juridical infographic layout. Authoritative, justice-focused aesthetic featuring legal symbols, court imagery, law books, and juridical process elements. Background: Courtroom environments, law library settings, or classic legal document backgrounds. Visual elements: Scales of justice, gavel, law books, legal document scrolls, courthouse pillars, judge\'s robe. Color palette: Authoritative deep blues, judicial golds, legal document creams and browns, formal blacks. Typography: Classical, authoritative serif fonts conveying legal gravitas and professional standing. The overall atmosphere is authoritative, legally precise, justice-focused, and professionally juridical. All text in the image MUST be in Russian (Русский язык).' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Квадрат', icon: '⬛', ratio: '1:1' },
  { id: '3:4', label: 'Портрет', icon: '📄', ratio: '3:4' },
  { id: '9:16', label: 'Stories', icon: '📱', ratio: '9:16' },
  { id: '16:9', label: 'Широкий', icon: '🖥️', ratio: '16:9' },
];

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadCustomStyles(): InfographicStyle[] {
  try { return JSON.parse(localStorage.getItem('custom_styles') || '[]'); } catch { return []; }
}
function saveCustomStyles(styles: InfographicStyle[]) {
  localStorage.setItem('custom_styles', JSON.stringify(styles));
}
function loadCustomModels(): AIModel[] {
  try { return JSON.parse(localStorage.getItem('custom_models') || '[]'); } catch { return []; }
}
function saveCustomModels(models: AIModel[]) {
  localStorage.setItem('custom_models', JSON.stringify(models));
}

// ─── Style Manager Modal ──────────────────────────────────────────────────────

interface StyleManagerProps {
  customStyles: InfographicStyle[];
  onSave: (styles: InfographicStyle[]) => void;
  onClose: () => void;
}

const StyleManager: React.FC<StyleManagerProps> = ({ customStyles, onSave, onClose }) => {
  // customStyles includes both pure-custom and overrides of built-ins (same id)
  const [customs, setCustoms] = useState<InfographicStyle[]>(customStyles);
  const [editing, setEditing] = useState<InfographicStyle | null>(null);
  const [creating, setCreating] = useState(false);
  const [formIcon, setFormIcon] = useState('✨');
  const [formLabel, setFormLabel] = useState('');
  const [formPrompt, setFormPrompt] = useState('');
  const [formError, setFormError] = useState('');

  // Merged list: built-ins overridden by any same-id custom, then pure customs appended
  const overrideMap = new Map<string, InfographicStyle>(customs.map(s => [s.id, s]));
  const mergedBuiltins = BUILTIN_STYLES.map(s => overrideMap.get(s.id) ?? s);
  const pureCustoms = customs.filter(c => !BUILTIN_STYLES.some(b => b.id === c.id));

  const isOverridden = (id: string) => customs.some(c => c.id === id && BUILTIN_STYLES.some(b => b.id === id));

  const openEdit = (s: InfographicStyle) => {
    setEditing(s); setCreating(false);
    setFormIcon(s.icon); setFormLabel(s.label); setFormPrompt(s.prompt); setFormError('');
  };
  const openCreate = () => {
    setCreating(true); setEditing(null);
    setFormIcon('✨'); setFormLabel(''); setFormPrompt(''); setFormError('');
  };

  const handleSaveForm = () => {
    if (!formLabel.trim()) { setFormError('Введите название стиля.'); return; }
    if (!formPrompt.trim()) { setFormError('Введите промпт стиля.'); return; }
    setFormError('');
    if (editing) {
      // Save as override (same id) or update existing custom
      const updated = { ...editing, icon: formIcon, label: formLabel, prompt: formPrompt, isCustom: true };
      setCustoms(prev => prev.some(c => c.id === editing.id)
        ? prev.map(c => c.id === editing.id ? updated : c)
        : [...prev, updated]);
    } else {
      setCustoms(prev => [...prev, { id: `custom_${Date.now()}`, label: formLabel, icon: formIcon, prompt: formPrompt, isCustom: true }]);
    }
    setEditing(null); setCreating(false);
  };

  const handleReset = (id: string) => {
    setCustoms(prev => prev.filter(c => c.id !== id));
  };

  const handleDelete = (id: string) => {
    setCustoms(prev => prev.filter(c => c.id !== id));
  };

  const showForm = editing !== null || creating;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#222222] border border-[#333333] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <h2 className="text-xl font-bold text-slate-100">Управление стилями</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Edit form */}
          {showForm && (
            <div className="bg-[#1a1a1a] border border-indigo-500/40 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-200">{editing ? `Редактировать: ${editing.label}` : 'Новый стиль'}</p>
              <div className="flex gap-3">
                <div className="w-20">
                  <label className="text-xs text-slate-400 block mb-1">Иконка</label>
                  <input type="text" value={formIcon} onChange={e => setFormIcon(e.target.value)} maxLength={4}
                    className="w-full px-2 py-2 bg-[#222] border border-[#555] rounded-lg text-white text-center text-xl focus:border-indigo-500 focus:outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">Название</label>
                  <input type="text" value={formLabel} onChange={e => setFormLabel(e.target.value)} placeholder="Название стиля"
                    className="w-full px-3 py-2 bg-[#222] border border-[#555] rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Промпт стиля</label>
                <textarea value={formPrompt} onChange={e => setFormPrompt(e.target.value)} placeholder="Опишите визуальный стиль на английском..."
                  className="w-full px-3 py-2 bg-[#222] border border-[#555] rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm resize-none h-36" />
              </div>
              {formError && <p className="text-red-400 text-xs">{formError}</p>}
              <div className="flex gap-2">
                <button onClick={handleSaveForm} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Сохранить</button>
                <button onClick={() => { setEditing(null); setCreating(false); }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">Отмена</button>
              </div>
            </div>
          )}

          {/* Built-in styles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Встроенные стили ({BUILTIN_STYLES.length})</p>
              <button onClick={openCreate} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg transition-colors">+ Новый стиль</button>
            </div>
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
              {mergedBuiltins.map(s => {
                const modified = isOverridden(s.id);
                return (
                  <div key={s.id} className={`flex items-center justify-between rounded-lg px-3 py-2 ${modified ? 'bg-indigo-900/20 border border-indigo-500/20' : 'bg-[#1a1a1a]'}`}>
                    <span className="text-sm text-slate-300 truncate mr-2">{s.icon} {s.label}{modified && <span className="ml-1 text-xs text-indigo-400">✎</span>}</span>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEdit(s)} className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors">✏️</button>
                      {modified && (
                        <button onClick={() => handleReset(s.id)} className="text-xs text-yellow-500 hover:text-yellow-300 px-2 py-1 rounded hover:bg-yellow-900/30 transition-colors" title="Сбросить до оригинала">↺</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pure custom styles */}
          {pureCustoms.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Мои стили ({pureCustoms.length})</p>
              <div className="space-y-1">
                {pureCustoms.map(s => (
                  <div key={s.id} className="flex items-center justify-between bg-[#1a1a1a] rounded-lg px-3 py-2">
                    <span className="text-sm text-slate-300 truncate mr-2">{s.icon} {s.label}</span>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEdit(s)} className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors">✏️</button>
                      <button onClick={() => handleDelete(s.id)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-900/30 transition-colors">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-[#333] flex gap-3">
          <button onClick={() => { onSave(customs); onClose(); }} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">Применить</button>
          <button onClick={onClose} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors">Закрыть</button>
        </div>
      </div>
    </div>
  );
};

// ─── Model Manager Modal ──────────────────────────────────────────────────────

interface ModelManagerProps {
  customModels: AIModel[];
  onSave: (models: AIModel[]) => void;
  onClose: () => void;
}

const ModelManager: React.FC<ModelManagerProps> = ({ customModels, onSave, onClose }) => {
  const [models, setModels] = useState<AIModel[]>(customModels);
  const [formLabel, setFormLabel] = useState('');
  const [formModelId, setFormModelId] = useState('');
  const [formError, setFormError] = useState('');

  const handleAdd = () => {
    if (!formLabel.trim()) { setFormError('Введите название модели.'); return; }
    if (!formModelId.trim()) { setFormError('Введите ID модели.'); return; }
    setFormError('');
    setModels(prev => [...prev, { id: `custom_${Date.now()}`, label: formLabel.trim(), model: formModelId.trim(), isCustom: true }]);
    setFormLabel(''); setFormModelId('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#222222] border border-[#333333] rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <h2 className="text-xl font-bold text-slate-100">Управление моделями</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Встроенные модели</p>
            <div className="space-y-1">
              {DEFAULT_MODELS.map(m => (
                <div key={m.id} className="bg-[#1a1a1a] rounded-lg px-3 py-2">
                  <p className="text-sm text-slate-300">{m.label}</p>
                  <p className="text-xs text-slate-500 font-mono">{m.model}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Мои модели</p>
            {models.length === 0 && <p className="text-sm text-slate-500 text-center py-2">Нет добавленных моделей</p>}
            <div className="space-y-1">
              {models.map(m => (
                <div key={m.id} className="flex items-center justify-between bg-[#1a1a1a] rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm text-slate-300">{m.label}</p>
                    <p className="text-xs text-slate-500 font-mono">{m.model}</p>
                  </div>
                  <button onClick={() => setModels(prev => prev.filter(x => x.id !== m.id))} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-900/30 transition-colors">🗑️</button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#444] rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-200">Добавить модель</p>
            <input type="text" value={formLabel} onChange={e => setFormLabel(e.target.value)} placeholder="Название (напр.: My Custom Model)"
              className="w-full px-3 py-2 bg-[#222] border border-[#555] rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm" />
            <input type="text" value={formModelId} onChange={e => setFormModelId(e.target.value)} placeholder="ID модели (напр.: openai/gpt-4o)"
              className="w-full px-3 py-2 bg-[#222] border border-[#555] rounded-lg text-white placeholder-slate-500 font-mono focus:border-indigo-500 focus:outline-none text-sm" />
            {formError && <p className="text-red-400 text-xs">{formError}</p>}
            <button onClick={handleAdd} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">+ Добавить</button>
          </div>
        </div>
        <div className="p-6 border-t border-[#333] flex gap-3">
          <button onClick={() => { onSave(models); onClose(); }} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">Применить</button>
          <button onClick={onClose} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors">Закрыть</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('openrouter_api_key'));
  const [customStyles, setCustomStyles] = useState<InfographicStyle[]>(loadCustomStyles);
  const [customModels, setCustomModels] = useState<AIModel[]>(loadCustomModels);

  // Built-ins overridden by any same-id custom, then pure customs appended
  const styleOverrideMap = new Map(customStyles.map(s => [s.id, s]));
  const allStyles = [
    ...BUILTIN_STYLES.map(s => styleOverrideMap.get(s.id) ?? s),
    ...customStyles.filter(c => !BUILTIN_STYLES.some(b => b.id === c.id)),
  ];
  const allModels = [...DEFAULT_MODELS, ...customModels];

  const [selectedStyle, setSelectedStyle] = useState<InfographicStyle>(allStyles[0]);
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0]);
  const [selectedModel, setSelectedModel] = useState<AIModel>(allModels[0]);
  const [userPrompt, setUserPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'infographic' | 'rewrite'>('infographic');
  const [rewriteInput, setRewriteInput] = useState('');
  const [rewriteResult, setRewriteResult] = useState('');
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteError, setRewriteError] = useState('');

  const [watermarkText, setWatermarkText] = useState('');
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');
  const [showStyleManager, setShowStyleManager] = useState(false);
  const [showModelManager, setShowModelManager] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleApiKeyChange = useCallback((key: string) => {
    localStorage.setItem('openrouter_api_key', key);
    setApiKey(key);
  }, []);

  const handleSaveCustomStyles = useCallback((styles: InfographicStyle[]) => {
    setCustomStyles(styles);
    saveCustomStyles(styles);
    const updated = [...BUILTIN_STYLES, ...styles];
    if (!updated.find(s => s.id === selectedStyle.id)) setSelectedStyle(updated[0]);
  }, [selectedStyle.id]);

  const handleSaveCustomModels = useCallback((models: AIModel[]) => {
    setCustomModels(models);
    saveCustomModels(models);
    const updated = [...DEFAULT_MODELS, ...models];
    if (!updated.find(m => m.id === selectedModel.id)) setSelectedModel(updated[0]);
  }, [selectedModel.id]);

  const handleGenerateInfographic = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!apiKey) return;
    if (!userPrompt.trim()) { setError('Введите тему инфографики.'); return; }
    setLoading(true); setError(''); setGeneratedImage(null);
    try {
      const imageData = await generateInfographic(apiKey, userPrompt, selectedStyle.prompt, selectedRatio.ratio, selectedModel.model, watermarkText, showWatermark, watermarkPosition);
      setGeneratedImage({ url: imageData, topic: userPrompt, timestamp: Date.now(), aspectRatio: selectedRatio.ratio, base64: imageData });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать инфографику.');
    } finally {
      setLoading(false);
    }
  };

  const handleRewriteText = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!apiKey) return;
    if (!rewriteInput.trim()) { setRewriteError('Введите текст для рерайта.'); return; }
    setRewriteLoading(true); setRewriteError('');
    try {
      const result = await rewriteText(apiKey, rewriteInput);
      setRewriteResult(result);
    } catch (err) {
      setRewriteError(err instanceof Error ? err.message : 'Не удалось переписать текст.');
    } finally {
      setRewriteLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
  };

  const handleDownloadImage = () => {
    if (!generatedImage?.url) return;
    const link = document.createElement('a');
    link.href = generatedImage.url;
    link.download = `infographic_${Date.now()}.png`;
    link.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('openrouter_api_key');
    setApiKey(null);
  };

  if (!apiKey) {
    return <ApiKeyPrompt onApiKeyChange={handleApiKeyChange} />;
  }

  const modelIcons: Record<number, string> = { 0: '⚡', 1: '💎' };

  return (
    <div className="flex h-screen overflow-hidden bg-[#1a1a1a] text-slate-200">
      {showStyleManager && (
        <StyleManager customStyles={customStyles} onSave={handleSaveCustomStyles} onClose={() => setShowStyleManager(false)} />
      )}
      {showModelManager && (
        <ModelManager customModels={customModels} onSave={handleSaveCustomModels} onClose={() => setShowModelManager(false)} />
      )}

      {/* ── Sidebar ── */}
      <div className="w-80 shrink-0 bg-[#222222] border-r border-[#333333] flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-2 space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                News Regions
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Инфографика для постов</p>
            </div>
            <button onClick={handleLogout} title="Выйти" className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded-lg hover:bg-[#2a2a2a] transition-colors">
              🔑 Выйти
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#2a2a2a] rounded-xl p-1 gap-1">
            {(['infographic', 'rewrite'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-400 hover:text-white'}`}>
                {tab === 'infographic' ? '🖼️ Инфографика' : '✍️ Рерайт'}
              </button>
            ))}
          </div>

          {/* ── Infographic tab ── */}
          {activeTab === 'infographic' && (
            <form onSubmit={handleGenerateInfographic} className="space-y-4">
              {/* Prompt */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Тема инфографики</label>
                  {userPrompt && (
                    <button type="button" onClick={() => setUserPrompt('')} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">× Очистить</button>
                  )}
                </div>
                <textarea
                  ref={textareaRef}
                  value={userPrompt}
                  onChange={e => setUserPrompt(e.target.value)}
                  placeholder="Введите тему или событие..."
                  className="w-full px-3 py-3 bg-[#1a1a1a] border border-[#333333] rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none resize-none h-24 text-sm"
                />
              </div>

              {/* Style selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Стиль оформления</label>
                  <button type="button" onClick={() => setShowStyleManager(true)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    ⚙️ Управление
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                  {allStyles.map(style => (
                    <button
                      type="button"
                      key={style.id}
                      onClick={() => setSelectedStyle(style)}
                      className={`px-3 py-2 rounded-xl text-sm text-left transition-all flex items-center gap-2 border ${
                        selectedStyle.id === style.id
                          ? 'bg-indigo-900/30 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/50'
                          : 'bg-[#1c1c1c] border-[#2a2a2a] text-slate-300 hover:border-[#3a3a3a] hover:text-white'
                      }`}
                    >
                      <span className="text-base shrink-0">{style.icon}</span>
                      <span className="truncate leading-tight text-xs">{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Модель</label>
                  <button type="button" onClick={() => setShowModelManager(true)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    ⚙️ Управление
                  </button>
                </div>
                <div className="space-y-1.5">
                  {allModels.map((model, idx) => (
                    <button
                      type="button"
                      key={model.id}
                      onClick={() => setSelectedModel(model)}
                      className={`w-full px-3 py-2.5 rounded-xl text-sm text-left transition-all flex items-center gap-3 border ${
                        selectedModel.id === model.id
                          ? 'bg-indigo-900/30 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/50'
                          : 'bg-[#1c1c1c] border-[#2a2a2a] text-slate-300 hover:border-[#3a3a3a] hover:text-white'
                      }`}
                    >
                      <span className="text-base shrink-0">{modelIcons[idx] ?? '🤖'}</span>
                      <div className="min-w-0">
                        <div className="font-medium text-xs">{model.label}</div>
                        <div className="text-[10px] opacity-50 font-mono truncate">{model.model}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Watermark */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ватермарка</label>
                  <button
                    type="button"
                    onClick={() => setShowWatermark(!showWatermark)}
                    className={`text-xs font-medium px-3 py-1 rounded-lg border transition-all ${
                      showWatermark
                        ? 'bg-indigo-900/30 border-indigo-500/50 text-indigo-300'
                        : 'bg-[#1c1c1c] border-[#333] text-slate-400 hover:text-white hover:border-[#444]'
                    }`}
                  >
                    {showWatermark ? 'Вкл' : 'Выкл'}
                  </button>
                </div>
                {showWatermark && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={e => setWatermarkText(e.target.value)}
                      placeholder="@yourhandle"
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none text-sm"
                    />
                    <div className="grid grid-cols-2 gap-1 w-32">
                      {([
                        { id: 'top-left',     label: '↖' },
                        { id: 'top-right',    label: '↗' },
                        { id: 'bottom-left',  label: '↙' },
                        { id: 'bottom-right', label: '↘' },
                      ] as const).map(pos => (
                        <button
                          type="button"
                          key={pos.id}
                          onClick={() => setWatermarkPosition(pos.id)}
                          className={`py-1 rounded-lg text-sm font-bold transition-all border ${
                            watermarkPosition === pos.id
                              ? 'bg-indigo-900/30 border-indigo-500/50 text-indigo-300'
                              : 'bg-[#1c1c1c] border-[#2a2a2a] text-slate-400 hover:text-white hover:border-[#3a3a3a]'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Aspect ratio */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Формат</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {ASPECT_RATIOS.map(ratio => (
                    <button
                      type="button"
                      key={ratio.id}
                      onClick={() => setSelectedRatio(ratio)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all border text-xs ${
                        selectedRatio.id === ratio.id
                          ? 'bg-indigo-900/30 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/50'
                          : 'bg-[#1c1c1c] border-[#2a2a2a] text-slate-400 hover:border-[#3a3a3a] hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{ratio.icon}</span>
                      <span className="font-medium leading-tight">{ratio.id}</span>
                      <span className="text-[10px] opacity-60">{ratio.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-800/50 rounded-xl text-red-300 text-sm">{error}</div>
              )}
            </form>
          )}

          {/* ── Rewrite tab ── */}
          {activeTab === 'rewrite' && (
            <form onSubmit={handleRewriteText} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Исходный текст</label>
                <textarea
                  value={rewriteInput}
                  onChange={e => setRewriteInput(e.target.value)}
                  placeholder="Вставьте текст новости..."
                  className="w-full px-3 py-3 bg-[#1a1a1a] border border-[#333333] rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none resize-none h-44 text-sm"
                />
              </div>
              {rewriteError && (
                <div className="p-3 bg-red-900/30 border border-red-800/50 rounded-xl text-red-300 text-sm">{rewriteError}</div>
              )}
              {rewriteResult && (
                <div className="space-y-2">
                  <div className="p-4 bg-[#1a1a1a] border border-[#333333] rounded-xl">
                    <p className="text-xs text-slate-500 mb-2">Результат:</p>
                    <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{rewriteResult}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(rewriteResult)}
                    className="w-full py-2 px-4 bg-[#1a1a1a] text-slate-300 rounded-xl font-medium hover:bg-[#252525] transition-colors text-sm border border-[#333333]"
                  >
                    📋 Скопировать
                  </button>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Sticky Create Button */}
        <div className="px-4 py-4 border-t border-[#333333] bg-[#222222]">
          {activeTab === 'infographic' ? (
            <button
              onClick={() => handleGenerateInfographic()}
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 disabled:bg-[#2a2a2a] disabled:text-slate-500 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-900/30 text-sm"
            >
              {loading ? '⏳ Генерирую...' : '✨ Создать'}
            </button>
          ) : (
            <button
              onClick={() => handleRewriteText()}
              disabled={rewriteLoading}
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 disabled:bg-[#2a2a2a] disabled:text-slate-500 disabled:cursor-not-allowed transition-all text-sm"
            >
              {rewriteLoading ? '⏳ Переписываю...' : '✍️ Рерайт'}
            </button>
          )}
        </div>
      </div>

      {/* ── Output panel ── */}
      <div className="flex-1 bg-[#1a1a1a] h-full overflow-y-auto flex items-center justify-center p-8">
        {activeTab === 'infographic' && (
          <>
            {loading && (
              <div className="flex flex-col items-center justify-center">
                <LoadingSpinner />
              </div>
            )}
            {!loading && generatedImage && (
              <div className="flex flex-col items-center gap-5 w-full max-w-xl">
                <img
                  src={generatedImage.url}
                  alt="Сгенерированная инфографика"
                  className="w-full h-auto rounded-2xl shadow-2xl shadow-black/50"
                />
                <button
                  onClick={handleDownloadImage}
                  className="flex items-center gap-2 py-2.5 px-7 bg-[#222222] hover:bg-[#2a2a2a] text-slate-300 rounded-xl font-medium transition-colors text-sm border border-[#333333]"
                >
                  ⬇ Скачать
                </button>
              </div>
            )}
            {!loading && !generatedImage && (
              <div className="text-center">
                <div className="text-6xl mb-4 opacity-20">🖼️</div>
                <p className="text-slate-600 text-sm">Введите тему и нажмите «✨ Создать»</p>
              </div>
            )}
          </>
        )}
        {activeTab === 'rewrite' && !rewriteResult && !rewriteLoading && (
          <div className="text-center">
            <div className="text-6xl mb-4 opacity-20">✍️</div>
            <p className="text-slate-600 text-sm">Введите текст и нажмите «✍️ Рерайт»</p>
          </div>
        )}
        {activeTab === 'rewrite' && rewriteLoading && (
          <div className="flex flex-col items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  );
}
