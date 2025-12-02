export default class TextHelpers {
  static GetTextAsKanji(fullText: string) {
    return TextHelpers.SplitAll(fullText)
      .map((pair) => pair[0])
      .join("");
  }
  static GetTextAsKana(fullText: string) {
    return TextHelpers.SplitAll(fullText)
      .map((pair) => (pair.length > 1 ? pair[1] : pair[0]))
      .join("");
  }

  //fuck chat gpt I am able to do this myself
  static SplitAll(text: string): string[][] {
    const kanjiSections = text.split("]");
    const kanjiPairs = kanjiSections.map((section) => {
      const indexOfFirstKanji = section
        .split("")
        .findIndex((char) => TextHelpers.isKanji(char));
      if (indexOfFirstKanji >= 0) {
        //there is a kanji in the section
        const firstPart = section.substring(0, indexOfFirstKanji);
        const secondPart = section.substring(indexOfFirstKanji).split("[");
        return [[firstPart], secondPart];
      } else {
        return [[section]];
      }
    });
    return kanjiPairs.flat(1);
  }

  static isKanji(char: string): boolean {
    if (!char) return false;
    const code = char.charCodeAt(0);
    return (
      (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
      (code >= 0x3400 && code <= 0x4dbf) || // CJK Unified Ideographs Extension A
      (code >= 0x20000 && code <= 0x2a6df) || // Extension B
      (code >= 0x2a700 && code <= 0x2b73f) || // Extension C
      (code >= 0x2b740 && code <= 0x2b81f) || // Extension D
      (code >= 0x2b820 && code <= 0x2ceaf) || // Extension E~F
      (code >= 0xf900 && code <= 0xfaff) // CJK Compatibility Ideographs
    );
  }
}
