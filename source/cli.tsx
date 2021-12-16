#!/usr/bin/env node

import fs from "fs";
import path from "path";
import React, {useState} from 'react';
import {Text, Box, Spacer, useInput, useApp, render} from 'ink';
import chalk from "chalk";
import { useScreenSize } from './hooks/useScreenSize';

function usage() {
    const script = path.basename(__filename);

    console.log(`
  Usage
    $ ${script} [OPTIONS] file.txt


  Options

    -m match | cards     Mode of learning. In the \`match\` mode you type in
                         answer to a question. In the \`cards\` mode you flip
                         between question and the correct answer, and
                         decide yourself whether you knew it or not.

                         As an example, \`match\` is good for learning foreign
                         words, while \`cards\` is good for learning definitions
                         and more complex concepts.

    -r N                 Required number of times a question must be
                         answered correctly. Default: 1.


  Keybindings

    C-s           Show/hide status bar. Hidden by default.
    C-c or ESC    Exit.

  Keybindings unique to \`cards\` mode:

    TAB or f    Flip the card.
    y           Accept the card as answered correctly.
    n           Accept the card as answered in


  The format of the file with questions is as follows:
    question1
    answer1

    question2
    answer2

    ...

  Author
    Krystian Samp (samp.krystian@gmail.com)
`);

    process.exit(0);
}


const params = readParams();
console.log(params);
process.exit();

const filename = process.argv[2] as string;
const cards = readCards(filename);

if (params.mode === "match") {
    render(
		    <AppMatch filename={params.filename} cards={cards} requiredGoodCnt={params.requiredGoodCnt} showStatusBar={false} />
    );
} else {
    render(
        <AppCards filename={params.filename} cards={cards} requiredGoodCnt={params.requiredGoodCnt} showStatusBar={false} />
    );
}

////////////////////////////////////////////////////////////////////////////////
//
// App: Match
//
////////////////////////////////////////////////////////////////////////////////

type Step = "question" | "good-answer" | "bad-answer" | "end";

export interface Card {
	  question: string;
	  answer: string;
	  goodCnt: number;
};

interface AppParams {
    filename: string;
    cards: Card[];
    requiredGoodCnt: number;
    showStatusBar: boolean;
};

