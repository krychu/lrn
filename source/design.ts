
type Step = Question | Answer;

const [step, setStep] = useState(null);

function onReturn() {
    if (isQuestionStep()) {
        
    }
}

////////////////////////////////////////////////////////////////////////////////

useInput((input, key) => {
    if (key.return) {
        nextStep();
    } else if (isQuestionStep()) {
        step.answer += input;
    }
});

function gotoNextStep() {
    const steps = [gotoQuestionStep, gotoAnswerStep, gotoEndStep];
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

