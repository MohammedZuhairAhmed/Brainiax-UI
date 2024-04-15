'use client';

import React, { useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '../ui/button';
import { CaretSortIcon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Sidebar } from '../sidebar';
import { Message } from 'ai/react';
import { useDocuments } from '@/app/hooks/useDocuments';

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
  const [open, setOpen] = React.useState(false);
  const { documents, fetchDocuments } = useDocuments();
  const [currentDocument, setCurrentDocument] = React.useState<string | null>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      await fetchDocuments();
    };
    fetchData();
  }, [fetchDocuments, open]);
  // useEffect(() => {
  //   // setCurrentDocument(getSelectedModel());

  //   const env = process.env.NODE_ENV;

  //   const fetchDocuments = async () => {
  //     if (env === "production") {
  //       const fetchedDocuments = await fetch(
  //         process.env.NEXT_PUBLIC_BRAINIAX_URL + "/api/tags"
  //       );
  //       const json = await fetchedDocuments.json();
  //       const uniqueFileNames = new Set<string>(
  //         json.data.map((document: any) => document.doc_metadata.file_name)
  //       );
  //       const documentNames = Array.from(uniqueFileNames);
  //       setDocuments(documentNames);
  //     } else {
  //       const fetchedDocuments = await fetch("/api/tags", { next: { revalidate: false} });
  //       const json = await fetchedDocuments.json();
  //       const uniqueFileNames = new Set<string>(
  //         json.data.map((document: any) => document.doc_metadata.file_name)
  //       );
  //       const documentNames = Array.from(uniqueFileNames);
  //       setDocuments(documentNames);
  //     }
  //   };
  //   fetchDocuments();
  // }, []);

  const handleDocumentChange = (document: string) => {
    setCurrentDocument(document);
    setSelectedDocument(document);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedDocument', document);
    }
    setOpen(false);
  };

  return (
    <div className="flex w-full items-center justify-between  px-4 py-6 lg:justify-center ">
      <Sheet>
        <SheetTrigger>
          <HamburgerMenuIcon className="h-5 w-5 lg:hidden" />
        </SheetTrigger>
        <SheetContent side="left">
          <Sidebar
            chatId={chatId || ''}
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
            className={`justify-between`}
          >
            {currentDocument || 'Select Document'}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={`w-fit p-5`}>
          {documents.length > 0 ? (
            documents.map((doc) => (
              <div key={doc} className="text-center">
                <Button
                  variant="ghost"
                  className="w-fit p-5"
                  onClick={() => {
                    handleDocumentChange(doc);
                  }}
                >
                  {doc}
                </Button>
              </div>
            ))
          ) : (
            <Button variant="ghost" disabled className=" w-full">
              No Documents available
            </Button>
          )}
        </PopoverContent>
        {/* <PopoverContent className={`w-fit p-5`}>
  {isFetching ? ( // Show loading message while fetching documents
    <p>Fetching documents...</p>
  ) : documents.length > 0 ? ( // Show document list if available
    documents.map((doc) => (
      <div key={doc} className="text-center">
        <Button
          variant="ghost"
          className="w-fit p-5"
          onClick={() => {
            handleDocumentChange(doc);
          }}
        >
          {doc}
        </Button>
      </div>
    ))
  ) : (
    <Button variant="ghost" disabled className=" w-full">
      No Documents available
    </Button>
  )}
</PopoverContent> */}
      </Popover>
    </div>
  );
}
