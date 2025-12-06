import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { SetHelpers } from "../SetHelpers";
import type { FlashCardData } from "../Flashcards/Flashcards";
import { shuffle } from "../ArrayHelpers";
import DailyChallengeUtil from "./DailyChallengeUtil";
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
      const loadedCardIds = action.payload.map((loadedCard) => loadedCard.id);
      state.selectedCards = state.selectedCards.filter((cardId) =>
        loadedCardIds.includes(cardId)
      );
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
    SelectDaily: (state) => {
      const newCards = DailyChallengeUtil.GetDailyChallenge(state.loadedCards);
      state.selectedCards = Array.from(
        SetHelpers.union(new Set(), new Set(newCards.map((card) => card.id)))
      );
    },
    SetTestToCurrentlySelectedCardsAndStart: (state) => {
      const testSteps: TestStep[] = state.selectedCards
        .filter(
          (cardId) => state.loadedCards.map((card) => card.id).includes(cardId) //bug where if you delete a card, it will never leave your selection
        )
        .map((cardId) => ({
          cardId,
          spokenAnswer: null,
          writtenAnswer: null,
          alreadySeen: false,
          faceData: {
            face: Face.JAPANESE_TEXT,
            animation: CardFlipAnimation.NONE,
          },
          responseStatus: ResponseStatus.UNKNOWN,
        }));

      state.currentTestData = {
        currentStep: 0,
        testSteps: shuffle(testSteps),
        status: TestStatus.PROGRESS,
        invertFaces: false,
        showKanji: false,
      };
    },

    SetCardAsSeen: (state, action: PayloadAction<number>) => {
      const seenCardId = action.payload;
      console.log("set card as seen");
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
                  faceData: {
                    face:
                      newStep == state.currentTestData!.testSteps.length - 1
                        ? step.faceData.face
                        : Face.JAPANESE_TEXT,
                    animation: CardFlipAnimation.NONE,
                  },
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
                  faceData: {
                    face: Face.JAPANESE_TEXT,
                    animation: CardFlipAnimation.NONE,
                  },
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
                  faceData: {
                    face: step.faceData.face ^ 1,
                    animation: CardFlipAnimation.FLIP,
                  },
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
              faceData: {
                face: Face.JAPANESE_TEXT,
                animation: CardFlipAnimation.NONE,
              },
              alreadySeen: false,
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
        state.currentTestData = {
          ...state.currentTestData,
          invertFaces: action.payload,
          testSteps: state.currentTestData.testSteps.map((step, i) =>
            i == state.currentTestData?.currentStep
              ? {
                  ...step,
                  faceData: {
                    ...step.faceData,
                    animation: CardFlipAnimation.FLIP,
                  },
                }
              : step
          ),
        };
      }
    },
    SetShowKanji(state, action: PayloadAction<boolean>) {
      if (state.currentTestData) {
        state.currentTestData = {
          ...state.currentTestData,
          showKanji: action.payload,
        };
      }
    },
  },
});

export interface TestStep {
  cardId: number;
  spokenAnswer: null | string;
  writtenAnswer: null | string;
  alreadySeen: boolean;
  faceData: FaceData;
  responseStatus: ResponseStatus;
}

export interface TestData {
  currentStep: number;
  testSteps: TestStep[];
  status: TestStatus;
  invertFaces: boolean;
  showKanji: boolean;
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
  JAPANESE_TEXT = 0,
  ENGLISH_TEXT = 1,
}
export enum CardFlipAnimation {
  NONE,
  FLIP,
}
export interface FaceData {
  face: Face;
  animation: CardFlipAnimation;
}

export default flashcardSlice.reducer;
