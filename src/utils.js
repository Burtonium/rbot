import { capitalize, replace, kebabCase } from 'lodash';

export const wait = millis => new Promise((resolve) => {
  setInterval(resolve, millis);
});

export const precisionRound = (number, precision) => {
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
};


export const toWords = name => capitalize(replace(kebabCase(name), new RegExp('-', 'g'), ' '));

export const dateTimeString = time => `${new Date(time).toDateString()} ,
   ${new Date(time).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')}`;
