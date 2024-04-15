import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog';

import { DownloadIcon } from '@radix-ui/react-icons';
import PullModelForm from './pull-model-form';

export default function PullModel() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex w-full cursor-pointer items-center gap-2 p-1">
          <DownloadIcon className="h-4 w-4" />
          <p>Upload Document</p>
        </div>
      </DialogTrigger>
      <DialogContent className="space-y-2">
        <DialogTitle>Upload Document</DialogTitle>
        <PullModelForm />
      </DialogContent>
    </Dialog>
  );
}
