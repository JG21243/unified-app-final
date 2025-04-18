"use client"

import { useState, useEffect } from "react"
import { X, ArrowRight, Check, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface TourStep {
  title: string
  description: string
  target: string
  position: "top" | "right" | "bottom" | "left"
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Legal Prompts Manager",
    description: "This quick tour will help you get familiar with the key features of the application.",
    target: "body",
    position: "top",
  },
  {
    title: "Browse Your Prompts",
    description: "View all your legal prompts in one place. You can search, filter, and sort them as needed.",
    target: "[data-tour='prompt-list']",
    position: "bottom",
  },
  {
    title: "Create New Prompts",
    description: "Click here to create a new prompt. You can use the AI assistant to help you generate prompts.",
    target: "[data-tour='create-tab']",
    position: "bottom",
  },
  {
    title: "View Analytics",
    description: "Get insights about your prompt usage and effectiveness in the Dashboard.",
    target: "[data-tour='dashboard-tab']",
    position: "bottom",
  },
  {
    title: "Collaborate with Your Team",
    description: "Share prompts and collaborate with team members in workspaces.",
    target: "[data-tour='collaborate-tab']",
    position: "bottom",
  },
]

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0 })
  const [arrowDirection, setArrowDirection] = useState<"top" | "right" | "bottom" | "left">("bottom")

  useEffect(() => {
    // Check if this is the first visit
    const hasSeenTour = localStorage.getItem("hasSeenTour")

    if (!hasSeenTour) {
      // Wait a bit for the UI to render
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const step = TOUR_STEPS[currentStep]
    const target = step.target === "body" ? document.body : document.querySelector(step.target)

    if (!target) return

    const targetRect = target.getBoundingClientRect()
    const cardWidth = 320
    const cardHeight = 200

    let top = 0
    let left = 0

    switch (step.position) {
      case "top":
        top = targetRect.top - cardHeight - 10
        left = targetRect.left + targetRect.width / 2 - cardWidth / 2
        setArrowDirection("bottom")
        setArrowPosition({
          top: cardHeight,
          left: cardWidth / 2,
        })
        break
      case "right":
        top = targetRect.top + targetRect.height / 2 - cardHeight / 2
        left = targetRect.right + 10
        setArrowDirection("left")
        setArrowPosition({
          top: cardHeight / 2,
          left: -10,
        })
        break
      case "bottom":
        top = targetRect.bottom + 10
        left = targetRect.left + targetRect.width / 2 - cardWidth / 2
        setArrowDirection("top")
        setArrowPosition({
          top: -10,
          left: cardWidth / 2,
        })
        break
      case "left":
        top = targetRect.top + targetRect.height / 2 - cardHeight / 2
        left = targetRect.left - cardWidth - 10
        setArrowDirection("right")
        setArrowPosition({
          top: cardHeight / 2,
          left: cardWidth,
        })
        break
    }

    // Ensure the card stays within viewport
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (left < 20) left = 20
    if (left + cardWidth > viewportWidth - 20) left = viewportWidth - cardWidth - 20
    if (top < 20) top = 20
    if (top + cardHeight > viewportHeight - 20) top = viewportHeight - cardHeight - 20

    setPosition({ top, left })
  }, [isOpen, currentStep])

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    setIsOpen(false)
    localStorage.setItem("hasSeenTour", "true")

    toast({
      title: "Tour completed",
      description: "You can restart the tour anytime from the help menu.",
    })
  }

  const handleSkip = () => {
    setIsOpen(false)
    localStorage.setItem("hasSeenTour", "true")
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full h-10 w-10 shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleSkip} />

      <Card
        className="fixed z-50 w-80 shadow-lg border-primary/20"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transition: "all 0.3s ease",
        }}
      >
        <div
          className={cn(
            "absolute w-3 h-3 rotate-45 bg-background border",
            arrowDirection === "top" && "border-t border-l",
            arrowDirection === "right" && "border-t border-r",
            arrowDirection === "bottom" && "border-b border-r",
            arrowDirection === "left" && "border-b border-l",
          )}
          style={{
            top: `${arrowPosition.top}px`,
            left: `${arrowPosition.left}px`,
            transform: `translate(-50%, -50%) rotate(${
              arrowDirection === "top"
                ? "45deg"
                : arrowDirection === "right"
                  ? "135deg"
                  : arrowDirection === "bottom"
                    ? "225deg"
                    : "315deg"
            })`,
          }}
        />

        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{TOUR_STEPS[currentStep].title}</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>{TOUR_STEPS[currentStep].description}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-center">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={cn("h-1.5 w-1.5 rounded-full mx-1", index === currentStep ? "bg-primary w-4" : "bg-muted")}
              />
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Skip tour
          </Button>

          <Button size="sm" onClick={handleNext} className="gap-1">
            {currentStep < TOUR_STEPS.length - 1 ? (
              <>
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Complete
                <Check className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}

