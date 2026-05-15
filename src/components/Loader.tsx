import { Loader2 } from "lucide-react";

interface LoaderProps {
  text?: string;
  className?: string;
}

/**
 * Компонент для отображения состояния загрузки
 */
export function Loader({ text, className = "" }: LoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className="w-12 h-12 animate-spin text-portal mb-4" />
      {text && (
        <p className="text-muted-foreground text-center">{text}</p>
      )}
    </div>
  );
}

/**
 * Inline loader для кнопок
 */
export function InlineLoader() {
  return <Loader2 className="w-4 h-4 animate-spin" />;
}
