'use client';

import { ChatLayout } from '@/components/chat/chat-layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import UsernameForm from '@/components/username-form';
import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { BytesOutputParser } from '@langchain/core/output_parsers';
import { ChatRequestOptions } from 'ai';
import { Message, useChat } from 'ai/react';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    setMessages,
    setInput,
  } = useChat();
  const [chatId, setChatId] = React.useState<string>('');
  const [selectedDocument, setSelectedDocument] = React.useState<string>('');
  const [open, setOpen] = React.useState(false);
  const [ollama, setOllama] = useState<ChatOllama>();
  const env = process.env.NODE_ENV;

  React.useEffect(() => {
    if (!isLoading && !error && chatId && messages.length > 0) {
      // Save messages to local storage
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
      // Trigger the storage event to update the sidebar component
      window.dispatchEvent(new Event('storage'));
    }
  }, [messages, chatId, isLoading, error]);

  useEffect(() => {
    if (env === 'production') {
      const newOllama = new ChatOllama({
        baseUrl:
          process.env.NEXT_PUBLIC_BRAINIAX_URL || 'http://localhost:11434',
        model: selectedDocument,
      });
      setOllama(newOllama);
    }

    // console.log("selectedModel:", selectedModel);
    if (!localStorage.getItem('brainiax_user')) {
      setOpen(true);
    }
  }, [selectedDocument]);

  const addMessage = (Message: any) => {
    // console.log("addMessage:", Message);
    messages.push(Message);
    window.dispatchEvent(new Event('storage'));
    setMessages([...messages]);
  };

  // Function to handle chatting with Brainiax in production (client side)
  const handleSubmitProduction = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    addMessage({ role: 'user', content: input, id: chatId });
    setInput('');

    if (ollama) {
      const parser = new BytesOutputParser();

      // console.log(messages);
      const stream = await ollama
        .pipe(parser)
        .stream(
          (messages as Message[]).map((m) =>
            m.role == 'user'
              ? new HumanMessage(m.content)
              : new AIMessage(m.content),
          ),
        );

      const decoder = new TextDecoder();

      let responseMessage = '';
      for await (const chunk of stream) {
        const decodedChunk = decoder.decode(chunk);
        responseMessage += decodedChunk;
      }
      setMessages([
        ...messages,
        { role: 'assistant', content: responseMessage, id: chatId },
      ]);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (messages.length === 0) {
      // Generate a random id for the chat
      const id = uuidv4();
      setChatId(id);
    }

    setMessages([...messages]);

    // Prepare the options object with additional body data, to pass the model.
    const requestOptions: ChatRequestOptions = {
      options: {
        body: {
          selectedDocument: selectedDocument,
        },
      },
    };

    if (env === 'production') {
      handleSubmitProduction(e);
    } else {
      // Call the handleSubmit function with the options
      handleSubmit(e, requestOptions);
    }
  };

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center ">
      <Dialog open={open} onOpenChange={setOpen}>
        <ChatLayout
          chatId=""
          setSelectedDocument={setSelectedDocument}
          messages={messages}
          input={input}
          setInput={setInput}
          handleInputChange={handleInputChange}
          handleSubmit={onSubmit}
          isLoading={isLoading}
          error={error}
          stop={stop}
          navCollapsedSize={10}
          defaultLayout={[30, 160]}
        />
        <DialogContent className="flex flex-col space-y-4">
          <DialogHeader className="space-y-2">
            <DialogTitle>Welcome to Brainiax!</DialogTitle>
            <DialogDescription>
              Enter your name to get started. This is just to personalize your
              experience.
            </DialogDescription>
            <UsernameForm setOpen={setOpen} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
}
