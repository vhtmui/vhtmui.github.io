<script>
    import { onMount } from 'svelte';

    let { headings } = $props();
    let activeId = $state('');

    // 构建 TOC，添加 isOpen 状态（一级默认展开）
    function buildToc(headings) {
        const toc = [];
        const stack = [];
        headings.forEach((h) => {
            const item = { ...h, children: [], isOpen: h.level === 1 }; // 一级展开，其他折叠
            while (stack.length > 0 && stack[stack.length - 1].level >= h.level) {
                stack.pop();
            }
            if (stack.length === 0) {
                toc.push(item);
            } else {
                stack[stack.length - 1].children.push(item);
            }
            stack.push(item);
        });
        return toc;
    }

    const toc = $derived(buildToc(headings));

    // 高亮逻辑：使用 IntersectionObserver
    onMount(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                let current = '';
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        current = entry.target.id;
                    }
                });
                if (current) activeId = current;
            },
            { rootMargin: '-20% 0px -70% 0px' } // 调整高亮阈值（标题进入视口 20%-70% 时高亮）
        );

        headings.forEach((h) => {
            const el = document.getElementById(h.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect(); // 清理
    });

    // 折叠 toggle
    function toggle(item) {
        item.isOpen = !item.isOpen;
    }
</script>

{#snippet renderItem(item)}
    <li class:active={activeId === item.id}>
        <a href={`#${item.id}`}>{item.text}</a>
        {#if item.children.length > 0}
            <button on:click={() => toggle(item)} aria-label="Toggle subsection">
                {item.isOpen ? '−' : '+'}
            </button>
            {#if item.isOpen}
                <ul>
                    {#each item.children as child}
                        {@render renderItem(child)}
                    {/each}
                </ul>
            {/if}
        {/if}
    </li>
{/snippet}

{#if toc.length > 0}
    <nav class="toc" aria-label="Table of Contents">
        <h3>目录</h3>
        <ul>
            {#each toc as item}
                {@render renderItem(item)}
            {/each}
        </ul>
    </nav>
{/if}

<style>
    .toc {
        background: var(--background, white);
        border: 1px solid var(--border, #ddd);
        border-radius: 0.5rem;
        padding: 1rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        font-size: 0.9rem;
    }

    .toc h3 {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
        font-weight: bold;
    }

    .toc ul {
        list-style: none;
        padding-left: 0;
    }

    .toc li {
        margin: 0.25rem 0;
    }

    .toc a {
        text-decoration: none;
        color: var(--link, #007acc);
        transition: color 0.2s;
    }

    .toc a:hover {
        text-decoration: underline;
    }

    .toc li.active a {
        font-weight: bold;
        color: var(--active-link, #0056b3);
    }

    .toc button {
        margin-left: 0.5rem;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        color: var(--button, #666);
        padding: 0;
        width: 1.5rem;
        text-align: center;
    }

    .toc button:hover {
        color: var(--button-hover, #333);
    }

    /* 响应式位置控制 */
    @media (min-width: 1024px) {
        .toc {
            position: fixed;
            right: 1rem;
            top: 5rem;
            width: 250px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 100;
        }
    }

    @media (max-width: 1023px) and (min-width: 768px) {
        .toc {
            position: fixed;
            left: 1rem;
            top: 5rem;
            width: 200px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 100;
        }
    }

    @media (max-width: 767px) {
        .toc {
            display: none; /* 小屏幕隐藏，可根据需求改为其他位置 */
        }
    }

    /* 暗色主题支持 */
    :global(.dark) .toc {
        background: var(--background-dark, #1a1a1a);
        border-color: var(--border-dark, #333);
    }

    :global(.dark) .toc a {
        color: var(--link-dark, #4da6ff);
    }

    :global(.dark) .toc li.active a {
        color: var(--active-link-dark, #7cb9ff);
    }
</style>