import React, {FC, useState} from 'react';
import {Text, Box, useInput, useApp} from 'ink';
/* import TextInput from 'ink-text-input'; */
import { Card } from "./cli";
import chalk from "chalk";

interface Props {
	onChange: (value: string) => void;
	onSubmit?: (value: string) => void;
}

const Input: FC<Props> = ({
	onChange,
	onSubmit
}) => {
	  return <Box>
    </Box>
};

export default Input;
