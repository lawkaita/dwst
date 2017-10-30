
/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

// LISB templating language -- "Lots of Irritating Square Brackets"

export function parseLisb(paramString) {
  const specialChars = [
    '$',
    '\\',
  ];
  const originalString = paramString;
  let workString = paramString;
  let buffer = [];
  const parsed = [];
  const mode_reading_default = 0;
  const mode_begin_read_instruction = 1;
  const mode_reading_instruction = 2;
  let mode = mode_reading_default;
  const debug_max = 100;
  let iteration = 0;
  while (workString.length > 0) {
    let c = workString.charAt(0);
    // or // let c = workString[0];
    if (mode === mode_reading_default) {
      // start instruction
      if (c === '$') {
        mode = mode_begin_read_instruction;
        workString = workString.substr(1);
        continue;
      }
      // escape next character
      if (c === '\\') { // must not be last character: this is a todo
        // string pop char {
        workString = workString.substr(1);
        // }
        let escapedChar = workString[0];
        buffer.push(escapedChar);
        // string pop char {
        workString = workString.substr(1);
        // }
        continue;
      }
      // c is not a special character:
      // read stuff into parsed:
      // get next special character position
      let specialPositionsNear = specialChars.map(character => {
         let i = workString.indexOf(character);
         if (i < 0) { return 0; }
         return i;
      });
      specialPositionsNear.sort(function(a,b) { return a - b; });
      let nextSpecialPos = specialPositionsNear[0];

      // read next default particle
      let read = null
      if (nextSpecialPos === 0) {
        read = workString;
        workString = '';
      } else {
        // string pop string {
        read = workString.slice(0, nextSpecialPos);
        workString = workString.slice(nextSpecialPos);
        // }
      }
      // the following is done in case buffer contains something, escaped chars for example:
      buffer.push(read); 
      let result = ['default', buffer.join('')]
      parsed.push(result);
      buffer = [];
      // here ends one succesful default particle read
      
      // legacy mud:
      /*
      let nextDollarPos = workString.indexOf('$');
      let nextEscapePos = workString.indexOf('\\');
      // resolve nextSpecialPos:
      let nextSpecialPos = null;
      if (nextDollarPos > 0 && nextEscapePos > 0) {
        nextSpecialPos = Math.min(nextDollarPos, nextEscapePos);
      }
      if (nextDollarPos === nextEscapePos) {
        // this is possible only if both are -1
        // the rest of workString is only text
        parsed.push(workString);
        workString = '';
      }
      */
      // the other is positive and a relevant position.
    }
    if (mode === mode_begin_read_instruction) {
      if (c !== '{') { throw new Error("broken instruction: missing '{'"); }
      mode = mode_reading_instruction;
      // workString = workString.substr(1);
      // ^do this elsewhere
      continue;
    }
    if (mode === mode_reading_instruction) {
      // note: this parser doesn't support nesting

      // read instruction whole body:
      let readUntil = workString.indexOf('}') + 1; // include '}'
      if (readUntil = 0) { throw new Error("broken instruction: missing '}'"); }
      let instructionString = workString.slice(0, readUntil);
      workString = workString.slice(readUntil); // overslicing strings returns empty strings
      instructionString = instructionString.slice(1,-1); // trim surrounding {}
      console.log(instructionString);

      // read instruction name:
      readUntil = workString.indexOf('('); // dont read '('
      // todo: define legal instruction name characters somewhere. 
      // can instruction names begin with '(' ? 
      // todo: define legal default names also.
      if (readUntil = 0) { throw new Error("broken instruction: missing instruction name"); }
      if (readUntil < 0) { throw new Error("broken instruction: missing '('"); }
      let instructionName = workString.slice(0, readUntil);
      workString = workString.slice(readUntil);

      // read instruction params:
      readUntil = workString.indexOf(')') + 1; // include ')'
      if (readUntil = 0) { throw new Error("broken instruction: missing ')'"); }
      let instructionParamsString = workString.slice(0, readUntil);
      workString = workString.slice(readUntil);
      instructionParamsString = instructionParamsString.slice(1,-1); // clean surrounding brackets
      let instructionParams = instructionParamsString.split(',');
      // todo: how to handle whitespace?
      // todo: can instructions have escapes?
      let result = [instructionName].concat(instructionParams);
      parsed.push(result);
      mode = mode_reading_default;
    }
    iteration = iteration + 1;
    if (iteration > debug_max) {
      console.log("debug_max exceeded");
      throw new Error("debug_max exceeded with mode: " + mode);
    }
  }
  console.log('returning... mode is: ' + mode);
  return parsed;



  /*
  const parsed = [];
  if (paramString.indexOf('$') > -1) {
    // const regex = /\$\{(.*)\}/g;
    const regex = /\$\{(.+)\(\)\}/g;
    const extracted = paramString.replace(regex, '$1');
    const result = [extracted];
    parsed.push(result);
    return parsed;
  }
  const result = ['default', paramString];
  parsed.push(result);
  return parsed;
  */
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
