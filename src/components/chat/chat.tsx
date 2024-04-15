import React from 'react';
import ChatTopbar from './chat-topbar';
import ChatList from './chat-list';
import ChatBottombar from './chat-bottombar';
import { Message, useChat } from 'ai/react';
import { ChatRequestOptions } from 'ai';
import { v4 as uuidv4 } from 'uuid';

export interface ChatProps {
  chatId?: string;
  setSelectedDocument: React.Dispatch<React.SetStateAction<string>>;
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  isLoading: boolean;
  error: undefined | Error;
  stop: () => void;
}

export default function Chat({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  error,
  stop,
  setSelectedDocument,
  chatId,
}: ChatProps) {
  return (
    <div className="flex h-full w-full flex-col justify-between  ">
      <ChatTopbar
        setSelectedDocument={setSelectedDocument}
        isLoading={isLoading}
        chatId={chatId}
        messages={messages}
      />

      <ChatList
        setSelectedDocument={setSelectedDocument}
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        stop={stop}
      />

      <ChatBottombar
        setSelectedDocument={setSelectedDocument}
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        stop={stop}
      />
    </div>
  );
}
