import { Tab } from "./tab";
import {
  tabPanelTemplate,
  tabTitleTemplate,
  pageTemplate,
} from "./template-html-const";

type TabPanelParams = {
  tabId: string;
  tabPanelContent: string;
};

type TabTitleParams = {
  tabTitle: string;
  tabId: string;
};

type TabContentParams = {
  tabPanelHtmls: string;
  tabTitleHtmls: string;
};

function generateHTMLFromTemplate(
  template: string,
  params: TabPanelParams | TabTitleParams | TabContentParams,
): string {
  const parsed = template.replace(/{{\s*(\w+)\s*}}/g, (match, key: string) => {
    if (key in params) return (params as Record<string, string>)[key];
    return match;
  });

  return parsed;
}

function generateHTMLFromTabs(tabs: Tab[]) {
  const tabTitleHtmls = tabs
    .map((tab) =>
      generateHTMLFromTemplate(tabTitleTemplate, {
        tabTitle: tab.title,
        tabId: tab.id,
      }),
    )
    .join("\n");

  const tabPanelHtmls = tabs
    .map((tab) =>
      generateHTMLFromTemplate(tabPanelTemplate, {
        tabId: tab.id,
        tabPanelContent: tab.content
          .split("\n")
          .map((line) => `            <p>${line}</p>`)
          .join("\n"),
      }),
    )
    .join("\n");

  const pageHtml = generateHTMLFromTemplate(pageTemplate, {
    tabTitleHtmls,
    tabPanelHtmls,
  });

  return pageHtml;
}

export { generateHTMLFromTabs };
