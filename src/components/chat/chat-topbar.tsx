"use client";

import React, { useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "../ui/button";
import { CaretSortIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Sidebar } from "../sidebar";
import { Message } from "ai/react";
interface ChatTopbarProps {
  setSelectedDocument: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  chatId?: string;
  messages: Message[];
}

export default function ChatTopbar({
  setSelectedDocument,
  isLoading,
  chatId,
  messages,
}: ChatTopbarProps) {
  const [documents, setDocuments] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [currentDocument, setCurrentDocument] = React.useState<string | null>(null);
  const [maxWidth, setMaxWidth] = React.useState(0);

  useEffect(() => {
    // Calculate maximum width based on initial models
    const modelWidths = documents.map((doc) => {
      const buttonEl = document.createElement("button");
      buttonEl.textContent = doc;
      document.body.appendChild(buttonEl);
      const width = buttonEl.clientWidth;
      document.body.removeChild(buttonEl);
      return width;
    });
    setMaxWidth(Math.max(...modelWidths)); // Add padding
  }, [documents]);

  useEffect(() => {
    // setCurrentDocument(getSelectedModel());

    const env = process.env.NODE_ENV;

    const fetchDocuments = async () => {
      if (env === "production") {
        const fetchedDocuments = await fetch(
          process.env.NEXT_PUBLIC_OLLAMA_URL + "/api/tags"
        );
        const json = await fetchedDocuments.json();
        const uniqueFileNames = new Set<string>(
          json.data.map((document: any) => document.doc_metadata.file_name)
        );
        const documentNames = Array.from(uniqueFileNames);
        setDocuments(documentNames);
      } else {
        const fetchedDocuments = await fetch("/api/tags");
        const json = await fetchedDocuments.json();
        const uniqueFileNames = new Set<string>(
          json.data.map((document: any) => document.doc_metadata.file_name)
        );
        const documentNames = Array.from(uniqueFileNames);
        setDocuments(documentNames);
      }
    };
    fetchDocuments();
  }, []);

  const handleDocumentChange = (document: string) => {
    setCurrentDocument(document);
    setSelectedDocument(document);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedDocument", document);
    }
    setOpen(false);
  };

  return (
    <div className="w-full flex px-4 py-6  items-center justify-between lg:justify-center ">
      <Sheet>
        <SheetTrigger>
          <HamburgerMenuIcon className="lg:hidden w-5 h-5" />
        </SheetTrigger>
        <SheetContent side="left">
          <Sidebar
            chatId={chatId || ""}
            isCollapsed={false}
            isMobile={false}
            messages={messages}
          />
        </SheetContent>
      </Sheet>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            disabled={isLoading}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-[${maxWidth}px] justify-between`}
          >
            {currentDocument || "Select Document"}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={`w-[${maxWidth}px] p-10`}>
          {documents.length > 0 ? (
            documents.map((doc) => (
              <Button
                key={doc}
                variant="ghost"
                className="w-full p-10"
                onClick={() => {
                  handleDocumentChange(doc);
                }}
              >
                {doc}
              </Button>
            ))
          ) : (
            <Button variant="ghost" disabled className=" w-full">
              No Documents available
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
