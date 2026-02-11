<script>
  import { page } from "$app/state";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";

  const pn_items = $derived.by(() => {
    const pn_array = ["/"].concat(page.url.pathname.split("/").filter(Boolean));

    return pn_array.map((pathname, index) => {
      let name = pathname === "/" ? "Home" : pathname;
      let fullPath = pn_array.slice(0, index + 1).join("/");
      if (fullPath === "") fullPath = "/";
      return { pathname: fullPath, name };
    });
  });
</script>

<div class="mr-auto w-full">
  <Breadcrumb.Root>
    <Breadcrumb.List>
      {#each pn_items as items, i}
        <Breadcrumb.Item>
          {#if i === pn_items.length - 1}
            <Breadcrumb.Page>{items.name}</Breadcrumb.Page>
          {:else}
            <Breadcrumb.Link asChild>
              <a href={items.pathname}>{items.name}</a>
            </Breadcrumb.Link>
          {/if}
        </Breadcrumb.Item>
        {#if i !== pn_items.length - 1}
          <Breadcrumb.Separator />
        {/if}
      {/each}
    </Breadcrumb.List>
  </Breadcrumb.Root>
</div>

