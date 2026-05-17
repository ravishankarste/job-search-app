import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// We need to set the worker source for PDF.js to work in a browser environment
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const pdfExtractionService = {
  /**
   * Extracts raw text from a PDF or DOCX file
   */
  async extractText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Handle Word (.docx) files
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value.trim();
      }
      
      // Default to PDF extraction
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Loop through each page to extract text
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error("[pdfExtractionService] Error extracting text from document:", error);
      return "";
    }
  }
};
