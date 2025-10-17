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
   git clone https://github.com/RaksaRobin/cwa-assignment-2.git
   cd cwa-assignment-2
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

## Addtional steps for the escape room

To save your progress of the escape room builder (not the escape room itself), you have 2 choices: use browser storage or use cloud storage.

If you'd like to use local storage, go to `src/app/escape-room/page.tsx`, replace ` = useDbAndS3()` with ` = useBrowserStorage()`, and add the missing import.

Regardless of which one you choose, the actual playable escape room is still hosted on S3 that needs to be configured like so:

### Modify the max limit size in server actions in `next.config.ts`

Set this to a slight positive offset of the max image size you're planning to use.

For instance, if you're planning to use image up to "8mb", set the config to slightly higher, say "10mb".

### Create an S3 bucket

Make sure you have an S3 bucket with 3 folders: /res, /finished, /unfinished.

- The `/res` folder is used to store your resources shared by all escape rooms. Currently, it hosts the question sprite icons.

  It's assumed the path of the sprite is "/question-mark.png" for questions answered incorrectly, and "/question-mark-green.png" for questions answered correctly.

- The `/finished` folder is used to store escape rooms that are finished and playable.
- The `/unfinished` folder is used to store escape rooms to save progress of escape room builders.

Then, go to the `Permissions` tab of your bucket and disable all 4 checkboxes in `Block public access (bucket settings)`.

Finally, scroll down to the `Bucket policy` SECTION, and paste this in (replacing `BUCKET_NAME` with the name of your bucket):

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Allow Public Read-Only to /res & /finished",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": [
                "arn:aws:s3:::BUCKET_NAME/res/*",
                "arn:aws:s3:::BUCKET_NAME/finished/*"
            ]
        }
    ]
}
```

### Create a Lambda function

Create a lambda function with at least >=128MB of memory and node.js v22+.

In VSCode, navigate to the `src/app/escape-room/lambda-ready` folder, run `npm i`, zip the folder, go back to the lambda function page, click `Upload from`, select `.zip file`, and upload the zip file to the lambda function.

Then, edit the role of your lambda function by heading to the `Configuration` tab, and follow the hyperlink to the lambda role. This link is quite small and usually looks something like `YOUR_LAMBDA_FUNCTION_NAME-fdvxz14rkc`. Click `Add permissions` and select `Attach policies`. Look for `AmazonS3FullAcess`, check it in the checkbox, scroll all the way down, and click on `Add permissions`.

In your lambda function, head back to the `Code` tab, and click `Deploy`.

### Fill in the environment variables

Rename `.env.example` to `.env.development`, and then write your AWS Credentials and other env vars.

If you have AWS CLI installed on your PC that configured with a secret access key, you don't need to type them in in the .env file.

# Escape room

## Run

Bring up the database first with

```sh
docker compose -f compose.dev.yaml up
```

Wait till you see

```sh
2025-10-08 01:37:41.432 UTC [1] LOG:  database system is ready to accept connections
```

Next, you have to migrate the database. Note that you only have to do this once. If you've run it before, don't run it again.

```sh
npm run reset-db-dev
# When prompted, type "y" and hit Enter
```

Then, you can run the website:

```sh
npm run dev
```

Once you're finished, close the Next.js app and docker with `Ctrl+C`. You may have to `Ctrl+C` twice.

## Architecture

Currently, a prompt is composed of components. Components can be of 3 types -- text, code, or line break.

For FITB questions, the answer to each blank can be either text or code and is rendered accordingly (code is rendered using a different font).

As of now, the dependencies are the Poppins font from Google Fonts, normalize.css, and he.js (HTML Encoder/Decoder) to sanitize HTML. he.js is necessary.

These dependencies can also be copied/pasted into the code directly.

Event listeners that uses user-defined JavaScript code has to be attached dynamically, not inline.

## Visuals

As mentioned earlier, right now it uses Poppins, normalize.css and, he.js.

Question sprites are rendered as circles 32px wide. A sprite by default is rendered aqua; if the user's answer to the question is correct, the sprite is rendered green.

For True-False questions, there is a blank option, which is selected by default. This represents neither true nor false.

Users can click on the "Click to Finish" button that only marks the game finished if all answers are correct.

## Logic

Users click on question sprites to open up the answer modal. Answers are saved when users exit -- by clicking on the submit button, pressing the ESC key on the keyboard, or clicking outside the modal.

A question sprite turns green if the user answers correctly.

If all questions are answered correctly, a modal appears indicating so and the escape room becomes non-interactable, except for scrolling around to view the escape room.

For short answer questions and FITB questions, when the answer is not a single line, the input fields are rendered as textareas. For FITB questions, these textareas always appear on their own line regardless of whether or not there is a newline character preceding it in the prompt.
