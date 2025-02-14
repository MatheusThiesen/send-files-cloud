export const removeExtension = (filename: string) => {
  const lastDotIndex = filename.lastIndexOf(".");
  return lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;
};