function AppMatch(params: AppParams) {
	  const {exit} = useApp();

    const filename = params.filename;
    const requiredGoodCnt = params.requiredGoodCnt;
    const { width, height } = useScreenSize();

    const [userInput, setUserInput] = useState("");
	  const [cards] = useState(params.cards);
    const [step, setStep] = useState<Step>("question");
	  const [card, setCard] = useState<Card | null>(getNextCard());
    const [showStatusBar, setShowStatusBar] = useState(params.showStatusBar);
	  /* const [progress, setProgress] = useState({cardCnt: cards.length, answeredCnt: 0}); */

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
            hasMoreCards() ? gotoQuestionStep() : gotoEndStep();
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
        setCard(getNextCard());
        setUserInput("");
        setStep("question");
    }

    function gotoEndStep() {
        setStep("end");
    }

    function getNextCard(): Card | null {
		    const candidateCards = getCardCandidates();
		    if (!candidateCards.length) {
			      return null;
		    }
		    const idx = Math.floor(Math.random() * candidateCards.length);
        const card = candidateCards[idx];
        return card ? card : null;
	  }

    function hasMoreCards() {
        return !!getCardCandidates().length;
    }

    function isAnswerGood() {
        return userInput.toLowerCase() === card?.answer.toLowerCase();
    }

    function getCardCandidates() {
        return cards.filter(card => card.goodCnt < requiredGoodCnt);
    }

    const hint = step === "bad-answer" ? card?.answer : "";
    let userInputColor = "white";
    let userInputText = userInput;
    if (step === "question") {
        userInputText += chalk.inverse(" ");
    } else if (step === "bad-answer") {
        userInputColor = "red";
    } else if (step === "good-answer") {
        userInputColor = "green";
    }
    //const question = card?.question;
    const question = "skdjflsd jflkjdslk jadlkfj ladjf ldhafk jdhaskf haldf kadjhf kjasdhf kdajshf kjdahsflkj hdaslkfj hdalkjfh lkdasjhf lkjdashf kljdahsflk jhadslkjfh asdljfh daskjfh kdsjahf kjdshfjhdfkh dkfh dskjhf jdshf jkdhsfjk hds jh jhfdkj hfjkdh fjdhk jfhdskjf h";

    const cardsDoneCnt = cards.length - getCardCandidates().length;
    const progress = `${cardsDoneCnt}/${cards.length}`;

	  /* return <Box justifyContent="center" width={width} height={height}>
		   <Box justifyContent="center" flexBasis={60} minWidth={20} flexDirection="column">
			 <Box flexDirection="column" borderStyle="single">
			 <Box paddingX={1}>
			 <Text>{question}</Text>
			 </Box>
			 <Box paddingX={1} paddingTop={1} height={2}>
			 <Text color={userInputColor}>{userInputText}</Text>
			 </Box>
     *             <Box alignSelf="flex-end" marginBottom={-1}><Text>{progress}</Text></Box>
			 </Box>

     *         <Box paddingX={2} height={1}>
     *             <Text color="green">{hint}</Text>
     *         </Box>
		   </Box>

     *     <Box>
     *         <Text>Status bar</Text>
     *     </Box>
     * </Box> */

    let statusBarElement = null;
    if (showStatusBar) {
        const text = ` ${filename} | ESC or C-c to exit | ${progress}`;
        const filler = " ".repeat(width - text.length);
        statusBarElement = <Box width="100%">
            <Text backgroundColor="gray">{text}</Text>
            <Text backgroundColor="gray">{filler}</Text>
        </Box>;
    }

    // Progress shown as part of the card when status bar is hidden
    let progressElement = showStatusBar ? null : <Box alignSelf="flex-end" marginBottom={-1}><Text>{progress}</Text></Box>;

	  return <Box flexDirection="column" alignItems="center" justifyContent="center" width={width} height={height}>
		{/* <Box justifyContent="center" flexBasis={60} minWidth={20} flexDirection="column"> */}
        <Spacer />

			      <Box width={60} flexDirection="column" borderStyle="single">
				        <Box paddingX={1}>
					          <Text>{question}</Text>
				        </Box>
				        <Box paddingX={1} paddingTop={1} height={2}>
					          <Text color={userInputColor}>{userInputText}</Text>
				        </Box>
                {progressElement}
			      </Box>

            <Box width={60} paddingX={2} height={1}>
                <Text color="green">{hint}</Text>
            </Box>

            <Spacer />
            {statusBarElement}
		        {/* </Box> */}
    </Box>
};

////////////////////////////////////////////////////////////////////////////////
//
// App: Cards
//
////////////////////////////////////////////////////////////////////////////////

type CardSide = "front" | "back";

