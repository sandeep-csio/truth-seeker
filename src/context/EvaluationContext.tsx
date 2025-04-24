import React, { createContext, useContext, useState, useEffect } from "react";
import { EvaluationItem, EvaluationProject } from "@/utils/types";
import { toast } from "@/hooks/use-toast";
import { useProgressStore } from "@/store/use-progress-store";

interface EvaluationContextType {
  currentProject: EvaluationProject | null;
  setCurrentProject: (project: EvaluationProject) => void;
  currentItem: EvaluationItem | null;
  saveEvaluation: (item: EvaluationItem) => void;
  nextItem: () => void;
  prevItem: () => void;
  progress: number;
  resetProject: () => void;
  getAllItems: () => EvaluationItem[];
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(
  undefined
);

export const EvaluationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentProject, setCurrentProject] =
    useState<EvaluationProject | null>(null);
  const { set } = useProgressStore();

  // Try to load from localStorage on initial mount
  useEffect(() => {
    const savedProject = localStorage.getItem("evaluation_project");
    if (savedProject) {
      try {
        const parsed = JSON.parse(savedProject);
        parsed.lastUpdated = new Date(parsed.lastUpdated);
        setCurrentProject(parsed);
        toast({
          title: "Project loaded",
          description: `Resumed project "${parsed.name}" with ${parsed.completed}/${parsed.items.length} evaluations completed.`,
        });
      } catch (e) {
        console.error("Failed to load saved project", e);
      }
    }
  }, []);

  // Save to localStorage whenever the project changes
  useEffect(() => {
    if (currentProject) {
      localStorage.setItem(
        "evaluation_project",
        JSON.stringify(currentProject)
      );
    }
  }, [currentProject]);

  const currentItem =
    currentProject?.items[currentProject?.currentIndex] || null;

  let progress = currentProject
    ? Math.round((currentProject.completed / currentProject.items.length) * 100)
    : 0;
  // set(progress);

  const saveEvaluation = (item: EvaluationItem) => {
    if (!currentProject) return;

    console.log(" Saving evaluation for item:", item);

    const updatedItems = [...currentProject.items];
    updatedItems[currentProject.currentIndex] = item;

    // Check if this item was previously unevaluated
    const wasEvaluated =
      !!currentProject.items[currentProject.currentIndex]
        .agriculture_consensus !== undefined;
    const isNowEvaluated = !!item.agriculture_consensus !== undefined;

    const newCompletedCount = wasEvaluated
      ? currentProject.completed
      : isNowEvaluated
      ? currentProject.completed + 1
      : currentProject.completed;

    setCurrentProject({
      ...currentProject,
      items: updatedItems,
      completed: newCompletedCount,
      lastUpdated: new Date(),
    });

    toast({
      title: "Evaluation saved",
      description: "Your evaluation has been saved automatically.",
      variant: "default",
    });
  };

  const nextItem = () => {
    if (
      !currentProject ||
      currentProject.currentIndex >= currentProject.items.length - 1
    )
      return;

    setCurrentProject({
      ...currentProject,
      currentIndex: currentProject.currentIndex + 1,
      lastUpdated: new Date(),
    });
  };

  const prevItem = () => {
    if (!currentProject || currentProject.currentIndex <= 0) return;

    setCurrentProject({
      ...currentProject,
      currentIndex: currentProject.currentIndex - 1,
      lastUpdated: new Date(),
    });
  };

  const resetProject = () => {
    localStorage.removeItem("evaluation_project");
    setCurrentProject(null);
  };

  const getAllItems = () => {
    return currentProject?.items || [];
  };

  return (
    <EvaluationContext.Provider
      value={{
        currentProject,
        setCurrentProject,
        currentItem,
        saveEvaluation,
        nextItem,
        prevItem,
        progress,
        resetProject,
        getAllItems,
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluation = () => {
  const context = useContext(EvaluationContext);
  if (context === undefined) {
    throw new Error("useEvaluation must be used within an EvaluationProvider");
  }
  return context;
};
