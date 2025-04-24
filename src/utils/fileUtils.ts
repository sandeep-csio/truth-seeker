
import { EvaluationItem, EvaluationProject } from './types';
import * as XLSX from 'xlsx';

export const parseExcelFile = async (file: File): Promise<EvaluationItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Validate and transform data
        const items = validateAndTransformData(jsonData);
        resolve(items);
      } catch (error) {
        console.log("Error parsing Excel file:", error);
        reject(new Error('Failed to parse Excel file. Please check the file format.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const parseCSVFile = async (file: File): Promise<EvaluationItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const workbook = XLSX.read(csv, { type: 'string' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Validate and transform data
        const items = validateAndTransformData(jsonData);
        resolve(items);
      } catch (error) {
        reject(new Error('Failed to parse CSV file. Please check the file format.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };
    
    reader.readAsText(file);
  });
};

const validateAndTransformData = (jsonData: any[]): EvaluationItem[] => {
  // Check if required columns exist
  const requiredColumns = ['Id', 'Questions', 'Answers', 'Answer_LLM'];
  const firstRow = jsonData[0];
  
  for (const column of requiredColumns) {
    if (!(column in firstRow)) {
      throw new Error(`Required column "${column}" is missing in the file.`);
    }
  }
  
  // Transform to our data format
  return jsonData.map(row => ({
    id: String(row.Id),
    question: String(row.Questions),
    answer: String(row.Answers),
    answer_llm: String(row.Answer_LLM),
    agriculture_consensus: row['AGRICULTURE CONSENSUS'] !== undefined ? Boolean(row['AGRICULTURE CONSENSUS']) : undefined,
    relevance: row['RELEVANCE'] !== undefined ? Number(row['RELEVANCE']) : undefined,
    factuality: row['FACTUALITY'] !== undefined ? String(row['FACTUALITY']) : undefined
  }));
};

export const exportToExcel = (items: EvaluationItem[], projectName: string) => {
  // Transform data for export
  const exportData = items.map(item => ({
    'Id': item.id,
    'Questions': item.question,
    'Answers': item.answer,
    'Answer_LLM': item.answer_llm,
    'AGRICULTURE CONSENSUS': item.agriculture_consensus,
    'RELEVANCE': item.relevance,
    'FACTUALITY': item.factuality
  }));
  
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Evaluations');
  
  // Generate filename with date
  const date = new Date().toISOString().split('T')[0];
  const fileName = `${projectName}_evaluations_${date}.xlsx`;
  
  // Save file
  XLSX.writeFile(wb, fileName);
};
