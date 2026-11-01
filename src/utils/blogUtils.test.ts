import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDate,
  formatArchiveLabel,
  getArchiveKey,
  getArchiveGroups,
  filterPosts,
  getPopularPosts,
  generateSnippet,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from './blogUtils';
import { BlogPost } from '../data/blogData';

const mockPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'The Positive Attitude of Life',
    published: '2026-07-15T08:36:27.195-07:00',
    updated: '2026-07-15T08:36:27.195-07:00',
    content: '<p>A positive attitude means thinking positively...</p>',
    snippet: 'A positive attitude means thinking positively...',
    author: {
      name: 'Prof. Sulekh Kumar',
      title: 'Assistant Professor',
      avatar: 'avatar.jpg',
    },
    url: 'https://example.com/1',
    initialCommentCount: 1,
  },
  {
    id: 'post-2',
    title: 'Hum bhi dariya hain',
    published: '2026-07-15T07:00:00.000-07:00',
    updated: '2026-07-15T07:00:00.000-07:00',
    content: '<p>Hum bhi dariya hain, humein apna hunar maloom hai</p>',
    snippet: 'Hum bhi dariya hain, humein apna hunar maloom hai',
    author: {
      name: 'Prof. Sulekh Kumar',
      title: 'Assistant Professor',
      avatar: 'avatar.jpg',
    },
    url: 'https://example.com/2',
    initialCommentCount: 0,
  },
  {
    id: 'post-3',
    title: 'Emotion, Weakness, Power and Stability.',
    published: '2026-02-23T10:00:00.000-07:00',
    updated: '2026-02-23T10:00:00.000-07:00',
    content: '<p>Emotion is nothing but the flow of energy...</p>',
    snippet: 'Emotion is nothing but the flow of energy...',
    author: {
      name: 'Prof. Sulekh Kumar',
      title: 'Assistant Professor',
      avatar: 'avatar.jpg',
    },
    url: 'https://example.com/3',
    initialCommentCount: 1,
  },
];

test('formatDate formats date matching Blogger style', () => {
  const result = formatDate('2026-07-15T08:36:27.195-07:00');
  assert.match(result, /^- July 15, 2026/);
});

test('getArchiveKey returns year-month identifier', () => {
  assert.equal(getArchiveKey('2026-07-15T08:36:27.195-07:00'), '2026-07');
  assert.equal(getArchiveKey('2026-02-23T10:00:00.000-07:00'), '2026-02');
});

test('formatArchiveLabel returns month and year label', () => {
  assert.equal(formatArchiveLabel('2026-07-15T08:36:27.195-07:00'), 'July 2026');
});

test('getArchiveGroups aggregates and sorts groups descending', () => {
  const groups = getArchiveGroups(mockPosts);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].key, '2026-07');
  assert.equal(groups[0].count, 2);
  assert.equal(groups[1].key, '2026-02');
  assert.equal(groups[1].count, 1);
});

test('filterPosts filters by search query', () => {
  const filtered = filterPosts(mockPosts, 'dariya', '');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'post-2');
});

test('filterPosts filters by archive month', () => {
  const filtered = filterPosts(mockPosts, '', '2026-02');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'post-3');
});

test('getPopularPosts excludes current post and respects limit', () => {
  const popular = getPopularPosts(mockPosts, 'post-1', 1);
  assert.equal(popular.length, 1);
  assert.notEqual(popular[0].id, 'post-1');
});

test('generateSnippet strips tags and truncates nicely', () => {
  const html = '<p>Hello <b>world</b> and &quot;friends&quot;</p>';
  assert.equal(generateSnippet(html), 'Hello world and "friends"');
});

test('createBlogPost formats a new post and sets author info', () => {
  const newPost = createBlogPost(
    { title: 'My Custom Journey', content: 'This is my first post.\n\nKeep learning.' },
    { name: 'Er. Rahul', title: 'Developer', avatar: '/avatar.jpg' }
  );
  assert.equal(newPost.title, 'My Custom Journey');
  assert.equal(newPost.author.name, 'Er. Rahul');
  assert.match(newPost.content, /<p>This is my first post.<\/p>/);
});

test('updateBlogPost modifies target post cleanly', () => {
  const updated = updateBlogPost(mockPosts, 'post-1', { title: 'Updated Title' });
  const target = updated.find((p) => p.id === 'post-1');
  assert.equal(target?.title, 'Updated Title');
  const untouched = updated.find((p) => p.id === 'post-2');
  assert.equal(untouched?.title, 'Hum bhi dariya hain');
});

test('deleteBlogPost removes specified post', () => {
  const remaining = deleteBlogPost(mockPosts, 'post-1');
  assert.equal(remaining.length, 2);
  assert.equal(remaining.find((p) => p.id === 'post-1'), undefined);
});
