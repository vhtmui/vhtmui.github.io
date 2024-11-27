<script>
	import { goto } from '$app/navigation';
</script>

<main>
	<a href="/docs">Docs</a>
	<a href="/posts">Post</a>
	<a href="/tools">Tools</a>
</main>

<style>
	main {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 1rem;
		height: 100vh;
		a {
			display: flex;
			justify-content: center;
			align-items: center;
			color: unset;
			text-decoration: unset;
			width: 100%;
			border:1px solid var(--home-border-color);
			border-radius: 3rem;
			font-size: 64px;
			font-family: 'Courier New', Courier, monospace;
			font-weight: 900;
			&:visited{
				color: unset;
			}
		}
	}
</style>
