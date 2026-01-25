import { error } from '@sveltejs/kit';
import { fetchBookById } from '$lib/db';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const book = await fetchBookById(params.id);

  if (!book) {
    error(404, 'Book not found');
  }

  return {
    book
  };
};
