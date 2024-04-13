"use client";

import { ChatLayout } from "@/components/chat/chat-layout";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import { ChatRequestOptions } from "ai";
import { Message, useChat } from "ai/react";
import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Page({ params }: { params: { id: string } }) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    setMessages,
    setInput
  } = useChat();
  const [chatId, setChatId] = React.useState<string>("");
  const [selectedDocument, setSelectedDocument] = React.useState<string>("");  
  const [ollama, setOllama] = React.useState<ChatOllama>();
  const env = process.env.NODE_ENV;

  // useEffect(() => {
  //   if (env === "production") {
  //     const newOllama = new ChatOllama({
  //       baseUrl: process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434",
  //       doc: selectedModel,
  //     });
  //     setOllama(newOllama);
  //   }
  // }, [selectedModel]);

  React.useEffect(() => {
    if (params.id) {
      const item = localStorage.getItem(`chat_${params.id}`);
      if (item) {
        setMessages(JSON.parse(item));
      }
    }
  }, [params.id, setMessages]);

  const addMessage = (Message: any) => {
    // console.log("addMessage:", Message);
    messages.push(Message);
    window.dispatchEvent(new Event("storage"));
    setMessages([...messages]);
  };


// Function to handle chatting with Ollama in production (client side)
const handleSubmitProduction = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  addMessage({ role: "user", content: input, id: chatId });
  setInput("");

  if (ollama) {
    const parser = new BytesOutputParser();

    // console.log(messages);
    const stream = await ollama
      .pipe(parser)
      .stream(
        (messages as Message[]).map((m) =>
          m.role == "user"
            ? new HumanMessage(m.content)
            : new AIMessage(m.content)
        )
      );

    const decoder = new TextDecoder();

    let responseMessage = "";
    for await (const chunk of stream) {
      const decodedChunk = decoder.decode(chunk);
      responseMessage += decodedChunk;
    }
    setMessages([
      ...messages,
      { role: "assistant", content: responseMessage, id: chatId },
    ]);
  }
};

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessages([...messages]);

    // Prepare the options object with additional body data, to pass the model.
    const requestOptions: ChatRequestOptions = {
      options: {
        body: {
          selectedDocument: selectedDocument,
        },
      },
    };

    if (env === "production" && selectedDocument !== "REST API") {
      handleSubmitProduction(e);
    } else {
      // use the /api/chat route
      // Call the handleSubmit function with the options
      handleSubmit(e, requestOptions);
    }
  };

  // When starting a new chat, append the messages to the local storage
  React.useEffect(() => {
    if (!isLoading && !error && messages.length > 0) {
      localStorage.setItem(`chat_${params.id}`, JSON.stringify(messages));
      // Trigger the storage event to update the sidebar component
      window.dispatchEvent(new Event("storage"));
    }
  }, [messages, chatId, isLoading, error, params.id]);

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center">
      <ChatLayout
        chatId={params.id}
        setSelectedDocument={setSelectedDocument}
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={onSubmit}
        isLoading={isLoading}
        error={error}
        stop={stop}
        navCollapsedSize={10}
        defaultLayout={[30, 160]}
      />
    </main>
  );
}
