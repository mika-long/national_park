import { clsx } from "clsx";
import "maplibre-gl";
import { timeSecond, timeMinute, timeHour, timeDay, timeMonday, timeTuesday, timeWednesday, timeThursday, timeFriday, timeSaturday, timeSunday, timeWeek, timeMonth, timeYear, utcSecond, utcMinute, utcHour, unixDay, utcMonday, utcTuesday, utcWednesday, utcThursday, utcFriday, utcSaturday, utcSunday, utcWeek, utcMonth, utcYear } from "d3-time";
import "interval-tree-1d";
import { geoTransform } from "d3-geo";
import { deviation, variance, median, mean, sum, mode, max, min, quantile } from "d3-array";
import { y as attributes, z as clsx$1, F as bind_props } from "../../chunks/index.js";
import { twMerge } from "tailwind-merge";
import "d3";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const constant = (x) => () => x;
const durationSecond = 1e3;
const durationMinute = durationSecond * 60;
const durationHour = durationMinute * 60;
const durationDay = durationHour * 24;
const durationWeek = durationDay * 7;
const durationMonth = durationDay * 30;
const durationYear = durationDay * 365;
const durations = /* @__PURE__ */ new Map([
  ["second", durationSecond],
  ["minute", durationMinute],
  ["hour", durationHour],
  ["day", durationDay],
  ["monday", durationWeek],
  ["tuesday", durationWeek],
  ["wednesday", durationWeek],
  ["thursday", durationWeek],
  ["friday", durationWeek],
  ["saturday", durationWeek],
  ["sunday", durationWeek],
  ["week", durationWeek],
  ["month", durationMonth],
  ["year", durationYear]
]);
const timeIntervals = /* @__PURE__ */ new Map([
  ["second", timeSecond],
  ["minute", timeMinute],
  ["hour", timeHour],
  ["day", timeDay],
  // https://github.com/d3/d3-time/issues/62
  ["monday", timeMonday],
  ["tuesday", timeTuesday],
  ["wednesday", timeWednesday],
  ["thursday", timeThursday],
  ["friday", timeFriday],
  ["saturday", timeSaturday],
  ["sunday", timeSunday],
  ["week", timeWeek],
  ["month", timeMonth],
  ["year", timeYear]
]);
const utcIntervals = /* @__PURE__ */ new Map([
  ["second", utcSecond],
  ["minute", utcMinute],
  ["hour", utcHour],
  ["day", unixDay],
  ["monday", utcMonday],
  ["tuesday", utcTuesday],
  ["wednesday", utcWednesday],
  ["thursday", utcThursday],
  ["friday", utcFriday],
  ["saturday", utcSaturday],
  ["sunday", utcSunday],
  ["week", utcWeek],
  ["month", utcMonth],
  ["year", utcYear]
]);
const intervalDuration = /* @__PURE__ */ Symbol("intervalDuration");
const intervalType = /* @__PURE__ */ Symbol("intervalType");
for (const [name, interval] of timeIntervals) {
  interval[intervalDuration] = durations.get(name);
  interval[intervalType] = "time";
}
for (const [name, interval] of utcIntervals) {
  interval[intervalDuration] = durations.get(name);
  interval[intervalType] = "utc";
}
constant({
  ...geoTransform({
    point(x, y) {
      this.stream.point(x, -y);
    }
  }),
  invert(x, y) {
    return [x, -y];
  }
});
const StaticReducer = {
  count: (d) => Array.from(d).length,
  min,
  max,
  mode,
  sum,
  mean,
  median,
  identity: (d) => d,
  variance,
  deviation,
  first: (d) => d[0],
  last: (d) => d.at(-1),
  difference: (d) => d.at(-1) - d[0],
  ratio: (d) => d.at(-1) / d[0]
  // TODO: proportion
  // TODO: proportion-facet
  // TODO: min-index
  // TODO: max-index
};
new Proxy(StaticReducer, {
  get(target, prop) {
    if (String(prop).charAt(0) === "p" && String(prop).length === 3) {
      const p = +String(prop).slice(1) / 100;
      return percentile(p);
    }
    return Reflect.get(target, prop);
  },
  has(target, prop) {
    if (String(prop).charAt(0) === "p" && String(prop).length === 3) {
      return true;
    }
    return Reflect.has(target, prop);
  }
});
function percentile(p) {
  return (I, f) => quantile(I, p, f);
}
function Card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<div${attributes({
      "data-slot": "card",
      class: clsx$1(cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></div>`);
    bind_props($$props, { ref });
  });
}
function Card_content($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<div${attributes({
      "data-slot": "card-content",
      class: clsx$1(cn("px-6", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></div>`);
    bind_props($$props, { ref });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="min-h-screen bg-gray-50 p-8"><div class="container mx-auto max-w-7xl"><h1 class="text-4xl font-bold mb-8">National Parks Visit Data Dashboard</h1> `);
    {
      $$renderer2.push("<!--[-->");
      Card($$renderer2, {
        children: ($$renderer3) => {
          Card_content($$renderer3, {
            class: "p-12",
            children: ($$renderer4) => {
              $$renderer4.push(`<p class="text-center text-lg">Loading data...</p>`);
            },
            $$slots: { default: true }
          });
        },
        $$slots: { default: true }
      });
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
