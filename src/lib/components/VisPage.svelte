<script lang="ts">
    import { base } from '$app/paths';
    import type { Snippet } from 'svelte';
    import { SquareArrowOutUpRightIcon } from '@lucide/svelte';

    let { 
        title,
        sourceUrl,
        description,
        credits,
        children 
    }: { 
        title: string;
        sourceUrl: string;
        description: Snippet;
        credits: Snippet;
        children: Snippet;
    } = $props();
</script>

<div class="max-w-5xl mx-auto px-6 py-8">
    <!-- Header -->
    <header class="mb-8">
        <div class="flex items-start justify-between">
            <div>
                <a href="{base}/" class="text-sm text-gray-500 hover:underline hover:text-gray-700 mb-2 inline-block">
                    ← Back to gallery
                </a>
                <h1 class="text-3xl font-bold text-gray-900">{title}</h1>
            </div>
            <a 
                href={sourceUrl}
                target="_blank" 
                rel="noopener noreferrer"
                class="text-sm text-gray-500 hover:underline hover:text-gray-700 flex items-center gap-1 mt-6"
            >
                View source <SquareArrowOutUpRightIcon size={14} />
            </a>
        </div>
    </header>

    <!-- Description -->
    <section class="mb-8 max-w-2xl">
        {@render description()}
    </section>

    <!-- Visualization -->
    {@render children()}

    <!-- Footer credits -->
    <footer class="mt-6 text-xs text-gray-400">
        {@render credits()}
    </footer>
</div>