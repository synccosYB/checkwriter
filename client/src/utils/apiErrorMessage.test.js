import { apiErrorMessage } from './apiErrorMessage';

test('extracts nested user messages and plain API errors', () => {
  expect(apiErrorMessage({ response: { data: { error: { userMessage: 'Not found', statusCode: 404 } } } })).toBe('Not found');
  expect(apiErrorMessage({ response: { data: { error: 'Access denied' } } })).toBe('Access denied');
  expect(apiErrorMessage({ response: { data: { message: 'Try later' } } })).toBe('Try later');
});
test('never renders objects or exposes developer details', () => {
  expect(apiErrorMessage({ response: { data: { error: { developerMessage: 'private details' }, message: {} } } }, 'Try again')).toBe('Try again');
  expect(apiErrorMessage({ message: 'Network error' })).toBe('Network error');
  expect(apiErrorMessage(null, 'Try again')).toBe('Try again');
});
