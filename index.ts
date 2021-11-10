#!/usr/bin/env node

// import { terminal as term } from "terminal-kit";

// term.magenta("Enter your name: ");
// term.inputField((error, input) => {
//     term.green("Your name is %s", input);
// });

import blessed from "blessed";
//const blessed = require("neo-blessed");

const screen = blessed.screen({
    smartCSR: true,
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
        bg: "magenta",
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

screen.render();
