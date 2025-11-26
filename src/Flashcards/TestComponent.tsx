import { useEffect, useRef } from "react";
import clsx from "clsx";
import "canvas-confetti";
import { useAppDispatch, useAppSelector } from "../Redux/hooks.ts";
import {
  Face,
  flashcardSlice,
  type TestData,
} from "../Redux/flashcardSlice.ts";
import SpeechButton from "./SpeechButton.tsx";

interface Props {
  currentTestData: TestData;
}

export default function TestComponent({ currentTestData }: Props) {
  if (currentTestData.testSteps.length == 0) {
    return <p>Length 0 test???</p>;
  }
  const { loadedCards } = useAppSelector((state) => state.flashcard);
  const dispatch = useAppDispatch();
  const currentTestStep =
    currentTestData.testSteps[currentTestData.currentStep];
  const currentFlashCardData = loadedCards.find(
    (card) => card.id == currentTestStep.cardId
  );
  const percentComplete =
    (currentTestData.currentStep + 1) / currentTestData.testSteps.length;

  //helper for whether to animate or not
  const cardIdBeforeClickRef = useRef<number | null>(null);
  //when the selection changes reset your current test
  useEffect(() => {
    dispatch(flashcardSlice.actions.SetCardAsSeen(currentTestStep.cardId));
  }, [currentTestData.currentStep]);

  return (
    <div className={"flex flex-col gap-2 items-center"}>
      <div className="flex flex-row gap-2">
        <div
          className={"inline-flex flex-col items-start gap-2 justify-center"}
        >
          {currentFlashCardData != null && (
            <div
              onClick={() => {
                console.log("flip card");
                cardIdBeforeClickRef.current = currentFlashCardData.id;
                dispatch(
                  flashcardSlice.actions.FlipCard(currentTestStep.cardId)
                );
              }}
              className={clsx(
                "window transform-3d w-80 h-48 perspective-midrange flex flex-col",
                currentTestStep.faceShowing ==
                  (currentTestData.invertFaces
                    ? Face.SOLUTION
                    : Face.QUESTION) && "rotate-y-180",
                cardIdBeforeClickRef.current &&
                  cardIdBeforeClickRef!.current == currentFlashCardData.id &&
                  "transition-transform duration-500"
              )}
            >
              <div className="window-body transform-3d flex-1">
                <div
                  className={
                    "absolute transform-3d w-full h-full align-middle text-center"
                  }
                >
                  <div
                    className={
                      "transform-3d w-full h-full flex flex-col justify-center items-center"
                    }
                  >
                    <h4 className={"backface-hidden"}>
                      {currentFlashCardData.phrase}
                    </h4>
                  </div>
                </div>
                <div className={"absolute transform-3d w-full h-full"}>
                  <div
                    className={
                      "transform-3d w-full h-full flex flex-col justify-center items-center"
                    }
                  >
                    <h4 className={"rotate-y-180 backface-hidden"}>
                      {currentFlashCardData.meaning}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="w-full flex flex-row justify-between">
            <div>
              <button
                onClick={() => {
                  dispatch(
                    flashcardSlice.actions.MarkCardAsCorrect(
                      currentTestStep.cardId
                    )
                  );
                  dispatch(flashcardSlice.actions.NextQuestion());
                }}
              >
                <img
                  src="/checkmark.png"
                  alt=""
                  className="h-4 inline-block mr-1"
                />
                correct
              </button>
              <button
                onClick={() => {
                  dispatch(
                    flashcardSlice.actions.MarkCardAsIncorrect(
                      currentTestStep.cardId
                    )
                  );
                  dispatch(flashcardSlice.actions.NextQuestion());
                }}
              >
                <img
                  src="/minus.png"
                  alt=""
                  className="h-4 inline-block mr-1"
                />
                incorrect
              </button>
            </div>
            <div>
              <button
                onClick={() => {
                  dispatch(flashcardSlice.actions.PrevQuestion());
                }}
              >
                PREV
              </button>
              {currentTestData.currentStep ==
              currentTestData.testSteps.length - 1 ? (
                <button
                  onClick={() => {
                    dispatch(flashcardSlice.actions.FinishTest());
                  }}
                >
                  FINISH
                </button>
              ) : (
                <button
                  onClick={() => {
                    dispatch(flashcardSlice.actions.NextQuestion());
                  }}
                >
                  NEXT
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              dispatch(flashcardSlice.actions.AbandonTest());
            }}
          >
            Exit
          </button>
          <SpeechButton
            onTranscription={function (transcription: string): void {
              dispatch(
                flashcardSlice.actions.SetSpokenAnswer({
                  cardNum: currentTestStep.cardId,
                  answer: transcription,
                })
              );
            }}
            currentResponse={currentTestStep.spokenAnswer}
          />
          <>
            <input
              type="checkbox"
              id="example1"
              checked={currentTestData.invertFaces}
              onChange={(e) => {
                dispatch(
                  flashcardSlice.actions.SetInvertFaces(e.target.checked)
                );
              }}
            />
            <label htmlFor="example1">Invert Faces</label>
          </>
        </div>
      </div>

      <div className="progress-indicator segmented w-full">
        <span
          className="progress-indicator-bar transition-all duration-500"
          style={{
            width: `${percentComplete * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
