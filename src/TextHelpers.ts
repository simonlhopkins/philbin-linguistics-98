export default class TextHelpers {
  static GetTextAsKanji(fullText: string) {
    return fullText
      .split("]")
      .map((pairText) => pairText.split("["))
      .map((pairArr) => pairArr[0])
      .join("");
  }
  static GetTextAsKana(fullText: string) {
    return fullText
      .split("]")
      .map((pairText) => pairText.split("["))
      .map((pairArr) => (pairArr.length > 1 ? pairArr[1] : pairArr[0]))
      .join("");
  }
}
