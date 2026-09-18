/** Public photos follow Vite's deployment base, including GitHub project Pages. */
export const publicAsset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
