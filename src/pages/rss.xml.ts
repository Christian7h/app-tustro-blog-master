import rss from '@astrojs/rss';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { client } from '../lib/tursoDb';
import type { APIContext } from 'astro';

async function fetchPosts() {
  let posts: any[] = [];
  try {
    const allPostsResponse = await client.execute({
      sql: "SELECT posts.title, posts.description, posts.slug, posts.hero, authors.first_name, authors.last_name, authors.slug AS author_slug, authors.avatar, posts.content, posts.created_at FROM posts LEFT JOIN authors ON authors.id = posts.author_id ORDER BY posts.created_at DESC;",
      args: [],
    });
    posts = allPostsResponse.rows.map((post) => ({
      published: false,
      title: post.title,
      description: post.description,
      slug: post.slug,
      hero: post.hero,
      created_at: post.created_at,
      publish_date: post.publish_date,
      author: {
        first_name: post.first_name,
        last_name: post.last_name,
        slug: post.slug,
        avatar: post.avatar
      }
    }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    // Maneja el error adecuadamente aquí
  }
  return posts;
}

export async function get(context: APIContext) {
  const posts = await fetchPosts(); // Llama a la función asíncrona aquí
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site as unknown as string,
    items: posts.map((post) => ({
      title: post.title,
      pubDate: new Date((post.publish_date || post.created_at) * 1000),
      description: post.description,
      link: `/post/${post.slug}/`,
    })),
  });
}
