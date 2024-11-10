/** @type {import('./$types').PageServerLoad} */
export async function load({parent}) {
    const {dir}= await parent();
    return {};
};