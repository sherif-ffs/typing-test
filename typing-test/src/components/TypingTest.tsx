import React, { useState, useEffect, useLayoutEffect } from "react";
import randomWords from 'random-words';

import Header from "./Header";
import Buttons from "./Buttons";
import Input from "./Input";

import './TypingTest.css';

const TypingTest = () => {
  const [words, setWords] = useState<string[]>([])
  const [wrongWords, setWrongWords] = useState<string[]>([]);
  const [rightWords, setRightWords] = useState<string[]>([])
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [testIsDone, setTestIsDone] = useState(false);
  const [wordCount, setWordCount] = useState(10);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number | null>(null);

  const inputEl = document.querySelector<HTMLInputElement>('input');

  useEffect(() => {
    const initialWords = generateWords(wordCount);
    setWords(initialWords);
  }, [wordCount])

  const generateWords = (count: number) => {
    return randomWords(count)
  }

  const handleGenerateWords = (count: number) => {
    setActiveWordIndex(0);
    setWordCount(count)
  }

  useLayoutEffect(() => {
    handleGenerateWords(10);
  }, []);


  const resetTest = () => {
    setTestIsDone(false);
    setWrongWords([])
    setRightWords([])
    setActiveWordIndex(0);
    setStartTime(null);
    setWpm(null);
    setAccuracy(null)
    handleGenerateWords(wordCount);
    let firstWord = document.querySelector<HTMLElement>('.word-0');
    if (firstWord) {
      firstWord!.style.color = '#7D5BA6';
    }
  }

  useEffect(() => {
    if (rightWords.length + wrongWords.length === words.length && words.length >= 10) {
      const endTime = new Date().getTime();
      calculate(startTime, endTime);
      resetInputField()
      setTestIsDone(true);
      Array.from(document.querySelectorAll<HTMLElement>('.word')).forEach((word) => {
        word.style.color = '#1A1B25';
      })
    }
  }, [rightWords, wrongWords]);

  const calculate = (startTime: number | null, endTime: number) => {
    let acc = (rightWords.length / words.length) * 100;
    setAccuracy(acc);
    const durationInMinutes = (endTime - startTime!) / 60000.0;
    const wpm = Number(((words.length + 1) / durationInMinutes).toFixed(2));
    setWpm(wpm);
    console.log('wpm: ', wpm)
  }

  const stylePreviousWord = (previousWord: Element | null, color: string) => {
    if (previousWord instanceof HTMLElement) {
      previousWord.style.color = color;
    } else {
      throw new Error(`element not in document`)
    }
  }

  const addToRightWords = (word: string, previousWord: Element | null) => {
    let newRightWords = [...rightWords];
    newRightWords.push(word)
    setRightWords(newRightWords);
    stylePreviousWord(previousWord, '#6FC37D');
  }

  const addToWrongWords = (word: string, previousWord: Element | null) => {
    let newWrongWords = [...wrongWords];
    newWrongWords.push(word)
    setWrongWords(newWrongWords);
    stylePreviousWord(previousWord, '#E85F5C');
  }

  const resetInputField = () => {
    inputEl!.value = '';
    inputEl!.style.backgroundColor = '#FAFAFA';
  }

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!startTime) {
      setStartTime(new Date().getTime())
    }
    const input = e.target.value;
    const activeWord = words[activeWordIndex];
    const previousWord = document.querySelector(`.word-${activeWordIndex}`);
    const currentInputIsCorrect = activeWord.indexOf(input.replace(/ /g, '')) > -1;
    if (currentInputIsCorrect) {
      inputEl!.style.backgroundColor = '#FAFAFA';
    } else {
      inputEl!.style.backgroundColor = '#DC9596';
    }
    if (input.replace(/ /g, '').length > 0 && input.charAt(input.length - 1) === ' ') {
      resetInputField();
      const inputMatchesWord = input.replace(/ /g, '') === words[activeWordIndex];

      inputMatchesWord ? addToRightWords(activeWord, previousWord) : addToWrongWords(activeWord, previousWord);

      const currentIndex = activeWordIndex;
      const nextWord = document.querySelector<HTMLElement>(`.word-${currentIndex + 1}`);
      nextWord && nextWord.style ? nextWord.style.color = '#7D5BA6' : null;
      setActiveWordIndex(currentIndex + 1);
    }
  }

  return (
    <section className="page-wrapper">
      <div className="test-wrapper">
        <Header 
          activeWord={words[activeWordIndex]} 
          {...{wpm, accuracy}}
        />
        <section className="wrapper">
          <Buttons {...{ handleGenerateWords, accuracy, wpm }} />
          <div className="wordsWrapper">
            {words.map((word: string, index: number) => {
              return (
                <p key={index} className={`word word-${index}`}>{word}</p>
              )
            })}
          </div>
          <Input {...{testIsDone, handleKeyChange, resetTest}} />
        </section>
      </div>
    </section>
  )
}

export default TypingTest;