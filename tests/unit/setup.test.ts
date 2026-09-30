import { expect, it } from 'vitest';

it('disponibiliza o DOM e os matchers do Testing Library', () => {
  expect(document.body).toBeInTheDocument();
});
