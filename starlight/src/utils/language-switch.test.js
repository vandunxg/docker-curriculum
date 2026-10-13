import test from 'node:test';
import assert from 'node:assert/strict';
import {
	hasVietnameseMirror,
	localizePath,
	rootPath,
} from './language-switch.js';

test('maps an English document path to the Vietnamese locale', () => {
	assert.equal(localizePath('/introduction/00-docker/', 'vi'), '/vi/introduction/00-docker/');
});

test('maps a Vietnamese document path back to the root locale', () => {
	assert.equal(localizePath('/vi/introduction/00-docker/', 'root'), '/introduction/00-docker/');
	assert.equal(rootPath('/vi/introduction/00-docker/'), '/introduction/00-docker/');
});

test('finds a Vietnamese mirror for the current document', () => {
	const documents = ['../content/docs/vi/introduction/00-docker.md'];

	assert.equal(hasVietnameseMirror(documents, '/introduction/00-docker/'), true);
	assert.equal(hasVietnameseMirror(documents, '/getting-started/00-getting-started/'), false);
});

test('maps locale index documents to the locale root', () => {
	assert.equal(hasVietnameseMirror(['../content/docs/vi/index.mdx'], '/'), true);
	assert.equal(hasVietnameseMirror(['../content/docs/vi/introduction/index.md'], '/introduction/'), true);
});
