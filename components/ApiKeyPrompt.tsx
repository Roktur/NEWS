import React, { useState } from 'react';
import { validateApiKey } from '../services/geminiService';

interface ApiKeyPromptProps {
  onApiKeyChange: (key: string) => void;
}

export const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onApiKeyChange }) => {
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setError('Введите API ключ.');
      return;
    }
    setLoading(true);
    setError('');
    const valid = await validateApiKey(trimmed);
    setLoading(false);
    if (valid) {
      onApiKeyChange(trimmed);
    } else {
      setError('Неверный API ключ. Вход запрещён.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#222222] border border-[#333333] rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="mb-6 bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl text-indigo-300">
          🔑
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Требуется доступ</h2>
        <p className="text-slate-400 mb-6">
          Введите ваш <strong className="text-slate-200">OpenRouter API ключ</strong> для входа в приложение.
        </p>

        <div className="space-y-4">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="sk-or-v1-..."
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#444] rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
            autoFocus
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-900/50"
          >
            {loading ? 'Проверяю ключ...' : 'Войти'}
          </button>

          <div className="text-xs text-slate-500">
            Нет ключа?{' '}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 underline"
            >
              Получить на openrouter.ai
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
