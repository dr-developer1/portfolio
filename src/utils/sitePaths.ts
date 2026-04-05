export function resolveSitePath(path: string): string {
  const normalizedPath = path.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
}

export function resolveSiteUrl(path: string): string {
  return new URL(resolveSitePath(path), window.location.origin).toString();
}