function AppCards(params: AppParams) {
	  const {exit} = useApp();

    const filename = params.filename;
    const requiredGoodCnt = params.requiredGoodCnt;
    const { width, height } = useScreenSize();

	  const [cards] = useState(params.cards);
	  const [card, setCard] = useState<Card | null>(getNextCard());
    const [cardSide, setCardSide] = useState<CardSide>("front");
    const [step, setStep] = useState<Step>("question");
    const [showStatusBar, setShowStatusBar] = useState(params.showStatusBar);
	  /* const [progress, setProgress] = useState({cardCnt: cards.length, answeredCnt: 0}); */

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
        if (input === "f" || key.tab) {
            setCardSide(!cardSide);
            return;
        } else if (input === "y") {
            card.goodCnt++;
            gotoQuestionStep();
            return;
        } else if (input === "n") {
            gotoQuestionStep();
            return;
        }
    }

    // Handle input during the good-answer and bad-answer steps
    function useInputAnswerStep(_input: string, key: any) {
        if (key.return) {
            hasMoreCards() ? gotoQuestionStep() : gotoEndStep();
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
        setCard(getNextCard());
        setUserInput("");
        setStep("question");
    }

    function gotoEndStep() {
        setStep("end");
    }

    function getNextCard(): Card | null {
		    const candidateCards = getCardCandidates();
		    if (!candidateCards.length) {
			      return null;
		    }
		    const idx = Math.floor(Math.random() * candidateCards.length);
        const card = candidateCards[idx];
        return card ? card : null;
	  }

    function hasMoreCards() {
        return !!getCardCandidates().length;
    }

    function isAnswerGood() {
        return userInput.toLowerCase() === card?.answer.toLowerCase();
    }

    function getCardCandidates() {
        return cards.filter(card => card.goodCnt < requiredGoodCnt);
    }

    const hint = step === "bad-answer" ? card?.answer : "";
    let userInputColor = "white";
    let userInputText = userInput;
    if (step === "question") {
        userInputText += chalk.inverse(" ");
    } else if (step === "bad-answer") {
        userInputColor = "red";
    } else if (step === "good-answer") {
        userInputColor = "green";
    }
    //const question = card?.question;
    const question = "skdjflsd jflkjdslk jadlkfj ladjf ldhafk jdhaskf haldf kadjhf kjasdhf kdajshf kjdahsflkj hdaslkfj hdalkjfh lkdasjhf lkjdashf kljdahsflk jhadslkjfh asdljfh daskjfh kdsjahf kjdshfjhdfkh dkfh dskjhf jdshf jkdhsfjk hds jh jhfdkj hfjkdh fjdhk jfhdskjf h";

    const cardsDoneCnt = cards.length - getCardCandidates().length;
    const progress = `${cardsDoneCnt}/${cards.length}`;

	  /* return <Box justifyContent="center" width={width} height={height}>
		   <Box justifyContent="center" flexBasis={60} minWidth={20} flexDirection="column">
			 <Box flexDirection="column" borderStyle="single">
			 <Box paddingX={1}>
			 <Text>{question}</Text>
			 </Box>
			 <Box paddingX={1} paddingTop={1} height={2}>
			 <Text color={userInputColor}>{userInputText}</Text>
			 </Box>
     *             <Box alignSelf="flex-end" marginBottom={-1}><Text>{progress}</Text></Box>
			 </Box>

     *         <Box paddingX={2} height={1}>
     *             <Text color="green">{hint}</Text>
     *         </Box>
		   </Box>

     *     <Box>
     *         <Text>Status bar</Text>
     *     </Box>
     * </Box> */

    let statusBarElement = null;
    if (showStatusBar) {
        const text = ` ${filename} | ESC or C-c to exit | ${progress}`;
        const filler = " ".repeat(width - text.length);
        statusBarElement = <Box width="100%">
            <Text backgroundColor="gray">{text}</Text>
            <Text backgroundColor="gray">{filler}</Text>
        </Box>;
    }

    // Progress shown as part of the card when status bar is hidden
    let progressElement = showStatusBar ? null : <Box alignSelf="flex-end" marginBottom={-1}><Text>{progress}</Text></Box>;

	  return <Box flexDirection="column" alignItems="center" justifyContent="center" width={width} height={height}>
		    {/* <Box justifyContent="center" flexBasis={60} minWidth={20} flexDirection="column"> */}
        <Spacer />

			  <Box width={60} flexDirection="column" borderStyle="single">
				    <Box paddingX={1}>
					      <Text>{question}</Text>
				    </Box>
				    <Box paddingX={1} paddingTop={1} height={2}>
					      <Text color={userInputColor}>{userInputText}</Text>
				    </Box>
            {progressElement}
			  </Box>

        <Box width={60} paddingX={2} height={1}>
            <Text color="green">{hint}</Text>
        </Box>

        <Spacer />
        {statusBarElement}
		    {/* </Box> */}
    </Box>
};

////////////////////////////////////////////////////////////////////////////////
//
// Utils
//
////////////////////////////////////////////////////////////////////////////////

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

function readParams() {
    if (process.argv.length < 3) {
        usage();
    }

    const params = {
        filename: null,
        mode: "match",
        requiredGoodCnt: 1
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
                params.requiredGoodCnt = parseInt(nextArg) || 1;
                i+=2;
                continue;
            }
            usage();
        }
        else {
            if (params.filename) {
                usage();
            }
            params.filename = arg;
            i+=1;
        }
    }

    return params;
}
