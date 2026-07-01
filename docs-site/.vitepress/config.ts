import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
  defineConfig({
    title: "Grimoire",
    titleTemplate: ":title · Grimoire",
    description: "Documentation for Grimoire on 0G - SDK, CLI, and HTTP API.",
    lang: "en-US",
    base: "/",
    cleanUrls: true,
    lastUpdated: true,

    head: [
      ["link", { rel: "icon", href: "/hero-logo.png" }],
      ["meta", { name: "theme-color", content: "#7c3aed" }],
    ],

    themeConfig: {
      logo: "/logo-nav.png",
      siteTitle: "Grimoire",

      nav: [
        { text: "Platform", link: "/platform/" },
        { text: "SDK", link: "/sdk/installation" },
        { text: "CLI", link: "/cli/installation" },
        { text: "API", link: "/api/" },
        { text: "Console", link: "/application/" },
      ],

      sidebar: [
        {
          text: "Introduction",
          items: [
            { text: "Home", link: "/" },
            { text: "Platform", link: "/platform/" },
            { text: "How it works", link: "/concepts/how-it-works" },
            { text: "Prerequisites", link: "/guides/prerequisites" },
          ],
        },
        {
          text: "SDK",
          collapsed: false,
          items: [
            { text: "Overview", link: "/sdk/" },
            { text: "Installation", link: "/sdk/installation" },
            { text: "Quick start", link: "/sdk/quickstart" },
            { text: "createTask", link: "/sdk/create-task" },
            { text: "All methods", link: "/sdk/methods" },
            { text: "Errors", link: "/sdk/errors" },
            { text: "Agent integration", link: "/guides/agent-integration" },
          ],
        },
        {
          text: "CLI",
          collapsed: false,
          items: [
            { text: "Overview", link: "/cli/" },
            { text: "Installation", link: "/cli/installation" },
            { text: "Commands", link: "/cli/commands" },
          ],
        },
        {
          text: "HTTP API",
          items: [
            { text: "Overview", link: "/api/" },
            { text: "Authentication", link: "/api/authentication" },
            { text: "Post a task", link: "/api/post-task" },
            { text: "Task response", link: "/api/quest-response" },
            { text: "Credits", link: "/api/credits" },
            { text: "Memory", link: "/api/memory" },
            { text: "All endpoints", link: "/api/rest" },
          ],
        },
        {
          text: "Concepts",
          items: [
            { text: "Tasks & routing", link: "/concepts/tasks" },
            { text: "Skills", link: "/concepts/skills" },
            { text: "Royalties", link: "/concepts/royalties" },
            { text: "Credits & pricing", link: "/concepts/credits" },
            { text: "Wallet", link: "/concepts/wallet" },
          ],
        },
        {
          text: "More",
          items: [
            { text: "Engram memory", link: "/engram/" },
            { text: "Contracts", link: "/contracts/" },
            { text: "Console app", link: "/application/" },
            { text: "Build tasks", link: "/guides/build-tasks" },
            { text: "Troubleshooting", link: "/guides/troubleshooting" },
            { text: "Deploy docs", link: "/deployment/docs-site" },
          ],
        },
      ],

      socialLinks: [{ icon: "github", link: "https://github.com" }],

      footer: {
        message: "Grimoire on 0G",
        copyright: "Copyright © 2026 Grimoire",
      },

      search: { provider: "local" },
    },

    mermaid: { theme: "dark" },
  })
);
