import "canvas-confetti";
import clsx from "clsx";
import React, { useEffect, useRef, type ReactNode } from "react";
import {
  Face,
  flashcardSlice,
  ResponseStatus,
  type TestData,
} from "../../Redux/flashcardSlice.ts";
import { useAppDispatch, useAppSelector } from "../../Redux/hooks.ts";
import TextHelpers from "../../TextHelpers.ts";
import MissingCardText from "./MissingCardText.tsx";
import SpeechButton from "./SpeechButton.tsx";
import OpenAIClient from "./OpenAIClient.ts";
import { toast } from "sonner";
import IndexedDBClient from "../../IndexedDBClient.ts";
import VocalizeButton from "./VocalizeButton.tsx";

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
    <div className={"flex flex-col gap-2"}>
      <div className="flex flex-row gap-2 flex-wrap max-w-full">
        <div
          className={
            "flex flex-col min-w-full sm:min-w-90 max-w-full gap-2 flex-1"
          }
        >
          <div
            onClick={() => {
              dispatch(flashcardSlice.actions.FlipCard(currentTestStep.cardId));
            }}
            className={clsx(
              "window transform-3d w-full aspect-video max-w-full perspective-midrange flex flex-col",
              currentTestStep.faceShowing ==
                (currentTestData.invertFaces
                  ? Face.ENGLISH_TEXT
                  : Face.JAPANESE_TEXT) && "rotate-y-180",
              cardIdBeforeClickRef.current == currentTestStep.cardId &&
                "transition-transform duration-500"
            )}
          >
            <div
              className={clsx(
                "window-body transform-3d flex-1",
                currentTestStep.responseStatus == ResponseStatus.CORRECT &&
                  "text-green-600",
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
                  <h2 className={"backface-hidden"}>
                    {currentFlashCardData ? (
                      currentTestData.showKanji ? (
                        GetFurigana(currentFlashCardData.japaneseText)
                      ) : (
                        TextHelpers.GetTextAsKana(
                          currentFlashCardData.japaneseText
                        )
                      )
                    ) : (
                      <MissingCardText cardId={currentTestStep.cardId} />
                    )}
                  </h2>
                </div>
              </div>
              <div className={"absolute transform-3d w-full h-full"}>
                <div
                  className={
                    "transform-3d w-full h-full flex flex-col justify-center items-center"
                  }
                >
                  <h2 className={"rotate-y-180 backface-hidden"}>
                    {currentFlashCardData ? (
                      currentFlashCardData.meaning
                    ) : (
                      <MissingCardText cardId={currentTestStep.cardId} />
                    )}
                  </h2>
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
          {currentFlashCardData && (
            <VocalizeButton japaneseText={currentFlashCardData.japaneseText} />
          )}
          <button
            onClick={() => {
              if (currentFlashCardData) {
                navigator.clipboard.writeText(
                  TextHelpers.GetTextAsKanji(currentFlashCardData.japaneseText)
                );
              }
              toast.custom(
                (id) => (
                  <div className="window w-64">
                    <div className="title-bar">
                      <div className="title-bar-text">Message</div>
                      <div className="title-bar-controls">
                        <button
                          onClick={() => {
                            toast.dismiss(id);
                          }}
                          aria-label="Close"
                        ></button>
                      </div>
                    </div>
                    <div className="window-body">
                      <p>
                        {`${TextHelpers.GetTextAsKanji(
                          currentFlashCardData!.japaneseText
                        )} Copied to clipboard`}
                      </p>
                    </div>
                  </div>
                ),
                {
                  closeButton: true,
                }
              );
            }}
          >
            Copy Japanese Text to clipboard
          </button>
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

function GetFurigana(fullText: string): ReactNode {
  return (
    <ruby>
      {TextHelpers.SplitAll(fullText).map((pairArr, i) => (
        <React.Fragment key={pairArr[0] + i}>
          {pairArr[0]}
          {pairArr.length > 0 && <rt>{pairArr[1]}</rt>}
        </React.Fragment>
      ))}
    </ruby>
  );
}
