<script>
    
    /**
     * @typedef {Object} Props
     * @property {import('./$types').PageData} data
     */

    /** @type {Props} */
    let { data } = $props();
    import { page } from '$app/stores';

</script>

<p>{$page.route.id}</p>