
/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

// LISB templating language -- "Lots of Irritating Square Brackets"

function affirmProgress(remainder, debug_remainderLength) {
  if (debug_remainderLength === remainder.length) {
    throw new Error("you arent doing anything! workstring is: " + remainder);
  }
}

// todo: how to handle whitespace?
// todo: can instructions have escapes?
// todo: define legal instruction name characters somewhere. 
// can instruction names begin with '(' ? 
// todo: define legal default names also.
// suspect: named particles contain their escapes as is.

// a named particle cannot end except in a '}' char.
function readNamedParticle(remainder) {
  const debug_remainderLength = remainder.length;
  if (remainder[1] !== '{') {
    const msg = "broken named particle: missing '{', remainder = " + remainder;
    throw new Error(msg);
  }
  const outerBracketClosed = remainder.indexOf('}');
  if (outerBracketClosed < 0) {
    const msg = "broken named particle: missing '}', remainder = " + remainder;
    throw new Error(msg);
  }
  const particle = remainder.slice(0, outerBracketClosed+1); // include bracket
  remainder = remainder.slice(outerBracketClosed+1); // overslicing strings returns empty strings
  const particleBody = particle.slice(2,-1); // trim surrounding ${}
  const innerBracketOpened = particleBody.indexOf('(');
  if (innerBracketOpened === 0) {
    const msg = "broken named particle: missing instruction name, particleBody = " + particleBody;
    throw new Error(msg);
  }
  if (innerBracketOpened < 0) {
    const msg = "broken named particle: missing '(', particleBody = " + particleBody;
    throw new Error(msg);
  }
  const particleName = particleBody.slice(0, innerBracketOpened);
  const innerBracketClosed = particleBody.indexOf(')');
  if (innerBracketClosed === 0) {
    const msg = "broken instruction: missing ')', particleBody = " + particleBody;
    throw new Error(msg);
  }
  const particleParams_body = particleBody.slice(innerBracketOpened);
  const particleParams_string = particleParams_body.slice(1,-1); // trim surrounding ()
  let particleParams = [];
  if (particleParams_string.length > 0) { // can this be done more elegantly ?
    particleParams = particleParams_string.split(',');
  }
  const result = [particleName].concat(particleParams);
  affirmProgress(remainder, debug_remainderLength);
  return [remainder, result];
}

function doEscapeChar(remainder, buffer) {
  remainder = remainder.substr(1); // eliminate '\'
  if (remainder === '') {
    const msg = "syntax error: looks like your last character is an escape. ";
    throw new Error(msg);
  }
  const escapedChar = remainder[0];
  console.log('at escp rem: ' + remainder);
  console.log('at escp char: ' + escapedChar);
  buffer.push(escapedChar);
  remainder = remainder.substr(1);
  return [remainder, buffer];
}

// todo: escape must not be last character
function readDefaultParticle(remainder) {
  const debug_remainderLength = remainder.length;
  const specialChars = [
    '$',
    '\\',
  ];
  let buffer = []; // reference or copy ?: can i use const buffer?
  while (remainder.length > 0) {
    let c = remainder[0];
    if (c === '\\') { // escape next character
      let escapeResult = doEscapeChar(remainder, buffer); // reference or copy ?
      remainder = escapeResult[0];
      buffer = escapeResult[1]; // reference or copy ?
      continue; // next char might also be an escape: start over.
    }
    // c is not a special character: get next special character position:
    let specialPositionsNear = specialChars.map(character => {
       let i = remainder.indexOf(character);
       if (i < 0) { return 0; }
       return i;
    });
    specialPositionsNear.sort(function(a,b) { return a - b; });
    let nextSpecialPos = specialPositionsNear.filter(i => i > 0)[0];
    let read = null // read next default particle: make this nicer...
    console.log("next special pos: " + nextSpecialPos);
    console.log("rem : " + remainder);
    if (nextSpecialPos === undefined) {
      read = remainder;
      remainder = '';
    } else {
      // special character encountered, break!
      read = remainder.slice(0, nextSpecialPos);
      remainder = remainder.slice(nextSpecialPos);
    }
    // the bug is in a five line radius from here!
    affirmProgress(remainder, debug_remainderLength);
    buffer.push(read); // in case buffer contains something, escaped chars for example
    console.log("default buffer: " + buffer);
    if (nextSpecialPos !== undefined) { break;}
  }
  let result = ['default', buffer.join('')]
  console.log("default result: " + result);
  return [remainder, result];
}

function readOneParticle(remainder, parsed) {
  const specialChars = [
    '$',
    '\\',
  ];
  const debug_remainderLength = remainder.length;
  let c = remainder[0];
  let result = null;
  if (c === '$') { // starts named particle
    result = readNamedParticle(remainder);
  } else {
    result = readDefaultParticle(remainder);
  }
  remainder = result[0];
  parsed.push(result[1]);

  // lastly:
  affirmProgress(remainder, debug_remainderLength);
  return [remainder, parsed];
}

export function parseLisb(paramString) {
  console.log("paramString: " + paramString);
  let parsed = [];
  let remainder = paramString;
  const debug_max = 100;
  let iteration = 0;
  while (remainder.length > 0) {
    let result = readOneParticle(remainder, parsed);
    remainder = result[0];
    parsed = result[1];
    iteration = iteration + 1;
    if (iteration > debug_max) {
      console.log("debug_max exceeded");
      throw new Error("debug_max exceeded");
    }
  }
  console.log("ok");
  return parsed;
}

export function lisb(paramString, processFunction, joinFunction) {
  return joinFunction(paramString.split(' ').map(rawParam => {
    let param = rawParam;
    /* eslint-disable prefer-template */
    if (param.substr(param.length - 2, 2) === '\\\\') {
      param = param.substr(0, param.length - 2) + '\\';
    } else if (param.substr(param.length - 1, 1) === '\\') {
      param = param.substr(0, param.length - 1) + ' ';
    }
    /* eslint-enable prefer-template */
    let instruction = 'default';
    let params = [];
    let end = '';
    if (param.substr(0, 2) === '\\\\') {
      params.push(param.substr(1));
    } else if (param.substr(0, 2) === '\\[') {
      params.push(param.substr(1));
    } else if (param.substr(0, 1) === '[') {
      const tmp = param.split(']');
      const call = tmp[0].split('[')[1];
      end = tmp[1];
      const tmp2 = call.split('(').concat('');
      instruction = tmp2[0];
      const pl = tmp2[1].split(')')[0];
      if (pl.length > 0) {
        params = pl.split(',');
      }
    } else {
      params.push(param);
    }
    return processFunction(instruction, params, end);
  }));
}

export default lisb;
