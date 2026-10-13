const VIETNAMESE_PREFIX = '/vi';

const normalizeRoute = (pathname) => {
	const path = pathname?.split(/[?#]/, 1)[0] || '/';
	if (path === '/') return '/';
	return `/${path.replace(/^\/+|\/+$/g, '')}/`;
};

export const rootPath = (pathname) => {
	const path = normalizeRoute(pathname);
	if (path === VIETNAMESE_PREFIX || path.startsWith(`${VIETNAMESE_PREFIX}/`)) {
		return path.slice(VIETNAMESE_PREFIX.length) || '/';
	}
	return path;
};

export const localizePath = (pathname, locale) => {
	const path = rootPath(pathname);
	return locale === 'vi' ? `${VIETNAMESE_PREFIX}${path}` : path;
};

const documentPathToRoute = (documentPath) => {
	const normalized = documentPath.replaceAll('\\', '/');
	const marker = '/content/docs/vi/';
	const markerIndex = normalized.lastIndexOf(marker);
	const relativePath = markerIndex === -1
		? normalized.replace(/^.*?vi\//, '')
		: normalized.slice(markerIndex + marker.length);
	const withoutExtension = relativePath.replace(/\.(?:md|mdx)$/i, '');
	const route = withoutExtension === 'index'
		? ''
		: withoutExtension.endsWith('/index')
			? withoutExtension.slice(0, -'/index'.length)
		: withoutExtension;
	return normalizeRoute(`/${route}`);
};

export const hasVietnameseMirror = (documentPaths, pathname) => {
	const currentRoute = normalizeRoute(rootPath(pathname));
	return documentPaths.some((documentPath) => documentPathToRoute(documentPath) === currentRoute);
};
