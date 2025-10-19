"use server";

import { readFileSync } from "fs";

const tabTitleTemplate = readFileSync(
  "./src/server-actions/tab-generator/tab-title.template.html",
  "utf-8",
);

const tabPanelTemplate = readFileSync(
  "./src/server-actions/tab-generator/tab-panel.template.html",
  "utf-8",
);

const pageTemplate = readFileSync(
  "./src/server-actions/tab-generator/index.template.html",
  "utf-8",
);

function getHTMLTemplate(type: "tabTitle" | "tabPanel" | "page"): string {
  switch (type) {
    case "tabTitle":
      return tabTitleTemplate;
    case "tabPanel":
      return tabPanelTemplate;
    case "page":
      return pageTemplate;
  }
}

export { getHTMLTemplate };
