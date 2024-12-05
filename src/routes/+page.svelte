<script>
	import { goto } from '$app/navigation';
</script>

<div class="homepage">
	<a href="/docs">Docs</a>
	<a href="/posts">Post</a>
	<a href="/tools">Tools</a>
</div>

<style>
	.homepage :global {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 1rem;
		justify-content: center;
		height: 100vh;
		a {
			display: flex;
			justify-content: center;
			align-items: center;
			color: unset;
			text-decoration: unset;
			width: 84vw;
			border: 1px solid var(--home-border-color);
			border-radius: 3rem;
			font-size: 64px;
			font-family: 'Courier New', Courier, monospace;
			font-weight: 900;
			&:visited {
				color: unset;
			}
		}
	}
</style>
