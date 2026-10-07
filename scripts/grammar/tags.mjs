import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const grammarFilePath = path.resolve(__dirname, '../data/lesson-grammar.json');
const grammarData = JSON.parse(fs.readFileSync(grammarFilePath, 'utf-8'));

/** @type {Record<string, string>} */
export const TAGS = grammarData.tags;

/**
 * @typedef {Object} LessonInfo
 * @property {number} lesson
 * @property {string} title_id
 * @property {string[]} introduces
 * @property {string[]} introduces_extra
 * @property {string[]} book_examples
 */

/** @type {LessonInfo[]} */
export const LESSONS = grammarData.lessons;

/**
 * Mendapatkan semua tag yang diizinkan untuk bab 1..lessonNum (introduces + introduces_extra)
 * @param {number} lessonNum
 * @returns {Set<string>}
 */
export function getAllowedTagsForLesson(lessonNum) {
  const allowed = new Set();
  for (const l of LESSONS) {
    if (l.lesson <= lessonNum) {
      for (const t of l.introduces || []) allowed.add(t);
      for (const t of l.introduces_extra || []) allowed.add(t);
    }
  }
  return allowed;
}

/**
 * Mendapatkan tag fokus utama (introduces) khusus bab lessonNum
 * @param {number} lessonNum
 * @returns {Set<string>}
 */
export function getLessonIntroduces(lessonNum) {
  const lesson = LESSONS.find(l => l.lesson === lessonNum);
  return new Set(lesson ? lesson.introduces : []);
}

/**
 * Cek apakah tag tertentu terdaftar di kamus resmi
 * @param {string} tag
 * @returns {boolean}
 */
export function isValidTag(tag) {
  return Object.prototype.hasOwnProperty.call(TAGS, tag);
}
