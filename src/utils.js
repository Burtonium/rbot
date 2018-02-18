/* eslint-disable */
export const wait = millis => new Promise((resolve) => {
	setInterval(resolve, millis);
});

export const precisionRound = (number, precision) => {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}