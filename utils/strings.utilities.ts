export function toKebabCase(str: string): string {
  return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .replace(/_/g, '-')
      .replace(/[^\w\-]+/g, '')
      .toLowerCase()
}