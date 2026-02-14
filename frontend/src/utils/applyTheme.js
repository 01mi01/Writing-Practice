export const applyTheme = (themeName, colorName) => {
  const root = document.documentElement;
  root.setAttribute("data-theme", themeName.toLowerCase());
  root.setAttribute("data-palette", colorName.toLowerCase());
};