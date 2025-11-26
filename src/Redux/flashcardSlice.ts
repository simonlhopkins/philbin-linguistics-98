import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { SetHelpers } from "../SetHelpers";
import type { FlashCardData } from "../Flashcards/Flashcards";
import { shuffle } from "../ArrayHelpers";
export const flashcardSlice = createSlice({
  name: "counter",
  initialState: {
    currentTestData: null as null | TestData,
    loadedCards: [] as FlashCardData[],
    selectedCards: [] as number[],
  },
  reducers: {
    SetLoadedCards: (state, action: PayloadAction<FlashCardData[]>) => {
      state.loadedCards = action.payload;
    },
    AddCardToSelection: (state, action: PayloadAction<number>) => {
      state.selectedCards = Array.from(
        SetHelpers.union(
          new Set(state.selectedCards),
          new Set([action.payload])
        )
      );
    },
    RemoveCardFromSelection: (state, action: PayloadAction<number>) => {
      state.selectedCards = Array.from(
        SetHelpers.difference(
          new Set(state.selectedCards),
          new Set([action.payload])
        )
      );
    },
    ClearSelection: (state) => {
      state.selectedCards = [];
    },
    SelectAll: (state) => {
      state.selectedCards = Array.from(
        new Set(state.loadedCards.map((card) => card.id))
      );
    },
    SetTestToCurrentlySelectedCards: (state) => {
      const testSteps: TestStep[] = state.selectedCards.map((cardId) => ({
        cardId,
        spokenAnswer: null,
        writtenAnswer: null,
        alreadySeen: false,
        faceShowing: Face.QUESTION,
        responseStatus: ResponseStatus.UNKNOWN,
      }));

      state.currentTestData = {
        currentStep: 0,
        testSteps: shuffle(testSteps),
        status: TestStatus.PROGRESS,
        invertFaces: false,
      };
    },

    SetCardAsSeen: (state, action: PayloadAction<number>) => {
      const seenCardId = action.payload;
      if (state.currentTestData) {
        state.currentTestData = {
          ...state.currentTestData,
          testSteps: state.currentTestData.testSteps.map((step) =>
            step.cardId == seenCardId
              ? {
                  ...step,
                  alreadySeen: true,
                }
              : step
          ),
        };
      }
    },
    NextQuestion: (state) => {
      if (state.currentTestData) {
        const newStep = Math.min(
          state.currentTestData.currentStep + 1,
          state.currentTestData.testSteps.length - 1
        );
        state.currentTestData = {
          ...state.currentTestData,
          currentStep: newStep,
          testSteps: state.currentTestData.testSteps.map((step, i) =>
            i == newStep
              ? {
                  ...step,
                  faceShowing:
                    newStep == state.currentTestData!.testSteps.length - 1
                      ? step.faceShowing
                      : Face.QUESTION,
                }
              : step
          ),
        };
      }
    },
    PrevQuestion: (state) => {
      if (state.currentTestData) {
        const newStep = Math.max(0, state.currentTestData.currentStep - 1);

        state.currentTestData = {
          ...state.currentTestData,
          currentStep: newStep,
          testSteps: state.currentTestData.testSteps.map((step, i) =>
            i == newStep
              ? {
                  ...step,
                  faceShowing: Face.QUESTION,
                }
              : step
          ),
        };
      }
    },
    FlipCard: (state, action: PayloadAction<number>) => {
      const flipCardId = action.payload;
      if (state.currentTestData) {
        state.currentTestData = {
          ...state.currentTestData,
          testSteps: state.currentTestData.testSteps.map((step) =>
            step.cardId == flipCardId
              ? {
                  ...step,
                  faceShowing: step.faceShowing ^ 1,
                }
              : step
          ),
        };
      }
    },
    MarkCardAsCorrect: (state, action: PayloadAction<number>) => {
      const correctCard = action.payload;
      if (state.currentTestData) {
        state.currentTestData = {
          ...state.currentTestData,
          testSteps: state.currentTestData.testSteps.map((step) =>
            step.cardId == correctCard
              ? {
                  ...step,
                  responseStatus: ResponseStatus.CORRECT,
                }
              : step
          ),
        };
      }
    },
    MarkCardAsIncorrect: (state, action: PayloadAction<number>) => {
      const correctCard = action.payload;
      if (state.currentTestData) {
        state.currentTestData = {
          ...state.currentTestData,
          testSteps: state.currentTestData.testSteps.map((step) =>
            step.cardId == correctCard
              ? {
                  ...step,
                  responseStatus: ResponseStatus.INCORRECT,
                }
              : step
          ),
        };
      }
    },
    SetSpokenAnswer: (
      state,
      action: PayloadAction<{ cardNum: number; answer: string }>
    ) => {
      if (state.currentTestData) {
        state.currentTestData = {
          ...state.currentTestData,
          testSteps: state.currentTestData.testSteps.map((step) =>
            step.cardId == action.payload.cardNum
              ? {
                  ...step,
                  spokenAnswer: action.payload.answer,
                }
              : step
          ),
        };
      }
    },

    AbandonTest: (state) => {
      if (state.currentTestData) {
        state.currentTestData = {
          ...state.currentTestData,
          status: TestStatus.ABANDONED,
        };
      }
    },
    ResumeTest: (state) => {
      if (state.currentTestData) {
        state.currentTestData = {
          ...state.currentTestData,
          status: TestStatus.PROGRESS,
        };
      }
    },
    FinishTest: (state) => {
      if (state.currentTestData) {
        state.currentTestData = {
          ...state.currentTestData,
          status: TestStatus.FINISHED,
        };
      }
    },
    RestartCurrentTest: (state) => {
      if (state.currentTestData) {
        state.currentTestData = {
          ...state.currentTestData,
          currentStep: 0,
          testSteps: shuffle(
            state.currentTestData.testSteps.map((step) => ({
              ...step,
              alreadySeen: false,
              faceShowing: Face.QUESTION,
              responseStatus: ResponseStatus.UNKNOWN,
              spokenAnswer: null,
              writtenAnswer: null,
            }))
          ),
          status: TestStatus.PROGRESS,
        };
      }
    },
    RestartCurrentTestWithOnlyIncorrect: (state) => {
      if (state.currentTestData) {
        const newTestSteps = state.currentTestData.testSteps
          .filter((step) => step.responseStatus == ResponseStatus.INCORRECT)
          .map((step) => ({
            ...step,
            alreadySeen: false,
            faceShowing: Face.QUESTION,
            responseStatus: ResponseStatus.UNKNOWN,
            spokenAnswer: null,
            writtenAnswer: null,
          }));
        state.currentTestData = {
          ...state.currentTestData,
          currentStep: 0,
          testSteps: shuffle(newTestSteps),
          status: TestStatus.PROGRESS,
        };
      }
    },
    ExitTest: (state) => {
      state.currentTestData = null;
    },
    SetInvertFaces(state, action: PayloadAction<boolean>) {
      if (state.currentTestData) {
        state.currentTestData.invertFaces = action.payload;
      }
    },
  },
});

export interface TestStep {
  cardId: number;
  spokenAnswer: null | string;
  writtenAnswer: null | string;
  alreadySeen: boolean;
  faceShowing: Face;
  responseStatus: ResponseStatus;
}

export interface TestData {
  currentStep: number;
  testSteps: TestStep[];
  status: TestStatus;
  invertFaces: boolean;
}

export enum TestStatus {
  PROGRESS,
  FINISHED,
  ABANDONED,
}
export enum ResponseStatus {
  UNKNOWN = 0,
  CORRECT = 1,
  INCORRECT = 2,
}
export enum Face {
  QUESTION = 0,
  SOLUTION = 1,
}

export default flashcardSlice.reducer;
