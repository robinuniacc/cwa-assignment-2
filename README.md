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

## Overview

Whatever is supported in the escape room builder is supported here.

Currently, a prompt is composed of components. Components can be of 3 types -- text, code, or line break.

For FITB questions, the answer to each blank can be either text or code and is rendered accordingly (code is rendered using a different font).

As of now, the dependencies are the Poppins font from Google Fonts, normalize.css, and he.js (HTML Encoder/Decoder) to sanitize HTML. he.js is necessary.

These dependencies can also be copied/pasted into the code directly.

Event listeners that uses to user-defined JavaScript code has to be attached dynamically, not inline.

## Visuals

As mentioned earlier, right now it uses normalize.css and he.js.

Question sprites are rendered as circles 32px wide. A sprite by default is rendered aqua; if the user's answer to the question is correct, the sprite is rendered green.

For True-False questions, there is a blank option, which is selected by default. This represents neither true nor false.

Users can click on the "Click to Finish" button that only marks the game finished if all answers are correct.

## Logic

Users click on question sprites to open up the answer modal. Answers are saved when users exit -- by clicking on the submit button, pressing the ESC key on the keyboard, or clicking outside the modal.

A question sprite turns green if the user answers correctly.

If all questions are answered correctly, a modal appears indicating so and the escape room becomes non-interactable, except for scrolling around to view the escape room.

For short answer questions and FITB questions, when the answer is not a single line, the input fields are rendered as textareas. For FITB questions, these textareas always appear on their own line regardless of whether or not there is a newline character preceding it in the prompt.
