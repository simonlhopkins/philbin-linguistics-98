import { useEffect, useRef } from "react";
import clsx from "clsx";
import "canvas-confetti";
import { useAppDispatch, useAppSelector } from "../../Redux/hooks.ts";
import {
  Face,
  flashcardSlice,
  ResponseStatus,
  type TestData,
} from "../../Redux/flashcardSlice.ts";
import SpeechButton from "./SpeechButton.tsx";
import MissingCardText from "./MissingCardText.tsx";
import {
  GetPhraseFromFlashCardData,
  type FlashCardData,
} from "../Flashcards.tsx";

interface Props {
  currentTestData: TestData;
}

export default function TestComponent({ currentTestData }: Props) {
  const { loadedCards } = useAppSelector((state) => state.flashcard);
  const dispatch = useAppDispatch();
  if (currentTestData.testSteps.length == 0) {
    return (
      <p>
        Length 0 test???{" "}
        <button
          onClick={() => {
            dispatch(flashcardSlice.actions.ExitTest());
          }}
        >
          Exit Test
        </button>
      </p>
    );
  }
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
    cardIdBeforeClickRef.current = currentTestStep.cardId;
  }, [currentTestData.currentStep]);

  return (
    <div className={"flex flex-col gap-2 items-center"}>
      <div className="flex flex-row gap-2 flex-wrap max-w-full">
        <div
          className={
            "inline-flex flex-col items-start max-w-full gap-2 justify-center"
          }
        >
          <div
            onClick={() => {
              console.log("flip card");
              dispatch(flashcardSlice.actions.FlipCard(currentTestStep.cardId));
            }}
            className={clsx(
              "window transform-3d w-96 aspect-video max-w-full perspective-midrange flex flex-col",
              currentTestStep.faceShowing ==
                (currentTestData.invertFaces ? Face.SOLUTION : Face.QUESTION) &&
                "rotate-y-180",
              cardIdBeforeClickRef.current == currentTestStep.cardId &&
                "transition-transform duration-500"
            )}
          >
            <div
              className={clsx(
                "window-body transform-3d flex-1",
                currentTestStep.responseStatus == ResponseStatus.CORRECT &&
                  "text-green-500",
                currentTestStep.responseStatus == ResponseStatus.INCORRECT &&
                  "text-red-500"
              )}
            >
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
                    {currentFlashCardData ? (
                      currentTestData.showKanji ? (
                        GetPhraseFromFlashCardData(currentFlashCardData)
                      ) : (
                        currentFlashCardData.kana
                      )
                    ) : (
                      <MissingCardText cardId={currentTestStep.cardId} />
                    )}
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
                    {currentFlashCardData ? (
                      currentFlashCardData.meaning
                    ) : (
                      <MissingCardText cardId={currentTestStep.cardId} />
                    )}
                  </h4>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-row justify-between">
            <div>
              <button
                disabled={currentFlashCardData == null}
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
                  className="h-3 inline-block mr-1"
                />
                correct
              </button>
              <button
                disabled={currentFlashCardData == null}
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
                  className="h-3 inline-block mr-1"
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
            Abandon Test
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
            disabled={currentFlashCardData == null}
          />
          <div>
            <input
              type="checkbox"
              id="invertFaces"
              checked={currentTestData.invertFaces}
              onChange={(e) => {
                dispatch(
                  flashcardSlice.actions.SetInvertFaces(e.target.checked)
                );
              }}
            />
            <label htmlFor="invertFaces">Invert Faces</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="showKanji"
              checked={currentTestData.showKanji}
              onChange={(e) => {
                dispatch(flashcardSlice.actions.SetShowKanji(e.target.checked));
              }}
            />
            <label htmlFor="showKanji">Show Kanji</label>
          </div>
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
