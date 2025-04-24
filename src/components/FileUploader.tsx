import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpToLine, X } from "lucide-react";
import { parseExcelFile, parseCSVFile } from "@/utils/fileUtils";
import { useEvaluation } from "@/context/EvaluationContext";
import { EvaluationProject } from "@/utils/types";
import { useProgressStore } from "@/store/use-progress-store";

interface FileUploaderProps {
  onFileProcessed: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { setCurrentProject } = useEvaluation();
  const { set } = useProgressStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      // Check file type
      const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();
      if (fileExt !== "xlsx" && fileExt !== "csv") {
        toast({
          title: "Invalid file format",
          description: "Please upload an Excel (.xlsx) or CSV (.csv) file.",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);

      // Set default project name from filename
      if (!projectName) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setProjectName(nameWithoutExt);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];

      // Check file type
      const fileExt = droppedFile.name.split(".").pop()?.toLowerCase();

      console.log("File type:- ", fileExt);
      if (fileExt !== "xlsx" && fileExt !== "csv") {
        toast({
          title: "Invalid file format",
          description: "Please upload an Excel (.xlsx) or CSV (.csv) file.",
          variant: "destructive",
        });
        return;
      }

      setFile(droppedFile);

      // Set default project name from filename
      if (!projectName) {
        const nameWithoutExt = droppedFile.name.replace(/\.[^/.]+$/, "");
        setProjectName(nameWithoutExt);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!projectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for this evaluation project.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Process file based on extension
      const fileExt = file.name.split(".").pop()?.toLowerCase();

      console.log("File type:- ", fileExt);
      const items =
        fileExt === "xlsx"
          ? await parseExcelFile(file)
          : await parseCSVFile(file);

      setUploadProgress(50);

      console.log("Items: ",items);

      if (items.length === 0) {
        throw new Error("No valid data found in the file.");
      }

      // Create a new project
      const newProject: EvaluationProject = {
        id: Date.now().toString(),
        name: projectName.trim(),
        items,
        currentIndex: items.filter((item) => {
          return item.agriculture_consensus !== undefined && item.factuality !== undefined && item.relevance !== undefined;
        }).length,
        completed: items.filter(
          (item) => item.agriculture_consensus !== undefined
        ).length,
        lastUpdated: new Date(),
      };

      setUploadProgress(80);

      // Set the current project in context
      setCurrentProject(newProject);

      setUploadProgress(100);

      toast({
        title: "File uploaded successfully",
        description: `Loaded ${items.length} items for evaluation.`,
      });

      set(
        newProject.completed
          ? Math.round((newProject.completed / newProject.items.length) * 100)
          : 0
      );

      setTimeout(() => {
        setIsUploading(false);
        onFileProcessed();
      }, 1000);
    } catch (error) {

      console.log("Error: ", error)
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-app-blue">
          Upload Evaluation File
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              disabled={isUploading}
            />
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              file ? "border-app-blue bg-app-light-blue" : "border-gray-300"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {!file ? (
              <div className="space-y-2">
                <ArrowUpToLine className="mx-auto h-12 w-12 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer text-app-blue hover:underline"
                  >
                    Click to upload
                  </Label>{" "}
                  or drag and drop
                </div>
                <p className="text-xs text-gray-500">XLSX or CSV files only</p>
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-xs text-center text-gray-500">
                Processing file... {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-app-blue hover:bg-blue-700"
          onClick={handleUpload}
          disabled={!file || isUploading}
        >
          {isUploading ? "Processing..." : "Upload and Start Evaluation"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileUploader;
