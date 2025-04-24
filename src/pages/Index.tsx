import React, { useState } from "react";
import { EvaluationProvider } from "@/context/EvaluationContext";
import FileUploader from "@/components/FileUploader";
import EvaluationCard from "@/components/EvaluationCard";
import ResultsExport from "@/components/ResultsExport";
import ProgressBar from "@/components/ProgressBar";
import { useEvaluation } from "@/context/EvaluationContext";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/store/use-progress-store";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
  UserButton,
} from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Download, Mail } from "lucide-react";
import { exportToExcel } from "@/utils/fileUtils";

const MainContent = () => {
  const [view, setView] = useState<"upload" | "evaluate" | "export">("upload");
  const { currentProject, resetProject, getAllItems } = useEvaluation();
  const navigate = useNavigate();

  const auth = useAuth();

  const handleExport = () => {
    const items = getAllItems();
    exportToExcel(items, currentProject.name);
  };

  React.useEffect(() => {
    // If there's a current project loaded, go to evaluation view
    if (currentProject && view === "upload") {
      setView("evaluate");
    }
  }, [currentProject]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileProcessed = () => {
    setView("evaluate");
  };

  const handleShowResults = () => {
    setView("export");
  };

  const handleReset = () => {
    resetProject();
    setView("upload");
  };

  if (!auth.isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <img
              src="/logo1.svg"
              alt="Logo"
              className=" w-20 h-20 rounded-lg mb-3"
            />
          </div>

          <h1 className="text-4xl font-bold text-gray-900">
            Truth Seeker
            <span className="text-app-blue"> AI Review</span>
          </h1>
          <p className="text-gray-500 mt-2">
            Efficiently evaluate LLM-generated responses
          </p>
        </div>

        <div className="flex flex-row-reverse gap-3">
          <Button>
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
            <Mail />
          </Button>

          <Button variant="outline">
            Learn More <ChevronRight />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 min-h-screen flex flex-col">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Truth Seeker
          <span className="text-app-blue"> AI Review</span>
        </h1>
        <p className="text-gray-500 mt-2">
          Efficiently evaluate LLM-generated responses
        </p>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {view === "upload" && (
          <FileUploader onFileProcessed={handleFileProcessed} />
        )}

        {view === "evaluate" && currentProject && (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">{currentProject.name}</h2>
                <div className="flex gap-1 flex-row max-w-fit  pl-5">
                  <Button variant="ghost" className=" hover:bg-transparent">
                    <SignedIn>
                      <UserButton />
                    </SignedIn>
                  </Button>
                  <Button variant="outline" onClick={handleShowResults}>
                    View Results <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="default" onClick={handleExport}>
                    Save <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2">
                <ProgressBar
                  current={currentProject.completed}
                  total={currentProject.items.length}
                />
              </div>
            </div>
            <EvaluationCard handleShownResults={handleShowResults} />
            <div className="mt-4 text-center text-sm text-gray-500">
              Use arrow keys or mouse to navigate between items
            </div>
          </>
        )}

        {view === "export" && <ResultsExport onReset={handleReset} />}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>© 2025 Truth Seeker AI Review. All rights reserved.</p>
      </footer>
    </div>
  );
};

const Index = () => {
  return (
    <EvaluationProvider>
      <MainContent />
    </EvaluationProvider>
  );
};

export default Index;
