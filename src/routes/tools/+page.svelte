<nav>
	<a href="#一">一</a>
	<a href="#2">2</a>
	<a href="#three">three</a>
	<a href="#4">四</a>
	<a href="#五five">五</a>
</nav>
<div class="scroll-container">
	<div class="scroll-page" id="一"><a href="#一">一</a></div>
	<div class="scroll-page" id="2">2</div>
	<div class="scroll-page" id="three">three</div>
	<div class="scroll-page" id="4"><a href="#4">四</a></div>
	<div class="scroll-page" id="五five"><a href="#五">五</a></div>
</div>

<style>
	a {
		display: inline-block;
		width: 50px;
		text-decoration: none;
	}
	nav,
	.scroll-container {
		display: block;
		margin: 0 auto;
		text-align: center;
	}
	nav {
		width: 339px;
		padding: 5px;
		border: 1px solid black;
	}
	.scroll-container {
		width: 350px;
		height: 200px;
		overflow-y: scroll;
		scroll-behavior: smooth;
	}
	.scroll-page {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100px;
		font-size: 2em;
	}
</style>
