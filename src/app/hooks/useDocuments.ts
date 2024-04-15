import { useState, useEffect, useCallback } from 'react';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<string[]>([]);

  const fetchDocuments = useCallback(async () => {
    try {
      const fetchedDocuments = await fetch('/api/tags');
      const json = await fetchedDocuments.json();
      const uniqueFileNames = new Set<string>(
        json.data.map((document: any) => document.doc_metadata.file_name),
      );
      const documentNames = Array.from(uniqueFileNames);
      documentNames.unshift('LLM CHAT');
      setDocuments(documentNames);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, fetchDocuments };
};
