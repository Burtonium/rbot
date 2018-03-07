import { capitalize, replace, kebabCase } from 'lodash';

export const wait = millis => new Promise((resolve) => {
  setInterval(resolve, millis);
});

export const precisionRound = (number, precision) => {
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
};


export const toWords = name => capitalize(replace(kebabCase(name), new RegExp('-', 'g'), ' '));
