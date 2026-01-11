"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Question = {
  id: string;
  type: "time" | "number";
  label: string;
  hint?: string;
  defaultValue?: string | number;
};

const questions: Question[] = [
  {
    id: "startTime",
    type: "time",
    label: "What time does your day start?",
    hint: "Usually this is when you arrive at the venue. (e.g. 10:30)",
  },
  {
    id: "weddingStartTime",
    type: "time",
    label: "What time is the Zaffa?",
    hint: "This is usually the main entrance or ceremony start time. (e.g. 18:00)",
  },
  {
    id: "arrival",
    type: "number",
    label: "How many minutes for Arrival to the venue?",
    defaultValue: 30,
  },
  {
    id: "hair",
    type: "number",
    label: "How many minutes for Hair Styling?",
    defaultValue: 60,
  },
  {
    id: "makeup",
    type: "number",
    label: "How many minutes for Makeup?",
    defaultValue: 105,
  },
  {
    id: "ready_pics",
    type: "number",
    label: "How many minutes for Getting Ready pictures?",
    defaultValue: 15,
  },
  {
    id: "ceremony_clothes",
    type: "number",
    label: "How many minutes for Wearing ceremony clothes?",
    defaultValue: 30,
  },
  {
    id: "first_look",
    type: "number",
    label: "How many minutes for First Look?",
    defaultValue: 15,
  },
  {
    id: "photoshoot",
    type: "number",
    label: "How many minutes for Photoshoot?",
    defaultValue: 120,
  },
  {
    id: "break",
    type: "number",
    label: "How many minutes for Bridal Team Break?",
    defaultValue: 30,
  },
  {
    id: "zaffa",
    type: "number",
    label: "How many minutes for Zaffa / Entrance duration?",
    defaultValue: 30,
  },
  {
    id: "guests_pics",
    type: "number",
    label: "How many minutes for Pictures with guests?",
    defaultValue: 30,
  },
  {
    id: "party_1",
    type: "number",
    label: "How many minutes for Party Time (Part 1)?",
    defaultValue: 90,
  },
  {
    id: "dinner",
    type: "number",
    label: "How many minutes for Dinner?",
    defaultValue: 60,
  },
  {
    id: "party_2",
    type: "number",
    label: "How many minutes for Party Time (Part 2)?",
    defaultValue: 120,
  },
];

export default function WeddingTimelinePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;

  // Initialize answer with default value if not set
  const currentAnswer =
    answers[currentQuestion.id] !== undefined
      ? answers[currentQuestion.id]
      : currentQuestion.defaultValue || "";

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentAnswer && currentAnswer !== 0) {
      // Basic validation: required
      return;
    }

    if (isLastQuestion) {
      // Submit
      const params = new URLSearchParams();
      // Add current answer to state for submission
      const finalAnswers = { ...answers, [currentQuestion.id]: currentAnswer };

      Object.entries(finalAnswers).forEach(([key, value]) => {
        params.append(key, value.toString());
      });

      router.push(`/wedding-timeline/plan?${params.toString()}`);
    } else {
      // Save and Next
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: currentAnswer }));
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleChange = (val: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-creamey flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border-2 border-pinkey/20 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-pinkey/10">
          <div
            className="h-full bg-pinkey transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h1 className="text-4xl font-display text-center mb-2 text-heading-color mt-4">
          Wedding Day
        </h1>
        <h2 className="text-2xl font-display text-center mb-8 text-pinkey italic">
          Timeline Wizard
        </h2>

        <form onSubmit={handleNext} className="space-y-6">
          <div className="space-y-3 min-h-[150px]">
            <Label
              htmlFor={currentQuestion.id}
              className="text-lg text-heading-color block mb-4"
            >
              {currentQuestion.label}
            </Label>

            <div className="relative animate-in fade-in slide-in-from-right-4 duration-300">
              <Input
                key={currentQuestion.id} // Force re-render input on step change
                id={currentQuestion.id}
                type={currentQuestion.type}
                value={currentAnswer}
                onChange={(e) => handleChange(e.target.value)}
                required
                autoFocus
                className="text-lg p-6 border-pinkey/30 focus:border-pinkey focus:ring-pinkey bg-creamey/20"
              />
            </div>

            {currentQuestion.hint && (
              <p className="text-sm text-muted-foreground text-center mt-2 animate-in fade-in duration-500">
                {currentQuestion.hint}
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 border-pinkey text-heading-color hover:bg-pinkey/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}

            <Button
              type="submit"
              className={`flex-1 bg-pinkey hover:bg-pinkey/90 text-heading-color font-bold text-lg py-6 ${
                currentStep === 0 ? "w-full" : ""
              }`}
            >
              {isLastQuestion ? "Finish & Plan" : "Next"}
              {!isLastQuestion && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Step {currentStep + 1} of {questions.length}
          </p>
        </form>
      </div>
    </div>
  );
}
