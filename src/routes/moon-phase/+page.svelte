<script lang="ts">
    import VisPage from "$lib/components/VisPage.svelte";
    import MoonPhase from "$lib/components/MoonPhase.svelte";

    const sourceUrl = "https://github.com/mika-long/vis-gallery/blob/main/src/routes/moon-phase/";
</script>

<VisPage {sourceUrl} title="Moon Phases">
    {#snippet description()}
        <p class="text-gray-700 mb-3">
            A calendar visualization showing the moon's illumination phase for every day of the year. 
            Each circle represents one day, with the lit portion showing how much of the moon is visible from Earth.
        </p>
        <p class="text-gray-600 text-sm mb-3">
            The visualization uses <a href="https://github.com/mourner/suncalc" target="_blank" class="underline hover:text-gray-900">SunCalc</a> to 
            compute lunar illumination and an orthographic projection to render the terminator (the shadow edge). 
            Change the locale to see month names in different languages.
        </p>
        <p class="text-gray-500 text-sm">
            Inspired by <a href="https://observablehq.com/@observablehq/plot-phases-of-the-moon" target="_blank" class="underline hover:text-gray-700">Observable's Moon Phase calendar</a>.
        </p>
    {/snippet}
    
    <MoonPhase />

     {#snippet credits()}
        Built with SveltePlot, D3, and SunCalc
    {/snippet}
</VisPage>
