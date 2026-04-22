import { icons, LucideProps } from 'lucide-react'

export interface DynamicIconProps extends LucideProps {
  name: string
  fallback?: React.ReactNode
}

/**
 * Renders a Lucide icon dynamically based on its string name.
 * If the icon is not found, renders a fallback (defaulting to MapPin).
 */
export function DynamicIcon({ name, fallback, ...props }: DynamicIconProps) {
  // Try to find the icon (case-insensitive for safety, though lucide usually exports PascalCase)
  const IconComponent = (icons as any)[name] || 
    Object.entries(icons).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1]

  if (!IconComponent) {
    if (fallback !== undefined) return <>{fallback}</>
    const DefaultIcon = icons.MapPin
    return <DefaultIcon {...props} />
  }

  return <IconComponent {...props} />
}
