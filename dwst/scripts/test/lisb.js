
/**

  Authors: Toni Ruottu, Finland 2017
           Lauri Kaitala, Finland 2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import {lisb, parseLisb} from '../lisb.js';
import {expect} from 'chai';

describe('lisb module', () => {
  describe('parseLisb function', () => {
    it('should be able to parse lisb notation', () => {
      const result = parseLisb('foo [bar] [omg(123)] [lol(456,789)]');
      const expectedResult = [
        ['default', 'foo'],
        ['bar'],
        ['omg', '123'],
        ['lol', '456', '789'],
      ];
      expect(result).to.deep.equal(expectedResult);
    });
    it('should parse a single default particle', () => {
      const result = parseLisb('particle');
      const expectedResult = [
        ['default', 'particle'],
      ];
      expect(result).to.deep.equal(expectedResult);
    });
    it('should parse a single named particle without parameters', () => {
      const result = parseLisb('${instruction()}');
      const expectedResult = [
        ['instruction'],
      ];
      expect(result).to.deep.equal(expectedResult);
    });
    it('should parse a single named particle with a single parameter', () => {
      const result = parseLisb('${instruction(123)}');
      const expectedResult = [
        ['instruction', '123'],
      ];
      expect(result).to.deep.equal(expectedResult);
    });
    it('should parse a single named particle with two parameters', () => {
      const result = parseLisb('${instruction(123,abc)}');
      const expectedResult = [
        ['instruction', '123', 'abc'],
      ];
      expect(result).to.deep.equal(expectedResult);
    });
    it('should parse two instruction particles',  () => {
      expect(parseLisb(
        '${foo()}${bar()}',
      )).to.deep.equal([
        ['foo'],
        ['bar'],
      ]);
      expect(parseLisb(
        'foo${bar()}',
      )).to.deep.equal([
        ['default', 'foo'],
        ['bar'],
      ]);
      expect(parseLisb(
        '${foo()}bar',
      )).to.deep.equal([
        ['foo'],
        ['default', 'bar'],
      ]);
    });
    it('should parse three instruction particles',  () => {
      expect(parseLisb(
        '${foo()}${bar()}${quux()}',
      )).to.deep.equal([
        ['foo'],
        ['bar'],
        ['quux'],
      ]);
      expect(parseLisb(
        'foo${bar()}${quux()}',
      )).to.deep.equal([
        ['default', 'foo'],
        ['bar'],
        ['quux'],
      ]);
      expect(parseLisb(
        '${foo()}bar${quux()}',
      )).to.deep.equal([
        ['foo'],
        ['default', 'bar'],
        ['quux'],
      ]);
      expect(parseLisb(
        '${foo()}${bar()}quux',
      )).to.deep.equal([
        ['foo'],
        ['bar'],
        ['default', 'quux'],
      ]);
      expect(parseLisb(
        'foo${bar()}quux',
      )).to.deep.equal([
        ['default', 'foo'],
        ['bar'],
        ['default', 'quux'],
      ]);
    });
    /*


      const result = parseLisb('\[instruction1(123)] [instruction2(456)]');
      const result = parseLisb('[instruction1(123)] \[instruction2(456)]');
      const result = parseLisb('[instruction1(123)] \  [instruction2(456)]');

      # forbidden
      const forbidden = [
        '[instruction1(123)]\ [instruction2(456)]',
        '[instruction1(123)]garbage',
        '[instruction1(123)][instruction2(456)]',
        '[instruction1(123)',
        '[instruction1(123]',
      ]

      const result = parseLisb('[instruction1(123)]garbage [instruction2(456)]');
      const result = parseLisb('[instruction1(123)] garbage[instruction2(456)]');

      const result = parseLisb('[instruction1(123)] ');
      const result = parseLisb('[instruction1(123)]\ ');
      const result = parseLisb('[instruction1(123)]foo');
      const result = parseLisb('[instruction1(123)] [instruction2(456)]');
      const result = parseLisb('[instruction1(123)] [instruction2(456)]');
      const result = parseLisb('[instruction1(123)] [instruction2(456)]');
      const result = parseLisb('[instruction1(123)] [instruction2(456)]');
      const result = parseLisb('[instruction1(123)] [instruction2(456)]');
      const result = parseLisb('[instruction1(123)] [instruction2(456)]');
      const result = parseLisb('[instruction1(123)] [instruction2(456)]');

*/
  });

  console.log('lol');
  describe('this test', () => {
    it('should show up in mocha', () => {
      const result = 1;
      expect(result).to.equal(1);
    });
    it('toni sample 1', () => {
      const result = lisb('a b c', (x, y) => y, s => s.join(''));
      expect(result).to.equal('abc');
    });
    it('toni sample 2', () => {
      const result = lisb('[foo(123)]', (a, b) => `-${a}-${b}-`, s => s.join(''));
      expect(result).to.equal('-foo-123-');
    });
    it('toni sample 3', () => {
      const result = lisb('[foo(123)]', (a, b) => `${a}-${b}`, s => s.join(''));
      expect(result).to.equal('foo-123');
    });
  });
/*
  describe('parseNum function', () => {
    it('should support decimal values', () => {
      const result = utils.parseNum('123');
      expect(result).to.equal(123);
    });

    it('should support hex values', () => {
      const result = utils.parseNum('0x10');
      expect(result).to.equal(0x10);
    });
  });
  describe('chunkify function', () => {
    it('should make chunks from an array', () => {
      const array = [1, 2, 3];
      const chunkSize = 2;
      const expectedChunks = [
        [1, 2], [3],
      ];
      const result = utils.chunkify(array, chunkSize);
      expect(result).to.deep.equal(expectedChunks);
    });

    it('should make chunks from a string', () => {
      const string = 'aaabbbcccdd';
      const chunkSize = 3;
      const expectedChunks = [
        ['a', 'a', 'a'],
        ['b', 'b', 'b'],
        ['c', 'c', 'c'],
        ['d', 'd'],
      ];
      const result = utils.chunkify(string, chunkSize);
      expect(result).to.deep.equal(expectedChunks);
    });
  });
*/
});
