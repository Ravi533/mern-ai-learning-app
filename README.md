# MERN + AI Learning Project

A hands-on learning project built with **React, Node.js, Express,
MongoDB, and local Ollama models**. It started with a MERN Task API and
has been extended with semantic search and a PDF question-answering
workflow using embeddings and Retrieval-Augmented Generation (RAG).

> This README documents the setup and features implemented so far. Some
> commands or frontend scripts may need to be adjusted to match your
> local `package.json`.

## Table of contents

-   [Project overview](#project-overview)
-   [Technology stack and tools](#technology-stack-and-tools)
-   [Prerequisites](#prerequisites)
-   [Project structure](#project-structure)
-   [Environment configuration](#environment-configuration)
-   [Installation and startup](#installation-and-startup)
-   [MERN Task API](#mern-task-api)
-   [AI and semantic search](#ai-and-semantic-search)
-   [PDF RAG workflow](#pdf-rag-workflow)
-   [API endpoints](#api-endpoints)
-   [Troubleshooting](#troubleshooting)
-   [Current limitations and next
    steps](#current-limitations-and-next-steps)

## Project overview

The project currently covers these learning areas:

1.  **MERN fundamentals:** React UI, Express API, MongoDB persistence,
    and Mongoose models.
2.  **REST API development:** task CRUD, filtering, searching,
    pagination, validation, and centralized error handling.
3.  **AI fundamentals in JavaScript:** calling local embedding and chat
    models from Node.js.
4.  **Semantic search:** converting text and queries into vectors and
    ranking results using cosine similarity.
5.  **PDF question answering:** uploading a PDF, extracting and chunking
    its text, generating embeddings, retrieving relevant chunks, and
    asking an LLM to answer from the retrieved context.

## Technology stack and tools

  -----------------------------------------------------------------------
  Technology / tool                   Purpose
  ----------------------------------- -----------------------------------
  JavaScript / Node.js (ES modules)   Backend language and runtime

  React                               Frontend UI

  Express                             REST API server

  MongoDB Atlas                       Hosted MongoDB database

  Mongoose                            MongoDB object modelling

  Ollama                              Runs local AI models and exposes an
                                      HTTP API

  `nomic-embed-text`                  Creates text embeddings for
                                      semantic retrieval

  `llama3.2:3b`                       Generates answers using retrieved
                                      PDF context

  `pdf-parse` (`PDFParse` API, v2)    Extracts text from uploaded PDF
                                      files

  `multer`                            Handles multipart PDF uploads in
                                      Express

  `cosineSimilarity.js`               Compares embedding vectors

  `chunkText.js`                      Splits extracted PDF text into
                                      overlapping chunks

  `nodemon`                           Restarts the backend during
                                      development

  `curl`                              Tests API endpoints from the
                                      terminal

  npm                                 Installs JavaScript dependencies
                                      and runs scripts
  -----------------------------------------------------------------------

The AI flow is implemented in JavaScript/Node.js; Python is not required
for the current implementation.

## Prerequisites

Install or configure the following before starting:

-   Node.js and npm
-   Git (optional, but recommended)
-   MongoDB Atlas account and a database cluster
-   Ollama for macOS
-   The local Ollama models listed below
-   A modern browser for the React app

Check your Node/npm installation:

``` bash
node --version
npm --version
```

## Project structure

The backend code described in this README lives in the project root:

``` text
Node_App/
├── src/
│   ├── config/
│   │   └── embeddingConnection.js
│   ├── controllers/
│   │   ├── pdfController.js
│   │   └── pdfQuestionController.js
│   ├── routes/
│   │   └── pdfRoutes.js
│   ├── utils/
│   │   ├── chunkText.js
│   │   ├── cosineSimilarity.js
│   │   ├── pdfStore.js
│   │   └── semanticSearch.js
│   ├── models/
│   │   └── Task.js
│   ├── middleware/
│   │   └── errorMiddleware.js
│   └── ...
├── .env                 # Local secrets; do not commit
├── .gitignore
├── package.json
└── README.md
```

The exact folders can differ slightly as the project evolves. The React
frontend includes `AiAssistant.jsx` and the related styles; keep
frontend-specific files in their existing frontend directories.

## Environment configuration

Create a `.env` file in the backend project root. Use your own Atlas
connection string:

``` dotenv
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/mern_tasks?retryWrites=true&w=majority
```

Replace the placeholders with the values from MongoDB Atlas. URL-encode
special characters in the database password when required. Never commit
`.env` or paste database credentials into public issues or repositories.

The server uses `process.env.MONGODB_URI` and should load environment
variables before connecting to MongoDB, for example:

``` js
import "dotenv/config";
```

### MongoDB Atlas network access

If Atlas rejects the connection:

1.  Open your Atlas project and go to **Security → Network Access**
    (sometimes labelled **IP Access List**).
2.  Add the public IP address of the network your development machine
    uses.
3.  Wait until the entry becomes active.
4.  If you use a VPN or switch networks, the public IP may change.
5.  Confirm the connection string and database user/password.

Prefer allowing your current IP rather than opening database access to
every IP address.

## Installation and startup

### 1. Install backend dependencies

From the project directory:

``` bash
cd /Users/ravinder/React/Node_App
npm install
```

The project has used these additional packages:

``` bash
npm install multer pdf-parse@2.4.5
```

If these packages are already listed in `package.json`, do not install
them again. Check the available scripts with:

``` bash
npm run
```

### 2. Start MongoDB connectivity

The project uses MongoDB Atlas, so a local MongoDB server is not
required. Confirm that the Atlas cluster is available, your database
user is valid, and your current IP is allowed.

### 3. Start Ollama

Check installed models:

``` bash
ollama list
```

Download the models if needed:

``` bash
ollama pull nomic-embed-text
ollama pull llama3.2:3b
```

Ollama normally exposes its local API at:

``` text
http://localhost:11434
```

Test that it is reachable:

``` bash
curl http://localhost:11434/api/tags
```

If the API is not running and Ollama is not already running as a macOS
application, start it in a separate terminal:

``` bash
ollama serve
```

Keep the Ollama service running while using embedding or chat endpoints.

### 4. Start the Node.js server

In the backend terminal:

``` bash
npm run dev
```

The API is configured to use port **5001**, because port **5000** was
occupied by macOS ControlCenter on this machine. The expected startup
output should indicate that the server is listening on port 5001 and
MongoDB has connected.

Test the server root if your app defines one:

``` bash
curl http://localhost:5001
```

### 5. Start the React frontend

Open a separate terminal in the frontend directory and run the script
defined by that frontend's `package.json`, commonly:

``` bash
npm install
npm run dev
```

Use the URL printed by the frontend development server. The AI assistant
UI has been configured to call the backend at `http://localhost:5001`.

## MERN Task API

The task API has been used to practise:

-   Creating, reading, updating, and deleting tasks.
-   Mongoose model validation (including a minimum title length of three
    characters).
-   Filtering by completion status, for example `completed=true` or
    `completed=false`.
-   Searching tasks by text.
-   Pagination using `page` and `limit`.
-   Centralized error middleware and handling invalid MongoDB IDs or
    missing tasks.
-   `async`/`await`, controller functions, route handlers, and request
    data via `req.params`, `req.query`, and `req.body`.

Example query URLs (quote URLs in zsh when using `curl` if the query
contains `?` or `&`):

``` bash
curl 'http://localhost:5001/api/tasks?completed=false'
curl 'http://localhost:5001/api/tasks?search=learn&completed=false'
curl 'http://localhost:5001/api/tasks?page=1&limit=2'
```

The exact response shape depends on the current task controller
implementation.

## AI and semantic search

### Embeddings

An embedding model turns text into a numeric vector. Texts with similar
meaning tend to have vectors that are close in vector space. The project
uses Ollama's `nomic-embed-text` model through
`src/config/embeddingConnection.js`.

The implementation calls:

``` text
POST http://localhost:11434/api/embed
```

with a request body similar to:

``` json
{
  "model": "nomic-embed-text",
  "input": "Example text to embed"
}
```

The returned first embedding vector is used for similarity comparison.

### Cosine similarity

`src/utils/cosineSimilarity.js` compares the query embedding with stored
text embeddings. Semantic search ranks candidate documents by similarity
rather than relying only on exact keyword matches.

The initial `src/utils/semanticSearch.js` learning example contains
sample technical documentation for topics such as React, Node.js, and
MongoDB.

## PDF RAG workflow

The PDF question-answering feature is a small, local RAG pipeline.

1.  The React UI selects a PDF and submits it as multipart form data
    with the field name `pdf`.
2.  Express/Multer accepts the file in memory, with a 5 MB size limit
    and PDF checks.
3.  `pdf-parse` extracts the PDF's text.
4.  `chunkText.js` cleans the text and splits it into chunks of about
    1,000 characters with 150 characters of overlap by default.
5.  `createEmbedding()` generates a vector for every chunk using
    `nomic-embed-text`.
6.  The chunks and vectors are stored in the in-memory `pdfStore`.
7.  When a user asks a question, the backend embeds the question and
    ranks the stored chunks using cosine similarity.
8.  The top three chunks are supplied as context to `llama3.2:3b`
    through Ollama's chat API.
9.  The API returns an answer and the retrieved source chunks.

### Relevant files

  --------------------------------------------------------------------------------
  File                                         Responsibility
  -------------------------------------------- -----------------------------------
  `src/config/embeddingConnection.js`          Calls Ollama's embedding endpoint

  `src/utils/chunkText.js`                     Cleans and chunks extracted text

  `src/utils/cosineSimilarity.js`              Calculates cosine similarity

  `src/utils/pdfStore.js`                      Keeps the currently uploaded PDF's
                                               chunks in memory

  `src/controllers/pdfController.js`           Validates upload, extracts text,
                                               creates chunk embeddings

  `src/controllers/pdfQuestionController.js`   Retrieves relevant chunks and calls
                                               the chat model

  `src/routes/pdfRoutes.js`                    Defines upload and question routes

  `AiAssistant.jsx`                            Frontend upload and chat UI
  --------------------------------------------------------------------------------

### Upload a PDF and ask a question

Start the backend, frontend, and Ollama first. Then:

1.  Open the React app.
2.  Choose a readable PDF using the upload control.
3.  Upload it and wait for chunking and embedding generation to finish.
4.  Ask a question that can be answered from that PDF.

The backend endpoints are:

``` text
POST http://localhost:5001/api/pdf/upload
POST http://localhost:5001/api/pdf/ask
```

For the upload request, use `multipart/form-data` with a field named
`pdf`. For the question request, send JSON:

``` json
{
  "question": "What is the main topic of this document?"
}
```

Example terminal request for a PDF (replace `./document.pdf` with a real
local file):

``` bash
curl -X POST http://localhost:5001/api/pdf/upload \
  -F "pdf=@./document.pdf"
```

Example question request:

``` bash
curl -X POST http://localhost:5001/api/pdf/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the main topic of this document?"}'
```

## API endpoints

  ---------------------------------------------------------------------------
  Method                  Endpoint                Purpose
  ----------------------- ----------------------- ---------------------------
  `GET`                   `/`                     Basic server health
                                                  response, if configured

  `GET`                   `/api/tasks`            List tasks; supports
                                                  filters/search/pagination
                                                  in the current
                                                  implementation

  `POST`                  `/api/tasks`            Create a task

  `PATCH`                 `/api/tasks/:id`        Update a task

  `DELETE`                `/api/tasks/:id`        Delete a task

  `POST`                  `/api/pdf/upload`       Upload and process a PDF

  `POST`                  `/api/pdf/ask`          Ask a question about the
                                                  currently stored PDF
  ---------------------------------------------------------------------------

Check the route files for the exact supported methods and parameters as
the project changes.

## Troubleshooting

### `TypeError: fetch failed` / `ECONNREFUSED` from `createEmbedding`

This usually means Node.js cannot connect to Ollama at
`localhost:11434`.

``` bash
ollama list
curl http://localhost:11434/api/tags
```

If the API is unavailable, start Ollama (if it is not already running)
and retry. Also confirm that the embedding model is installed:

``` bash
ollama pull nomic-embed-text
```

### Ollama chat or embedding request returns an error

Test the embedding endpoint independently:

``` bash
curl http://localhost:11434/api/embed \
  -H "Content-Type: application/json" \
  -d '{"model":"nomic-embed-text","input":"Test embedding"}'
```

Check that the model name in the request exactly matches an installed
model.

### MongoDB Atlas connection fails

Check the `MONGODB_URI`, Atlas cluster status, database
username/password, and IP Access List. The IP entry must match the
public IP used by your current network. Do not share your `.env` file.

### `Unexpected token '<' ... not valid JSON`

This often means the frontend tried to parse an HTML error page as JSON.
Check that the backend route exists, that the server is running on the
expected port, and that the request URL is correct. Inspect the Network
tab and backend logs before calling `response.json()`.

### `Cannot POST` or `Cannot DELETE`

Check the HTTP method, route path, router export/import, and where the
router is mounted in the Express server. For example, mounting
`pdfRoutes` at `/api/pdf` makes `/upload` available at
`/api/pdf/upload`.

### Port 5000 is already in use on macOS

The project uses port 5001 because macOS ControlCenter was listening on
port 5000. Ensure the server's configured port and frontend API URLs
agree.

### PDF upload works, but the answer is not grounded

The current implementation retrieves the top three chunks and sends them
to the LLM. Retrieval can return weakly related chunks for unrelated
questions. A relevance threshold, clearer source references, and
evaluation tests are useful next improvements.

## Current limitations and next steps

This is a learning POC, not a production-ready document platform.

-   **In-memory PDF storage:** only one PDF is retained, and data is
    lost when the Node process restarts. Multiple users can overwrite
    each other's document.
-   **Sequential embedding generation:** chunks are embedded one at a
    time, which can make large PDFs slow.
-   **Retrieval threshold:** the current question controller takes the
    top three chunks without a robust relevance threshold.
-   **File handling:** the upload route uses memory storage and a 5 MB
    limit; production systems need stronger file validation, resource
    controls, and access controls.
-   **Database separation:** MongoDB Atlas stores the task data; PDF
    chunk embeddings are currently held in process memory rather than
    persisted in a vector database.
-   **Model availability:** Ollama must be running locally, and the
    models must be downloaded before AI endpoints work.

Suggested learning sequence:

1.  Finish reliable startup and error handling for MongoDB Atlas and
    Ollama.
2.  Add relevance scoring thresholds and source citations to PDF
    answers.
3.  Persist document metadata and chunks in MongoDB.
4.  Support multiple PDFs and isolate documents by user.
5.  Add a vector database such as Chroma or Pinecone when ready to learn
    dedicated vector storage.
6.  Add tests for chunking, similarity ranking, upload validation, and
    question answering.
7.  Review authentication, authorization, logging, and production
    deployment requirements.

------------------------------------------------------------------------

## Security notes

-   Do not commit `.env`, Atlas credentials, tokens, or private PDFs.
-   Keep `.env` in `.gitignore`.
-   Do not expose Ollama or the backend publicly without appropriate
    network and access controls.
-   Treat retrieved PDF content as untrusted input. The model should
    answer from supplied context and should not follow instructions
    embedded inside uploaded documents.
