export interface GeneratedImage {
  url: string;
  topic: string;
  timestamp: number;
  aspectRatio: string;
  base64?: string;
}

export interface InfographicStyle {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  isCustom?: boolean;
}

export interface AIModel {
  id: string;
  label: string;
  model: string;
  isCustom?: boolean;
}

export interface ApiError {
  message: string;
}
