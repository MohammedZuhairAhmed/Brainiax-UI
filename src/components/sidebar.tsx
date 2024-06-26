'use client';

import Link from 'next/link';
import { MoreHorizontal, SquarePen, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Message } from 'ai/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import SidebarSkeleton from './sidebar-skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import UserSettings from './user-settings';
import { useLocalStorageData } from '@/app/hooks/useLocalStorageData';
import { ScrollArea, Scrollbar } from '@radix-ui/react-scroll-area';
import PullModel from './pull-model';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

import { useRouter } from 'next/navigation';

interface SidebarProps {
  isCollapsed: boolean;
  messages: Message[];
  onClick?: () => void;
  isMobile: boolean;
  chatId: string;
}

export function Sidebar({
  messages,
  isCollapsed,
  isMobile,
  chatId,
}: SidebarProps) {
  const [localChats, setLocalChats] = useState<
    { chatId: string; messages: Message[] }[]
  >([]);
  const localChatss = useLocalStorageData('chat_', []);
  const [selectedChatId, setSselectedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (chatId) {
      setSselectedChatId(chatId);
    }

    setLocalChats(getLocalstorageChats());
    const handleStorageChange = () => {
      setLocalChats(getLocalstorageChats());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const getLocalstorageChats = (): {
    chatId: string;
    messages: Message[];
  }[] => {
    const chats = Object.keys(localStorage).filter((key) =>
      key.startsWith('chat_'),
    );

    if (chats.length === 0) {
      setIsLoading(false);
    }

    // Map through the chats and return an object with chatId and messages
    const chatObjects = chats.map((chat) => {
      const item = localStorage.getItem(chat);
      return item
        ? { chatId: chat, messages: JSON.parse(item) }
        : { chatId: '', messages: [] };
    });

    // Sort chats by the createdAt date of the first message of each chat
    chatObjects.sort((a, b) => {
      const aDate = new Date(a.messages[0].createdAt);
      const bDate = new Date(b.messages[0].createdAt);
      return bDate.getTime() - aDate.getTime();
    });

    setIsLoading(false);
    return chatObjects;
  };

  const handleDeleteChat = (chatId: string) => {
    localStorage.removeItem(chatId);
    setLocalChats(getLocalstorageChats());
  };

  return (
    <div
      data-collapsed={isCollapsed}
      className="group relative flex h-full flex-col justify-between gap-4 p-2 data-[collapsed=true]:p-2 lg:bg-accent/20 lg:dark:bg-card/35 "
    >
      <div className=" flex max-h-fit flex-col justify-between overflow-y-auto p-2">
        <Button
          onClick={() => {
            router.push('/');
            // Clear messages
            messages.splice(0, messages.length);
          }}
          variant="ghost"
          className="flex h-14 w-full items-center justify-between text-sm font-normal xl:text-lg "
        >
          <div className="flex items-center gap-3 ">
            {!isCollapsed && !isMobile && (
              <Image
                src="/Color.png"
                alt="AI"
                width={100}
                height={100}
                className="h-10 w-10"
              />
            )}
            New chat
          </div>
          <SquarePen size={18} className="h-4 w-4 shrink-0" />
        </Button>

        <div className="flex flex-col gap-2 pt-10">
          <p className="pl-4 text-xs text-muted-foreground">Your chats</p>
          {localChats.length > 0 && (
            <div>
              {localChats.map(({ chatId, messages }, index) => (
                <Link
                  key={index}
                  href={`/${chatId.substr(5)}`}
                  className={cn(
                    {
                      [buttonVariants({ variant: 'secondaryLink' })]:
                        chatId.substring(5) === selectedChatId,
                      [buttonVariants({ variant: 'ghost' })]:
                        chatId.substring(5) !== selectedChatId,
                    },
                    'flex h-14 w-full items-center justify-between text-base font-normal ',
                  )}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="flex flex-col">
                      <span className="text-xs font-normal ">
                        {messages.length > 0 ? messages[0].content : ''}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center justify-end"
                      >
                        <MoreHorizontal size={15} className="shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className=" ">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex w-full items-center justify-start gap-2 text-red-500 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4 shrink-0" />
                            Delete chat
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader className="space-y-4">
                            <DialogTitle>Delete chat?</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this chat? This
                              action cannot be undone.
                            </DialogDescription>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline">Cancel</Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDeleteChat(chatId)}
                              >
                                Delete
                              </Button>
                            </div>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Link>
              ))}
            </div>
          )}
          {isLoading && <SidebarSkeleton />}
        </div>
      </div>

      <div className="w-full justify-end border-t px-2 py-2">
        <UserSettings />
      </div>
    </div>
  );
}
