import test from 'ava';
import voidElements = require('html-void-elements');
import { escape } from 'he';
import SanitizeState from '..';

const TEST_CASES = {
    'non-escaped void element at toplevel': [['<br>', false]],

    'escaped void element at toplevel': [['<base>', true]],

    'sequence of void elements': [
        ['<br>', false],
        ['<base>', true],
        ['<base>', true],
        ['<img>', false],
        ['<br>', false],
    ],

    'non-escaped void element in an element': [['<div>', false], ['<br>', false], ['</div>', false]],

    'escaped void element in an element': [['<style>', true], ['<base>', true], ['</style>', true]],

    'non-escaped empty void element at toplevel': [['<br/>', false]],

    'escaped empty void element at toplevel': [['<base/>', true]],

    'sequence of empty void elements': [
        ['<br/>', false],
        ['<base/>', true],
        ['<base/>', true],
        ['<img/>', false],
        ['<br/>', false],
    ],

    'non-escaped empty void element in an element': [['<div>', false], ['<br/>', false], ['</div>', false]],

    'escaped empty void element in an element': [['<style>', true], ['<base/>', true], ['</style>', true]],

    'mix of empty and open void elements': [
        ['<br/>', false],
        ['<base>', true],
        ['<br/>', false],
        ['<base/>', true],
        ['<img>', false],
        ['<br/>', false],
    ],

    'mix of empty void elements, open void elements and normal elements': [
        ['<br/>', false],
        ['<div>', false],
        ['<base>', true],
        ['</div>', false],
        ['<br/>', false],
        ['<style>', true],
        ['<base/>', true],
        ['</style>', true],
        ['<table/>', false],
        ['<img>', false],
        ['<br/>', false],
    ],

    'non-escaped open/close void element at toplevel': [['<br>', false], ['</br>', false]],

    'escaped void open/close element at toplevel': [['<base>', true], ['</base>', true]],

    // TODO: Add more test cases for void elements which has closing tags
} as { [desc: string]: [string, boolean][] };

for (const desc of Object.keys(TEST_CASES)) {
    const testcase = TEST_CASES[desc];
    test(desc, t => {
        const state = new SanitizeState();
        for (const [tag, escaped] of testcase) {
            let isClosingVoid = false;
            const m = tag.match(/^<\/(\w+)/);
            if (m !== null) {
                isClosingVoid = voidElements.indexOf(m[1]) >= 0;
            }
            const want = isClosingVoid ? '' : escaped ? escape(tag) : tag;
            const have = state.sanitize(tag);
            t.is(want, have);
        }
        t.false(state.isBroken());
        t.false(state.isInUse());
    });
}
