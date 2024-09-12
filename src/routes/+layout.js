export const prerender = true;

import { title } from "process";
import { posts } from "./nav";

export function load() {
    return{
        summaries:posts.map((post) => ({
            slug: post.slug,
            title: post.title
        }))
    }
}