import * as LucideIcons from "lucide-react";

interface SafeIconProps {
  name: string;
  className?: string;
  size?: number;
}

/**
 * SafeIcon — dynamically renders any Lucide icon by name string.
 * Falls back to a neutral square if the icon name is not found.
 *
 * Usage: <SafeIcon name="Bell" className="w-5 h-5 text-blue-600" />
 */
export function SafeIcon({ name, className, size }: SafeIconProps) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; size?: number }>>)[name];

  if (!Icon) {
    // Fallback: render an empty inline block so layout doesn't break
    return <span className={className} style={{ display: "inline-block", width: size ?? 16, height: size ?? 16 }} />;
  }

  return <Icon className={className} size={size} />;
}
