"use client";

import React, { useState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "./ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Input } from "./ui/input";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Please select a Document to upload",
  }),
});

export default function PullModelForm() {
  const [isIngesting, setIsIngesting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const env = process.env.NODE_ENV;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsIngesting(true);

    const uploadDocs = async () => {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }

      const url = process.env.NEXT_PUBLIC_BRAINIAX_URL + "/v1/ingest/file"; 
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if(response.status == 200) {
        toast.success("Document Ingested successfully");
        setIsIngesting(false);
        return;
      }else{
        toast.error("Error: " + response.statusText);
        setIsIngesting(false);
        return;
      }
    };
    uploadDocs();
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      form.setValue("name", e.currentTarget.value);
      setFile(selectedFile);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Name</FormLabel>
              <Input
                {...field}
                type="file"
                accept="*"
                placeholder="Please Select a file to upload"
                onChange={(e) => handleChange(e)}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2 w-full">
          <Button type="submit" className="w-full " disabled={isIngesting}>
            {isIngesting ? (
              <div className="flex items-center gap-2">
                <Loader2Icon className="animate-spin w-4 h-4" />
                <span>Ingesting Document...</span>
              </div>
            ) : (
              "Ingest Document"
            )}
          </Button>
          <p className="text-xs text-center">
            {isIngesting
              ? "This may take a while. You can safely close this modal and continue using the app"
              : "Pressing the button will Ingest the specified File"}
          </p>
        </div>
      </form>
    </Form>
  );
}
