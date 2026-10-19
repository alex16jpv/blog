# Alexander's blog

Source code for [blog.alexpvalencia.com](https://blog.alexpvalencia.com/), my personal blog about software development: architecture and design patterns, developer tools, and news from the tech and AI world.

It is a static site built with [Gatsby 5](https://www.gatsbyjs.com/) and React 18, and it is deployed on [Vercel](https://vercel.com/).

## Requirements

- **Node.js 24**. The version is set in `.nvmrc` and in the `engines` field of `package.json`. With [nvm](https://github.com/nvm-sh/nvm), run `nvm use`.
- **npm** (included with Node.js)
- **Python 3**, only needed for the post date helper

## Running it locally

```shell
npm install
npm run develop
```

The site runs at `http://localhost:8000`, and the GraphQL explorer is at `http://localhost:8000/___graphql`.

Other scripts:

| Command            | What it does                                           |
| ------------------ | ------------------------------------------------------ |
| `npm run build`    | Builds the production site into `public/`              |
| `npm run serve`    | Serves the production build at `http://localhost:9000` |
| `npm run clean`    | Deletes Gatsby's `.cache/` and `public/` folders       |
| `npm run format`   | Formats the code and content with Prettier             |
| `npm run new-date` | Prints the current UTC time in the post date format    |

## Writing a post

Each post is a Markdown file inside its own folder under `content/blog/`. The folder path becomes the post URL:

```
content/blog/
├── hello-world/
│   └── index.md                  → /hello-world/
└── design-patterns/
    └── hexagonal-architecture/
        └── index.md              → /design-patterns/hexagonal-architecture/
```

Every post starts with this frontmatter:

```markdown
---
title: My Post Title
date: "2026-10-19T14:00:00.000Z"
description: "A one-sentence summary of about 150-160 characters."
---

## First section

Post content...
```

- `date` must be in ISO 8601 format and in UTC. Get the current one with `npm run new-date`.
- `description` is used on the home page, in search engine results and in the RSS feed.
- Start the body with a `##` heading. The title is already rendered as the page's `h1`.
- Images and other files can go in the same folder as `index.md` and be linked with a relative path.

## Project structure

```
.
├── content/blog/       # Posts (Markdown)
├── src/
│   ├── components/     # Layout, Bio and Seo components
│   ├── images/         # Profile picture and site icon
│   ├── pages/          # Home page and 404 page
│   ├── templates/      # Blog post template
│   ├── utils/date.py   # Post date helper
│   └── style.css       # Global styles
├── static/             # Files copied as they are (favicon, robots.txt)
├── gatsby-config.js    # Site metadata and plugins
├── gatsby-node.js      # Creates a page for each post
├── gatsby-browser.js   # Global CSS and fonts
└── gatsby-ssr.js       # HTML attributes (lang)
```

Site settings such as the title, author, bio and Twitter handle are in `siteMetadata` in `gatsby-config.js`.

## Deployment

The site is deployed on Vercel from GitHub:

- Every push to `main` deploys to production.
- Every pull request gets a preview deployment.

Vercel picks the Node.js version from the `engines` field in `package.json`.

The RSS feed is generated at `/rss.xml`.

## License

© Alexander Valencia. All rights reserved. The posts and code in this repository may not be reused without permission.
