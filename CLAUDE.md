# CLAUDE.md — Документация проекта News Reggions

## Что это за проект

React + TypeScript приложение для генерации инфографики и рерайта текста.
Сборщик: Vite. Стили: Tailwind CSS (CDN). Язык UI: русский.

## Репозиторий и деплой

- **GitHub:** https://github.com/Roktur/NEWS (основной репозиторий, все изменения пушить сюда)
- **Vercel:** автоматический redeploy при каждом push в `main`
- Remote в git называется `news`: `git push news main`

---

## Что было изменено (сессия март 2026)

### 1. Замена Google Gemini API → OpenRouter API

**Было:** SDK `@google/genai`, аутентификация через Google AI Studio (`window.aistudio`).

**Стало:** Нативный `fetch` к `https://openrouter.ai/api/v1/`. Никаких внешних SDK для AI.

- Из `package.json` удалён `"@google/genai"`.
- Весь сервисный слой переписан в [services/geminiService.ts](services/geminiService.ts).

### 2. Аутентификация

- При запуске показывается модальный экран ввода OpenRouter API ключа.
- Ключ валидируется через `GET https://openrouter.ai/api/v1/auth/key`.
- Если ключ невалидный — вход в приложение **запрещён**.
- Валидный ключ сохраняется в `localStorage` (`openrouter_api_key`).
- Кнопка **"🔑 Выйти"** в шапке сайдбара сбрасывает ключ и возвращает на экран входа.

Компонент: [components/ApiKeyPrompt.tsx](components/ApiKeyPrompt.tsx)

### 3. Модели генерации изображений

По умолчанию две модели (объявлены в `DEFAULT_MODELS` в `services/geminiService.ts`):

| Название в UI | ID модели на OpenRouter |
|---|---|
| Nano Banana 2 (Быстрая) | `google/gemini-2.0-flash-preview-image-generation` |
| Nano Banana Pro (Качественная) | `google/gemini-2.0-pro-exp-02-05` |

> Если модели устареют — просто обновить `DEFAULT_MODELS` в `services/geminiService.ts`,
> или добавить новую модель прямо из UI (см. ниже).

### 4. Управление моделями (UI)

Кнопка **"⚙️ Управление"** рядом с блоком "Модель ИИ" открывает модальное окно:
- Показывает список встроенных моделей (только для ознакомления).
- Позволяет **добавить любую модель** с OpenRouter: ввести название + ID модели (например `anthropic/claude-3.5-sonnet`).
- Позволяет **удалить** добавленные модели.
- Пользовательские модели сохраняются в `localStorage` (`custom_models`).

### 5. Управление стилями (UI)

Кнопка **"⚙️ Управление"** рядом с блоком "Стиль:" открывает модальное окно:
- Список всех **45 встроенных стилей** с кнопкой "Дублировать".
- Создание **нового стиля**: иконка (emoji) + название + промпт.
- **Редактирование** пользовательских стилей (✏️).
- **Удаление** пользовательских стилей (🗑️).
- Пользовательские стили сохраняются в `localStorage` (`custom_styles`) **немедленно** при каждом действии (не только при нажатии "Применить").
- В сетке выбора стилей пользовательские помечены меткой "мой".
- **Экспорт** (кнопка "⬇ Экспорт") — скачивает `my_styles.json` со всеми кастомными стилями.
- **Импорт** (кнопка "⬆ Импорт") — загружает JSON-файл и добавляет стили (дубликаты пропускаются). Используется для переноса стилей между браузерами/устройствами.

### 6. Типы TypeScript

Файл [types.ts](types.ts) обновлён:
- Добавлен `InfographicStyle` — интерфейс стиля (`id`, `label`, `icon`, `prompt`, `isCustom?`).
- Добавлен `AIModel` — интерфейс модели (`id`, `label`, `model`, `isCustom?`).
- Убран `window.aistudio` (был нужен для Google AI Studio).

---

## Структура проекта

```
/
├── App.tsx                    — главный компонент, вся логика UI
├── types.ts                   — TypeScript интерфейсы
├── index.tsx                  — точка входа React
├── index.html                 — HTML шаблон (Tailwind CDN, шрифт Inter)
├── vite.config.ts             — конфиг Vite
├── package.json               — зависимости (react, react-dom — без AI SDK)
├── components/
│   ├── ApiKeyPrompt.tsx       — экран входа с проверкой OpenRouter ключа
│   └── LoadingSpinner.tsx     — спиннер загрузки
└── services/
    └── geminiService.ts       — весь API-слой (OpenRouter fetch, валидация ключа)
```

---

## Ключевые файлы и что в них менять

### Добавить/изменить встроенные модели
→ `services/geminiService.ts`, массив `DEFAULT_MODELS`.

### Добавить/изменить встроенные стили
→ `App.tsx`, массив `BUILTIN_STYLES`.

### Изменить логику генерации изображений
→ `services/geminiService.ts`, функция `generateInfographic()`.

### Изменить логику рерайта текста
→ `services/geminiService.ts`, функция `rewriteText()`.
Сейчас использует модель `google/gemini-2.0-flash-001`.

### Изменить валидацию API ключа
→ `services/geminiService.ts`, функция `validateApiKey()`.
Эндпоинт: `GET https://openrouter.ai/api/v1/auth/key`.

---

## Как запустить

```bash
npm install
npm run dev       # разработка, порт 3000
npm run build     # production сборка в /dist
npm run lint      # проверка TypeScript
```

---

## localStorage ключи

| Ключ | Содержимое |
|---|---|
| `openrouter_api_key` | API ключ OpenRouter (строка) |
| `custom_styles` | JSON-массив пользовательских стилей |
| `custom_models` | JSON-массив пользовательских моделей |

---

## OpenRouter API

- Base URL: `https://openrouter.ai/api/v1`
- Генерация изображений: `POST /chat/completions`
- Валидация ключа: `GET /auth/key`
- Рерайт текста: `POST /chat/completions` (текстовая модель)
- Заголовки: `Authorization: Bearer {key}`, `HTTP-Referer`, `X-Title`
