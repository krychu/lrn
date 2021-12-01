#!/usr/bin/env node

// import { terminal as term } from "terminal-kit";

// term.magenta("Enter your name: ");
// term.inputField((error, input) => {
//     term.green("Your name is %s", input);
// });

import blessed, {Widgets} from "blessed";
import {autorun, makeAutoObservable} from "mobx";
//const blessed = require("neo-blessed");

class State {
    screen: Widgets.Screen;
    questionElement: Widgets.BlessedElement;
    inputElement: Widgets.TextareaElement;
    answerElement: Widgets.BlessedElement;

    userInput: string;

    constructor(screen: Widgets.Screen, questionElement: Widgets.BlessedElement, inputElement: Widgets.TextareaElement, answerElement: Widgets.BlessedElement) {
        makeAutoObservable(this);

        this.screen = screen;
        this.questionElement = questionElement;
        this.inputElement = inputElement;
        this.answerElement = answerElement;
        this.userInput = "";

        autorun(() => {
            this.inputElement.on("submit", (input) => {
                console.log(input);
            });
            this.inputElement.readInput(() => {});
        });

        autorun(() => {
            console.log(this.userInput);
        });
    }
};

class UI {
    constructor(state) {
        //
    }
}

const screen = blessed.screen({
    smartCSR: true
});

screen.title = "Krychu";

const box = blessed.box({
    top: "center",
    left: "center",
    width: "50%",
    height: "50%",
    content: "Hello {bold}world{/bold}!",
    tags: true,
    label: "haha",
    border: {
        type: "line"
    },
    style: {
        fg: "white",
        //bg: "magenta",
        border: {
            fg: "#f0f0f0"
        },
        hover: {
            bg: "green"
        }
    }
});

screen.append(box);
screen.key(["escape", "q", "C-c"], (ch, key) => {
    return process.exit(0);
});

const box2 = blessed.box({
    content: "Box2",
    border: {
        type: "line"
    },
    width: 20,
    height: 10
});
const box3 = blessed.box({
    content: "Box3",
    border: {
        type: "line"
    },
    //height: 10,
    //top: 10
});
const input = blessed.textbox({
    content: "lala",
    border: {
        type: "line"
    },
    top: 10,
    //inputOnFocus: true
});

//input.focus();
//input.readInput(function() {});

box.append(box2);
box.append(input);

const state = new State(screen, box2, input, box3);
// state.screen = screen;
// state.questionElement = box2;
// state.inputElement = input;
// state.answerElement = box3;
screen.render();

input.key(["C-c"], (ch, key) => {
    return process.exit(0);
});

// input.on("submit", (a) => {input.setValue(""); screen.render()});
// //input.focus();
// input.readInput(() => {});
