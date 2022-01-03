#!/usr/bin/env node

// lrn
//
// Command-line tool for learning by repetition.
//
// Author: Krystian Samp (samp.krystian at gmail.com)
// License: MIT
// Version: 0.01

import fs from "fs";
import path from "path";
import React, {useState, useEffect} from 'react';
import {useStdout, Text, Box, Spacer, useInput, useApp, render} from 'ink';
import chalk from "chalk";

const userInputColor = "white";
const goodAnswerColor = "green";
const badAnswerColor = "red";
const statusBarBgColor = "#303030";
const statusBarColor = "white";

export interface Card {
	  question: string;
	  answer: string;
	  goodCnt: number; // Number of times the question has been answered
                     // correctly so far.
};

interface AppParams {
    mode: "match" | "cards";
    filename: string;
    requiredGoodCnt: number;
    showStatusBar: boolean;
};

function usage() {
    console.log(`
  Learn by repetition.

  Usage
    $ lrn [OPTIONS] deck.txt


  Options

    -m match | cards     Mode of learning. In the \`match\` mode you type
                         answer to a question, which is then checked against
                         the correct answer. In the \`cards\` mode you flip
                         between question and the correct answer, and
                         decide yourself whether you knew it or not.

    -r N                 Required number of times each question must be
                         answered correctly. Default is 1.

    -s                   Show staus bar at the bottom of the screen.


  Keybindings

    C-s           Show/hide status bar. Hidden by default.
    C-c or ESC    Exit.

  Keybindings unique to \`cards\` mode:

    f             Flip the card.
    y             Accept the card as answered correctly.
    n             Accept the card as answered wrong.


  Format of a deck file:
    question1
    answer1

    question2
    answer2

    ...
`);

    process.exit(0);
}

const params = readParams();

if (params.mode === "match") {
    render(
		    <AppMatch filename={params.filename} requiredGoodCnt={params.requiredGoodCnt} showStatusBar={params.showStatusBar} />
    );
} else {
    render(
        <AppCards filename={params.filename} requiredGoodCnt={params.requiredGoodCnt} showStatusBar={params.showStatusBar} />
    );
}

////////////////////////////////////////////////////////////////////////////////
//
// App: Match
//
////////////////////////////////////////////////////////////////////////////////

type MatchStep = "question" | "good-answer" | "bad-answer" | "end";

function AppMatch(params: Omit<AppParams, "mode">) {
	  const {exit} = useApp();

    const filename = params.filename;
    const _cards = readCards(filename);
    const requiredGoodCnt = params.requiredGoodCnt;
    const { width, height } = useScreenSize();

    const [userInput, setUserInput] = useState("");
	  const [cards] = useState(_cards);
    const [step, setStep] = useState<MatchStep>("question");
	  const [card, setCard] = useState<Card | null>(getNextCard(cards, requiredGoodCnt));
    const [showStatusBar, setShowStatusBar] = useState(params.showStatusBar);

    useInput((input, key) => {
        if (key.escape) {
            exit();
        } else if (key.ctrl && input === "s") {
            setShowStatusBar(!showStatusBar);
            return;
        } else if (key.ctrl || key.upArrow || key.downArrow || key.leftArrow || key.rightArrow) {
            return;
        }

        if (step === "question") {
            useInputQuestionStep(input, key);
        } else if (step === "good-answer" || step === "bad-answer") {
            useInputAnswerStep(input, key);
        }
    });

    // Handle input during the question step
    function useInputQuestionStep(input: string, key: any) {
        if (key.return) {
            isAnswerGood() ? gotoGoodAnswerStep() : gotoBadAnswerStep();
        } else if (key.backspace || key.delete) {
            setUserInput(userInput.slice(0, userInput.length-1));
        } else {
            setUserInput(userInput + input);
        }
    }

    // Handle input during the good-answer and bad-answer steps
    function useInputAnswerStep(_input: string, key: any) {
        if (key.return) {
            hasMoreCards(cards, requiredGoodCnt) ? gotoQuestionStep() : gotoEndStep();
        }
    }

    function gotoGoodAnswerStep() {
        if (card) {
            card.goodCnt++;
        }
        setStep("good-answer");
    }

    function gotoBadAnswerStep() {
        setStep("bad-answer");
    }

    function gotoQuestionStep() {
        setUserInput("");
        setStep("question");
        setCard(getNextCard(cards, requiredGoodCnt));
    }

    function gotoEndStep() {
        setStep("end");
        process.exit(0);
    }

    function isAnswerGood() {
        return userInput.toLowerCase() === card?.answer.toLowerCase();
    }

    function renderStatusBar() {
        if (!showStatusBar) {
            return null;
        }
        const progress = getProgressString(cards, requiredGoodCnt);
        const text = ` ${progress} | ${path.basename(filename)} | C-s: Status bar | C-c (ESC): Exit`;
        let filler = "";
        const fillerCnt = width - text.length;
        if (fillerCnt > 0) {
            filler = " ".repeat(fillerCnt);
        }
        return <Box width="100%">
            <Text color={statusBarColor} backgroundColor={statusBarBgColor}>{text}</Text>
            <Text backgroundColor={statusBarBgColor}>{filler}</Text>
        </Box>;
    }

    const hint = step === "bad-answer" ? card?.answer : "";
    let answerColor = userInputColor;
    let userInputText = userInput;
    if (step === "question") {
        userInputText += chalk.inverse(" ");
    } else if (step === "bad-answer") {
        answerColor = badAnswerColor;
    } else if (step === "good-answer") {
        answerColor = goodAnswerColor;
    }
    const question = card?.question;

    // Progress shown as part of the card when status bar is hidden
    let progressElement = showStatusBar ? null : <Box alignSelf="flex-end" marginBottom={-1}><Text>{getProgressString(cards, requiredGoodCnt)}</Text></Box>;

	  return <Box flexDirection="column" alignItems="center" justifyContent="center" width={width} height={height}>
        <Spacer />

			      <Box width={60} flexDirection="column" borderStyle="single">
				        <Box paddingX={1}>
					          <Text>{question}</Text>
				        </Box>
				        <Box paddingX={1} paddingTop={1} height={2}>
					          <Text color={answerColor}>{userInputText}</Text>
				        </Box>
                {progressElement}
			      </Box>

            <Box width={60} paddingX={2} height={1}>
                <Text>{hint}</Text>
            </Box>

            <Spacer />
            {renderStatusBar()}
    </Box>
};

