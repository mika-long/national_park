<script lang="ts">
    import {Plot, Dot, Text, Vector, AxisY} from 'svelteplot';
    import * as SunCalc from 'suncalc'; 
    import * as d3 from 'd3'; 
    
    let year = $state(2026); 
    let loc = $state("en-US");
    let debouncedLoc = $state("en-US"); // reactive state for the debounced value for locale 

    $effect(() => {
        if (!loc) {
            debouncedLoc = 'en-US'; // clear debounced location if input is empty 
            return; 
        }

        const handler = setTimeout(() => {
            debouncedLoc = loc;
        }, 800); 

        // cleanup function 
        return () => clearTimeout(handler); 
    });

    // radius 
    const r = 12; 

    let start = $derived(d3.utcYear(new Date(Date.UTC(year, 0, 1))));
    let days = $derived(d3.utcDays(start, d3.utcYear.offset(start)));
    // Prepare data 
    let data = $derived(days.map(d => {
        // Grid X Calculation 
        const monthStart = d3.utcMonth(d);
        const weekOffset = monthStart.getUTCDay() || 7; 
        const gridX = d.getUTCDate() + weekOffset; 
        // Grid Y calculation 
        const gridY = d.getUTCMonth(); 
        // Moon phase calculation 
        const noon = d3.utcHour.offset(d, 12); 
        const illum = SunCalc.getMoonIllumination(noon); 
        const phaseAngle = 180 - illum.phase * 360; 

        return {
            date: d, 
            gridX, 
            gridY,
            phaseAngle, 
            dayOfMonth: d.getUTCDate()
        };
    }));

    const hemisphere = d3.geoCircle()(); 
    const projection = d3.geoOrthographic().translate([0, 0]); 
    const shapeMoon = {
        draw(context: CanvasRenderingContext2D, length: number, r: number) {
            projection.rotate([length, 0]).scale(12); 
            const path = d3.geoPath(projection, context); 
            path(hemisphere);
        }
    }

    let formatMonth = $derived((monthIndex: number) => {
        const date = new Date(2026, monthIndex, 1);
        // The native Intl API handles the translation automatically
        return date.toLocaleString(debouncedLoc, { month: "long" });
    });
</script>

<div style="margin-bottom: 20px; font-family: system-ui; display: flex; gap: 20px; justify-content: center ">
    <label>
        Year: <input  style="font-family: system-ui" type="number" bind:value={year}/>
    </label>
    <label>
        Locale: <input bind:value={loc} placeholder="e.g., fr-FR, en-US, zh-CN, de-DE"/>
    </label>
</div>

<div style="margin: 0 -14px; background: #111; color: #fff; max-width: none; text-transform: uppercase; width: calc(100% + 28px)">
    <Plot
        aspectRatio={0.6}
        marginLeft={70}
        marginBottom={30}
        marginTop={40}
        width={1152}
        x={{domain: d3.range(1, 40), axis: undefined}} 
        y={{domain: d3.range(12), label: "", reverse: true}}
        length={{domain: [0, 360], range: [0, 360]}}
    >
        <Dot {data} x="gridX" y="gridY" fill="#333" {r}/>
        <Text {data} x="gridX" y="gridY" text="dayOfMonth" fontSize={7} dy={-r-5}/>
        <Vector {data} x="gridX" y="gridY" length="phaseAngle" anchor="start" fill="#fff" {r} shape={shapeMoon}/>
        <AxisY textAnchor="start" tickSize={0} dx={-50} tickFormat={(d) => formatMonth(Number(d))} />
    </Plot>
</div>
