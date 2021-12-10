
type Step = Question | Answer;

const [step, setStep] = useState(null);

////////////////////////////////////////////////////////////////////////////////

useInput((input, key) => {
    if (step.type === "question") {
        useInputQuestionStep(input, key, setStep);
    } else if (step.type === "answer") {
        useInputAnswerStep(input, key, setStep);
    }
});

function useInputQuestionStep(input, key, setStep) {
    if (key.return) {
        //gotoGoodAnswerStep() || gotoBadAnswerStep();
        gotoAnswerStep(setStep);
    } else {
        step.answer += input;
    }
}

function useInputAnswerStep(input, key, setStep) {
    if (key.return) {
        hasMoreCards() ? gotoQuestionStep(setStep) : gotoEndStep(setStep);
    }
}

function gotoAnswerStep(setStep) {
    const answerStep = {
        type: "answer",
        card: step.card,
        isAnswerGood: isAnswerGood()
    };
    if (answerStep.isAnswerGood) {
        answerStep.card.goodCnt++;
    }
    // set
}



////////////////////////////////////////////////////////////////////////////////

function useInputGotoGoodAnswerStep(input, key) {
    if (step.type === "question" && key.return && isAnswerGood()) {
        step = {};
        return true;
    }
    return false;
}

function useInputGotoBadAnswerStep(input, key) {
    if (step.type === "question" && key.return && !isAnswerGood()) {
        step = {};
        return true;
    }
    return false;
}

function useInputQuestionStep(input, key) {
    if (step.type === "question" && !key.return) {
        step.answer += input;
        return true;
    }
    return false;
}

////////////////////////////////////////////////////////////////////////////////

useInput((input, key) => {
    if (key.return) {
        gotoNextStep();
    } else if (isQuestionStep()) {
        step.answer += input;
    }
});

function gotoNextStep() {
    const steps = [gotoQuestionStep, gotoGoodAnswerStep, gotoBadAnswerStep, gotoEndStep];
    for (const step of steps) {
        if (step()) {
            return;
        }
    }
}

function gotoQuestionStep() {
}

// problem, how do we pass answer? through step
function gotoAnswerStep() {
    //if (isQuestionStep()) 
}

function onReturn() {
    if (isQuestionStep()) {
        onReturnInQuestionStep();
    } else if (isAnswerStep()) {
        onReturnInAnswerStep();
    }
}

function onReturnInQuestionStep() {
    
}

function gotoEndStep() {
    
}

////////////////////////////////////////////////////////////////////////////////

// How to start, without input?
useInput((input, key) => {
    if (key.return && isAnswerStep()) {
        if (hasMoreCards()) {
            gotoQuestionStep();
        } else {
            gotoEndStep();
        }
    } else if (key.return && isQuestionStep()) {
        gotoAnswerStep(answer);
    } else {}
});

HERE
useInput((input, key) => {
    if (key.return) {
        gotoNext();
    }
});

////////////////////////////////////////////////////////////////////////////////

// Step condition and content disjoint
function onReturn() {
    if (isQuestionStep()) {
        gotoAnswerStep();
    } else if (isAnswerStep()) {
        if (hasMoreCards()) {
            gotoQuestionStep();
        } else {
            gotoEndStep();
        }
    }
}

////////////////////////////////////////////////////////////////////////////////

export const FullScreen: FC = (props) => {
 	  const [size, setSize] = useState({
 		    columns: process.stdout.columns,
 		    rows: process.stdout.rows,
 	  });

 	  useEffect(() => {
 		    function onResize() {
 			      setSize({
 				        columns: process.stdout.columns,
 				        rows: process.stdout.rows,
 			      });
 		    }

 		    process.stdout.on("resize", onResize);
 		    process.stdout.write("\x1b[?1049h");
 		    return () => {
 			      process.stdout.off("resize", onResize);
 			      process.stdout.write("\x1b[?1049l");
 		    };
 	  }, []);

 	  return (
 		    <Box width={size.columns} height={size.rows}>
 			      {props.children}
 		    </Box>
 	  );
};

/* function isCorrect(question: string, answer: string): boolean {
 * 	return question.toLowerCase() === answer.toLowerCase();
 * } */


/*
  {
  upArrow: false,
  downArrow: false,
  leftArrow: false,
  rightArrow: false,
  pageDown: false,
  pageUp: false,
  return: false,
  escape: false,
  ctrl: true,
  shift: false,
  tab: false,
  backspace: false,
  delete: false,
  meta: false
  }
*/


// const FullScreen: FC = (props) => {
// 	const [size, setSize] = useState({
// 		columns: process.stdout.columns,
// 		rows: process.stdout.rows,
// 	});

// 	useEffect(() => {
// 		function onResize() {
// 			setSize({
// 				columns: process.stdout.columns,
// 				rows: process.stdout.rows,
// 			});
// 		}

// 		process.stdout.on("resize", onResize);
// 		process.stdout.write("\x1b[?1049h");
// 		return () => {
// 			process.stdout.off("resize", onResize);
// 			process.stdout.write("\x1b[?1049l");
// 		};
// 	}, []);

// 	return (
// 		<Box width={size.columns} height={size.rows}>
// 			{props.children}
// 		</Box>
// 	);
// };

// const enterAltScreenCommand = "\x1b[?1049h";
// const leaveAltScreenCommand = "\x1b[?1049l";
// process.stdout.write(enterAltScreenCommand);
// process.on("exit", () => {
//   process.stdout.write(leaveAltScreenCommand);
// });

//render(<App name={cli.flags.name}/>);