////////////////////////////////////////////////////////////////////////////////
//
// App: Cards
//
////////////////////////////////////////////////////////////////////////////////

type CardsStep = "card" | "end";
type CardSide = "front" | "back";

function AppCards(params: Omit<AppParams, "mode">) {
	  const {exit} = useApp();

    const filename = params.filename;
    const _cards = readCards(filename);
    const requiredGoodCnt = params.requiredGoodCnt;
    const { width, height } = useScreenSize();

	  const [cards] = useState(_cards);
	  const [card, setCard] = useState<Card | null>(getNextCard(cards, requiredGoodCnt));
    const [cardSide, setCardSide] = useState<CardSide>("front");
    const [step, setStep] = useState<CardsStep>("card");
    const [showStatusBar, setShowStatusBar] = useState(params.showStatusBar);

    useInput((input, key) => {
        if (key.escape) {
            exit();
        } else if (key.ctrl && input === "s") {
            setShowStatusBar(!showStatusBar);
            return;
        } else if (key.ctrl || key.upArrow || key.downArrow || key.leftArrow || key.rightArrow) {
            return;
        }

        if (step === "card") {
            useInputCardStep(input, key);
        }
    });

    // Handle input during the question step
    function useInputCardStep(input: string, _key: any) {
        if (input === "f") {
            setCardSide(cardSide === "front" ? "back" : "front");
            return;
        } else if (input === "y" || input === "n") {
            if (input === "y") {
                (card as Card).goodCnt++;
            }
            hasMoreCards(cards, requiredGoodCnt) ? gotoCardStep() : gotoEndStep();
            return;
        }
    }

    function gotoCardStep() {
        setStep("card");
        setCardSide("front");
        setCard(getNextCard(cards, requiredGoodCnt));
    }

    function gotoEndStep() {
        setStep("end");
        process.exit(0);
    }

    function renderStatusBar() {
        if (!showStatusBar) {
            return null;
        }
        const progress = getProgressString(cards, requiredGoodCnt);
        const text = ` ${progress} | ${path.basename(filename)} | f: Flip | y/n: Know / Don't know | C-s: Status bar | C-c (ESC): Exit`;

        let filler = "";
        const fillerCnt = width - text.length;
        if (fillerCnt > 0) {
            filler = " ".repeat(fillerCnt);
        }
        return <Box width="100%">
            <Text color={statusBarColor} backgroundColor={statusBarBgColor}>{text}</Text>
            <Text backgroundColor={statusBarBgColor}>{filler}</Text>
        </Box>;
    }

    const sideText = cardSide === "front" ? card?.question : card?.answer;

    // Progress shown as part of the card when status bar is hidden
    let progressElement = showStatusBar ? null : <Box alignSelf="flex-end" marginBottom={-1}><Text>{getProgressString(cards, requiredGoodCnt)}</Text></Box>;

	  return <Box flexDirection="column" alignItems="center" justifyContent="center" width={width} height={height}>
        <Spacer />

			  <Box width={60} flexDirection="column" borderStyle="single">
				    <Box paddingX={1}>
					      <Text>{sideText}</Text>
				    </Box>
            {progressElement}
			  </Box>

        <Spacer />
        {renderStatusBar()}
    </Box>
};

