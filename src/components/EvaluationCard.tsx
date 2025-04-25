import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { EvaluationItem } from "@/utils/types";
import { useEvaluation } from "@/context/EvaluationContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProgressStore } from "@/store/use-progress-store";
import { useWordsMatchingStore } from "@/store/use-word-matching";
import { toast } from "sonner";

export default function EvaluationCard({
  handleShownResults,
}: {
  handleShownResults: () => void;
}) {
  const {
    currentItem,
    saveEvaluation,
    nextItem,
    prevItem,
    currentProject,
    setCurrentProject,
  } = useEvaluation();

  const [localItem, setLocalItem] = useState<EvaluationItem | null>(
    currentItem
  );
  const { isEnabled, set } = useWordsMatchingStore();

  const getMatchingWords = (text1: string, text2: string) => {
    // Normalize the text by splitting on Unicode letters and numbers
    const normalize = (text: string) =>
      new Set((text.match(/[\p{L}\p{N}]+/gu) || []).map(w => w.toLowerCase()));
  
    const words1 = normalize(text1);
    const words2 = normalize(text2);
  
    // Return the common words
    const common = [...words1].filter(word => words2.has(word));
    return common;
  };
  
  const highlightMatchingWords = (text: string, matchingWords: string[]) => {

    console.log("Matching words: ", matchingWords);
    // Create a regex pattern to match the words exactly and avoid partial matches
    const regex = new RegExp(`\\b(${matchingWords.join("|")})\\b`, "giu");
  
    // Split the text into parts based on the regex match
    const parts = text.split(regex);
  
    // Map over the parts and highlight the matching words
    return parts.map((part, i) =>
      matchingWords.some(word => word.toLowerCase() === part.toLowerCase()) ? (
        <mark key={i} className="bg-yellow-200">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };
  
  
  

  // Update local state when currentItem changes
  useEffect(() => {
    setLocalItem(currentItem);
  }, [currentItem]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement
      ) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === "n") {
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "p") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [localItem]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!localItem) {
    return null;
  }

  const updateField = <K extends keyof EvaluationItem>(
    field: K,
    value: EvaluationItem[K]
  ) => {
    if (!localItem) return;

    const updatedItem = localItem.isCompleted
      ? {
          ...localItem,
          isCompleted: isComplete,

          [field]: value,
        }
      : {
          ...localItem,
          [field]: value,
          isCompleted: isComplete,
        };

    setLocalItem(updatedItem);

    console.log("Updated iTEM: ", updatedItem);
    saveEvaluation(updatedItem);
  };

  const handleNext = () => {
    if(!localItem.agriculture_consensus || !localItem.relevance || !localItem.factuality) {
      toast.error("Please fill all the fields before proceeding");
      return;

    }
    nextItem();
  };

  const handlePrev = () => {
    prevItem();
  };

  const isComplete =
    localItem.agriculture_consensus !== undefined &&
    localItem.relevance !== undefined &&
    localItem.factuality !== undefined;

  useEffect(() => {
    console.log("initiated");

    if (isComplete && !localItem.isCompleted) {
      setCurrentProject({
        ...currentProject,
        completed: currentProject.items.filter((item) => {
          return (
            item.agriculture_consensus !== undefined &&
            item.relevance !== undefined &&
            item.factuality !== undefined
          );
        }).length,
        lastUpdated: new Date(),
      });
    }
  }, [localItem]);

  const matchingWords = getMatchingWords(
    localItem.answer,
    localItem.answer_llm
  );

  return (
    <Card className="w-full max-w-8xl mx-auto text-[1.3rem]">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">ID: {localItem.id}</div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isComplete
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {isComplete ? "Complete" : "Incomplete"}
          </div>
        </div>
        <CardTitle className="text-xl text-app-blue">Question</CardTitle>
        <div className="mt-2 p-3 bg-gray-50 rounded-md">
          <p className="text-gray-700 text-[1.4rem]">{localItem.question}</p>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-6">
        <div>
          <div className="flex w-full justify-between items-center mb-2 flex-wrap">
            <h3 className="text-lg font-medium text-app-teal mb-2">
              Ground Truth Answer
            </h3>

            <div className="flex items-center gap-2">
              <Label className="text-base font-medium">Words Highlighter</Label>
              <Switch
                checked={isEnabled}
                onCheckedChange={(checked) => set(checked)}
              />
            </div>
          </div>
          <div className="p-3 bg-app-light-teal rounded-md">
            <p className="text-gray-700">
              {isEnabled
                ? highlightMatchingWords(localItem.answer, matchingWords)
                : localItem.answer}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-app-blue mb-2">
            LLM Generated Answer
          </h3>
          <div className="p-3 bg-app-light-blue rounded-md">
            <p className="text-gray-700">
              {" "}
              {isEnabled
                ? highlightMatchingWords(localItem.answer_llm, matchingWords)
                : localItem.answer_llm}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 pt-4 border-t">
          {/* Agriculture Consensus */}
          <div>
            <Label className="text-base font-medium">
              Agriculture Consensus
            </Label>
            <div className="flex items-center mt-2 space-x-3">
              <Switch
                checked={!!localItem.agriculture_consensus}
                onCheckedChange={(checked) =>
                  updateField("agriculture_consensus", checked)
                }
              />
              <span>{localItem.agriculture_consensus ? "Yes" : "No"}</span>
            </div>
          </div>

          {/* Relevance */}
          <div className=" max-w-fit px-5">
            <Label className="text-base font-medium">Relevance (1-5)</Label>
            <RadioGroup
              className="flex items-center space-x-2 mt-2"
              value={localItem?.relevance?.charAt(0) || ""}
              onValueChange={(value) => {
                switch (value) {
                  case "1":
                    value = "1 (Irrelevant)";
                    break;
                  case "2":
                    value = "2 (Low Relevance)";
                    break;
                  case "3":
                    value = "3 (Moderate Relevance)";
                    break;
                  case "4":
                    value = "4 (High Relevance)";
                    break;
                  case "5":
                    value = "5 (Accurate Relevance)";
                    break;
                  default:
                    value = "1 (Irrelevant)";
                }
                console.log("Relevance value: ", value);
                updateField("relevance", value);
              }}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex flex-col items-center">
                  <RadioGroupItem
                    value={num.toString()}
                    id={`relevance-${num}`}
                  />
                  <Label htmlFor={`relevance-${num}`} className="text-xs mt-1">
                    {num}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Not relevant</span>
              <span>Very relevant</span>
            </div>
          </div>

          {/* Factuality */}
          <div>
            <Label className="text-base font-medium">Factuality</Label>
            <RadioGroup
              className="space-y-1 mt-2"
              value={localItem.factuality || ""}
              onValueChange={(value) =>
                updateField("factuality", value as EvaluationItem["factuality"])
              }
            >
              {["Correct", "Partially Correct", "Incorrect"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.toUpperCase()}
                    id={`factuality-${option}`}
                  />
                  <Label htmlFor={`factuality-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous (←)</span>
        </Button>

        {currentProject.currentIndex < currentProject.items.length - 1 ? (
          <Button
            onClick={handleNext}
            className="flex items-center space-x-1 bg-app-blue hover:bg-blue-700"
          >
            <span>Next (→)</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleShownResults}
            className="flex items-center space-x-1 bg-app-blue hover:bg-blue-700"
          >
            <span>Export Results</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// export default EvaluationCard;
