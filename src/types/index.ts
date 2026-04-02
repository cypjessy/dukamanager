export type Locale = "en" | "sw";

export interface LoginFormData {
  identifier: string;
  password: string;
  rememberDevice: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  shop: string;
  location: string;
  quote: Record<Locale, string>;
}

export interface Benefit {
  id: string;
  icon: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
}

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger" | "ghost" | "fab" | "destructive" | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "xs";

export interface TabItem {
  key: string;
  label: string;
  labelSw?: string;
  icon?: React.ReactNode;
  badge?: number | boolean;
}
