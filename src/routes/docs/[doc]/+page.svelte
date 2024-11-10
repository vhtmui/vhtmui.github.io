<script>
    import Markdown from "$lib/Exmarkdown/Markdown.svelte";

    /** @type {import('./$types').PageData} */
    let { data } = $props();

    let md = $state("# hello")
</script>


<Markdown md={data.mdContent} />