# Overview

This project allows use to generate HTML code for LMS-compatible content. This project uses [Next.js](https://nextjs.org/) and [TailwindCSS](https://tailwindcss.com/).

Find out more on:

1. [Getting Started](#getting-started)
2. [Tab Content]()
3. [Escape room](#escape-room)

# Getting Started

Follow these steps to set up and run the project locally:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/RaksaRobin/cwa-assignment-1.git
   cd cwa-assignment-1
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

4. **Build for production:**

   ```bash
   npm run build
   npm start
   ```

5. **Lint and format code:**

   ```bash
   npx run prettier . --write
   npm run lint
   ```

   I try to build the app as scalable as possible. It's very easy to just code, code, code to meet the requirements.

Since this project seems somewhat exciting, I took on the challenge of making it scalable.

# Escape room

This allows you to build an escape room. It generates a javascript code that can be copied/pasted into a file and immediately runs in a browser.

## Architecture

The escape room is organized into **workspaces**. A workspace is a complete app. What that means is if you `npx create-next-app@latest` right now, the workspace file -- along with its dependencies -- can be copied/pasted into that new project with just configuring its props.

This make it easy to scale in the future if you want multiple escape rooms or multiple subrooms/stages in the escape room you're building, and you want the user to be able to edit 2 or more of them at the same time -- just add 2 or more workspace components in your page and you're all set. That's not 100% true, because the way some of the things work right now, but it nevertheless is quite easy to scale.

A workspace is consisted of the bg img, the tools, the questions, etc.

The rendered question bubbles overlaid on the bg image is called a **question sprite**. When clicked, it opens up the editor.

The editor is comprised of 2 things -- the prompt editor, and the answer editor.

The prompt editor is used to design prompts. A prompt may be consisted of many formats; for example, text, code, images, etc. Currently, it supports text, code, and line breaks. More can be added as necessary.

The answer editor is used to design the answers --- WHOA WHO COULD'VE GUESSED?