////////////////////////////////////////////////////////////////////////////////
//
// Utils
//
////////////////////////////////////////////////////////////////////////////////

function getNextCard(cards: Card[], requiredGoodCnt: number): Card | null {
		const candidateCards = getCardCandidates(cards, requiredGoodCnt);
		if (!candidateCards.length) {
			  return null;
		}
		const idx = Math.floor(Math.random() * candidateCards.length);
    const card = candidateCards[idx];
    return card ? card : null;
}

function hasMoreCards(cards: Card[], requiredGoodCnt: number): boolean {
    return !!getCardCandidates(cards, requiredGoodCnt).length;
}

function getCardCandidates(cards: Card[], requiredGoodCnt: number): Card[] {
    return cards.filter(card => card.goodCnt < requiredGoodCnt);
}

function getProgressString(cards: Card[], requiredGoodCnt: number): string {
    const cardsDoneCnt = cards.length - getCardCandidates(cards, requiredGoodCnt).length;
    return `${cardsDoneCnt}/${cards.length}`;
}

function readCards(filename: string): Card[] {
	const text = fs.readFileSync(filename, {encoding: "utf8"});
	const lines = text.split(/\n/);
	const cards: Card[] = [];

	let lastState: "separator" | "question" | "answer" = "separator";
	let question: string = "";
	let answer: string = "";
	for (let i=0; i<lines.length; i++) {
		const line = (lines[i] as string).trim();
		const emptyLine = line.length === 0;
		const lastLine = i === lines.length-1;
		if (lastState === "separator") {
			if (!emptyLine) {
				lastState = "question";
				question = line;
			} // else lastState correctly remains "separator"
		} else if (lastState === "question") {
			if (emptyLine) {
				throw new Error(`Answer should follow the question (line: ${i})`);
			} else {
				lastState = "answer";
				answer = line;
				const card: Card = {question, answer, goodCnt: 0};
				cards.push(card);
			}
		} else if (lastState === "answer") {
			if (emptyLine) {
				lastState = "separator";
			} else {
				throw new Error(`Empty line should follow question (line: ${i})`);
			}
		}

		if (lastLine && lastState === "question") {
			throw Error(`Last question doesn't have an answer`);
		}
	}

	return cards;
}

function readParams(): AppParams {
    if (process.argv.length < 3) {
        usage();
    }

    const params: AppParams = {
        filename: "",
        mode: "match",
        requiredGoodCnt: 1,
        showStatusBar: false
    };

    let i=2;
    while(i < process.argv.length) {
        const arg = process.argv[i];
        if (arg === "-m") {
            if (i+1 < process.argv.length) {
                const nextArg = process.argv[i+1];
                if (nextArg === "match" || nextArg === "cards") {
                    params.mode = nextArg;
                    i+=2;
                    continue;
                }
            }
            usage();
        }
        else if (arg === "-r") {
            if (i+1 < process.argv.length) {
                const nextArg = process.argv[i+1];
                params.requiredGoodCnt = parseInt(nextArg as string) || 1;
                i+=2;
                continue;
            }
            usage();
        }
        else if (arg === "-s") {
            params.showStatusBar = true;
            i+=1;
        }
        else {
            if (params.filename) {
                usage();
            }
            params.filename = arg as string;
            i+=1;
        }
    }

    if (params.filename === "") {
        usage();
    }

    return params;
}

// The code of `useScreenSize` hook is from https://github.com/mordv/mnswpr
// by mordv. Thank you!
interface SizeType {
    width: number;
    height: number;
}

function useScreenSize(): SizeType {
    const { stdout } = useStdout() as any;

    const [size, setSize] = useState(() => ({
        width: stdout.columns,
        height: stdout.rows,
    }));

    useEffect(() => {
        const onResize = () =>
            setSize({
                width: stdout.columns,
                height: stdout.rows,
            });

        stdout.on(`resize`, onResize);
        return () => void stdout.off(`resize`, onResize);
    }, [stdout]);

    return size;
};

/*******************************************************************************
   LICENSE:
   the MIT License (MIT)
   Copyright (c) 2022 Krystian Samp
   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:
   The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software.
   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   SOFTWARE.
   DISCLAIMER:
   This software is supplied "AS IS" without any warranties and support
 *******************************************************************************/
