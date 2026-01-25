<script lang="ts">
    import { resolve } from '$app/paths'; 

    const projects = [
        {
            slug: 'moon-phase',
            title: 'Moon Phases',
            description: 'Lunar illumination calendar showing the moon\'s phase for every day of the year.',
            tags: ['SveltePlot', 'D3', 'SunCalc']
        },
        {
            slug: 'national-park',
            title: 'National Parks',
            description: 'Interactive visualization of U.S. National Park visitor data from 1979–2024.',
            tags: ['SveltePlot', 'MapLibre', 'shadcn-svelte']
        }
        // Add more projects here
    ];
</script>

<div class="max-w-4xl mx-auto px-6 py-12">
    <!-- Header -->
    <header class="mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-3">Visualization <span class="line-through">side-project</span> Gallery</h1>
        <p class="text-gray-600 text-lg max-w-2xl">
            A collection of interactive data visualizations built with Svelte and SveltePlot. 
            Each project includes source code and explanations.
        </p>
    </header>

    <!-- Project grid -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each projects as project}
            <a 
                href={`/${project.slug}`}
                class="group block p-6 border border-gray-200 rounded-lg hover:border-teal-400 hover:shadow-md transition"
            >
                <h2 class="text-xl font-semibold text-gray-900 group-hover:text-teal-700 mb-2">
                    {project.title}
                </h2>
                <p class="text-gray-600 text-sm mb-4">
                    {project.description}
                </p>
                <div class="flex flex-wrap gap-2">
                    {#each project.tags as tag}
                        <span class="text-xs px-2 py-1 bg-teal-50 text-teal-700 rounded">
                            {tag}
                        </span>
                    {/each}
                </div>
            </a>
        {/each}
    </section>

    <!-- Footer -->
    <footer class="mt-16 pt-8 border-t border-gray-200 text-sm text-gray-500">
        <p>
            Built by <a href="https://github.com/mika-long" target="_blank" class="underline hover:text-teal-600">Sheng Long</a> · 
            <a href="https://github.com/mika-long/vis-gallery" target="_blank" class="underline hover:text-teal-600">View on GitHub</a>
        </p>
    </footer>
</div>