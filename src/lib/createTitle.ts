import { CONTENT, TITLE_SEPARATOR } from "@/constants";

export const createTitle = (pageName?: keyof typeof CONTENT | string) => {
  const theTitle = pageName ? CONTENT[pageName as keyof typeof CONTENT] || pageName : "";
  return `${theTitle ? `${theTitle}${TITLE_SEPARATOR}` : ""}${CONTENT.appName}`;
};
