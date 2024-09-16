import { posts } from "./nav";
export const prerender = true;


export function load() {
    return{
        summaries:posts.map((post) => ({
            link: post.link,
            title: post.title
        }))
    }
}