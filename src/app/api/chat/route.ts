// // NO SOURCES FILTER

// import {
//   OpenAIStream,
//   StreamingTextResponse,
// } from "ai";

// export const runtime = "edge";
// export const dynamic = "force-dynamic";

// export async function POST(req: Request) {
//   const { messages, selectedDocument } = await req.json();
//   const useContext = selectedDocument !== "LLM CHAT";

//   let docIds: string[] = [];

//   const url1 = process.env.NEXT_PUBLIC_BRAINIAX_URL + "/v1/ingest/list";
//   const res = await fetch(url1);
//   const json = await res.json();

//   if (useContext) {
//     docIds = json.data
//       .filter(
//         (document: any) => document.doc_metadata.file_name === selectedDocument
//       )
//       .map((document: any) => document.doc_id);
//   }

//   const url = process.env.NEXT_PUBLIC_BRAINIAX_URL + `/v1/chat/completions`;
//   const body = JSON.stringify({
//     context_filter: {
//       docs_ids: docIds,
//     },
//     include_sources: true,
//     messages: messages,
//     stream: true,
//     use_context: useContext,
//   });

//   const data = await fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body,
//   });

//   const stream = OpenAIStream(data);

//   return new StreamingTextResponse(stream);
// }

// WITH SOURCES FILTER

import { StreamingTextResponse, AIStream } from 'ai';
import { use } from 'react';

type Source = {
  file: string;
  page: string;
  text: string;
};

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { messages, selectedDocument } = await req.json();
  const useContext = selectedDocument !== 'LLM CHAT';

  let docIds: string[] = [];

  const url1 = process.env.NEXT_PUBLIC_BRAINIAX_URL + '/v1/ingest/list';
  const res = await fetch(url1);
  const json = await res.json();

  if (useContext) {
    docIds = json.data
      .filter(
        (document: any) => document.doc_metadata.file_name === selectedDocument,
      )
      .map((document: any) => document.doc_id);
  }

  const url = process.env.NEXT_PUBLIC_BRAINIAX_URL + `/v1/chat/completions`;
  const body = JSON.stringify({
    context_filter: {
      docs_ids: docIds,
    },
    include_sources: true,
    messages: messages,
    stream: true,
    use_context: useContext,
  });

  const data = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  const stream = AIStream(data, parseStreamData);
  return new StreamingTextResponse(stream);
}

let accumulatedSources: Source[] = [];

function parseStreamData(data: string): string | void {
  const chunk = JSON.parse(data);
  const choices = chunk.choices?.[0];

  if (!choices) {
    return;
  }

  const { delta, sources, finish_reason } = choices;

  if (sources) {
    sources.map((chunk: any) => {
      const doc_metadata = chunk.document.doc_metadata;
      const file_name = doc_metadata?.file_name || '-';
      const page_label = doc_metadata?.page_label || '-';

      const val: Source = {
        file: file_name,
        page: page_label,
        text: chunk.text,
      };
      const existingSourceIndex = accumulatedSources.findIndex(
        (source) => source.file === val.file && source.page === val.page,
      );

      if (existingSourceIndex === -1) {
        accumulatedSources.push(val);
      }
    });
  }

  if (finish_reason === 'stop') {
    let response = '\n\n Sources:';
    let sourcesText = '\n\n';
    const usedFiles = new Set();

    for (let i = 1; i <= accumulatedSources.length; i++) {
      const source = accumulatedSources[i - 1];
      const key = source.file + '-' + source.page;
      if (!usedFiles.has(key)) {
        sourcesText += `${i}. ${source.file} (page ${source.page}) \n`;
        usedFiles.add(key);
      }
    }

    const hasContent = /[a-zA-Z]+/.test(sourcesText.slice(2));

    if (!hasContent) {
      return;
    }

    response += sourcesText;
    return response;
  } else {
    return delta?.content;
  }
}
