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
  sanitizePostContent,
  formatSocialUrl,
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
      name: 'Shruti Kumari',
      title: 'Author',
      avatar: 'avatar.jpg',
    },
    url: '',
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
      name: 'Shruti Kumari',
      title: 'Author',
      avatar: 'avatar.jpg',
    },
    url: '',
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
      name: 'Shruti Kumari',
      title: 'Author',
      avatar: 'avatar.jpg',
    },
    url: '',
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

test('sanitizePostContent strips signatures, blogger urls and trailing spans', () => {
  const dirty = '<p>Great thoughts.</p><p>&nbsp;&nbsp;</p><p><span><br /></span></p><p><span><span>&nbsp; ---&nbsp; </span><br /></span></p>';
  assert.equal(sanitizePostContent(dirty), '<p>Great thoughts.</p>');

  const withAuthor = '<p>Work hard.</p><p>By - Shruti Kumari</p>';
  assert.equal(sanitizePostContent(withAuthor), '<p>Work hard.</p>');

  const withOldAuthor = '<p>Positivity.</p><p>--- Prof. Sulekh Kumar</p>';
  assert.equal(sanitizePostContent(withOldAuthor), '<p>Positivity.</p>');

  const withBlogger = '<p>Check <a href="https://sulekh194971.blogspot.com">Blog</a> and <a href="https://blogger.com/img"><img src="pic.jpg"/></a></p>';
  assert.equal(sanitizePostContent(withBlogger), '<p>Check  and <img src="pic.jpg"/></p>');
});

test('formatSocialUrl formats social media handles and links properly', () => {
  assert.equal(formatSocialUrl('instagram', '@shruti'), 'https://instagram.com/shruti');
  assert.equal(formatSocialUrl('instagram', 'https://instagram.com/custom'), 'https://instagram.com/custom');
  assert.equal(formatSocialUrl('twitter', '@shrutiresearch'), 'https://x.com/shrutiresearch');
  assert.equal(formatSocialUrl('youtube', 'mychannel'), 'https://youtube.com/@mychannel');
  assert.equal(formatSocialUrl('whatsapp', '919876543210'), 'https://wa.me/919876543210');
  assert.equal(formatSocialUrl('email', 'author@blog.com'), 'mailto:author@blog.com');
  assert.equal(formatSocialUrl('website', 'mywebsite.org'), 'https://mywebsite.org');
  assert.equal(formatSocialUrl('unknown', ''), '');
});
