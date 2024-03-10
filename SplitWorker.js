const WORD_CHARACTER_LIMIT = 30;
const SENTENCE_WORD_LIMIT = 30;
onmessage = (e) => {
  const messageList = e.data.text
    .split(/([;।?!]+)/)
    .filter(
      (line) =>
        line.search(
          /[\u0981-\u098B\u098F-\u09B9\u09BE-\u09C3\u09C7-\u09DF\u09E6-\u09EF,;।?!]+/
        ) !== -1
    );
  // console.log("message list: ", messageList);
  let sendToServer = true;

  const punctuationList = [",", "।", ";", "!", "?"];
  let newList = [];
  let j = 0;
  for (let i = 0; i < messageList.length; i++) {
    if (punctuationList.includes(messageList[i])) {
      newList[j - 1] = newList[j - 1] + messageList[i];
    } else {
      newList.push(messageList[i]);
      j += 1;
    }
  }

  const processedSentences = [];
  newList.forEach((sentence) => {
    const words = sentence.split(" "); // Split the sentence into words
    let processedSentence = "";
    let largerWords = 0;

    words.forEach((word) => {
      // check if word length is greater than alloed length
      if (word.length > WORD_CHARACTER_LIMIT) {
        const splitWords = [];
        // if word length is greater than allowed length then cut it by allowed length until last
        for (let i = 0; i < word.length; i += WORD_CHARACTER_LIMIT) {
          splitWords.push(word.substring(i, i + WORD_CHARACTER_LIMIT));
          largerWords += 1;
        }
        //  if count of words those have length more than allowed then don't send the sentences to server [ invalid ]
        if (largerWords > 3) {
          sendToServer = false;
          return;
        }
        // now push the splitWords array to the processedSentence string
        processedSentence += splitWords.join(" ");
      } else {
        processedSentence += word;
      }
      processedSentence += " ";
    });

    //  now check if the sentence's length is greater than the allowed length
    if (processedSentence.trim().split(" ").length > SENTENCE_WORD_LIMIT) {
      const splitSentences = [];
      let currentSentence = "";
      // take an empty string
      processedSentence.split(" ").forEach((word) => {
        // keep adding words of a certain sentence
        currentSentence += word + " ";
        if (currentSentence.split(" ").length > SENTENCE_WORD_LIMIT) {
          // whenever the sentence word limit reach the max limit, push those words to the splitSentences array
          splitSentences.push(currentSentence + " ");
          //  empty the currentSentence
          currentSentence = "";
        }
      });

      if (currentSentence.length > 0) {
        splitSentences.push(currentSentence + " ");
      }
      processedSentences.push(...splitSentences);
    } else {
      processedSentences.push(processedSentence.trim());
    }
  });

  postMessage({
    textList: processedSentences,
    sendToServer: sendToServer,
  });
};
