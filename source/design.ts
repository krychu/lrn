
type Step = Question | Answer;

const [step, setStep] = useState(null);

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

useInput((input, key) => {
    if (key.return) {
        gotoNextStep();
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

