import { Tab } from "../../server-actions/tab-generator/tab";
import { getHTMLTemplate } from "../../server-actions/tab-generator/html";
import useSWRImmutable from "swr/immutable";

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
  console.log(template);

  return parsed;
}

function generateHTMLFromTabs(
  tabs: Tab[],
  htmlTemplates: {
    tabTitleTemplate: string;
    tabPanelTemplate: string;
    pageTemplate: string;
  },
): string {
  const { tabTitleTemplate, tabPanelTemplate, pageTemplate } = htmlTemplates;
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
          .map((line) => `<p>${line}</p>`)
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

function useFetchTemplate() {
  const tabTitleTemplate = useSWRImmutable("tabTitle", () =>
    getHTMLTemplate("tabTitle"),
  );
  const tabPanelTemplate = useSWRImmutable("tabPanel", () =>
    getHTMLTemplate("tabPanel"),
  );
  const pageTemplate = useSWRImmutable("page", () => getHTMLTemplate("page"));

  return {
    tabTitleTemplate: tabTitleTemplate.data || "",
    tabPanelTemplate: tabPanelTemplate.data || "",
    pageTemplate: pageTemplate.data || "",
  };
}

export default useFetchTemplate;
export { generateHTMLFromTabs };
