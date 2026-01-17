export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["data/.DS_Store","data/clean_park.csv","data/clean_visit.csv","data/national-parks.geojson","data/visit_data.csv","robots.txt"]),
	mimeTypes: {".csv":"text/csv",".geojson":"application/geo+json",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.Dj5msANc.js",app:"_app/immutable/entry/app.CfbqP3NJ.js",imports:["_app/immutable/entry/start.Dj5msANc.js","_app/immutable/chunks/DBlH5Qwd.js","_app/immutable/chunks/DbVLL1rh.js","_app/immutable/chunks/DIWkVe--.js","_app/immutable/entry/app.CfbqP3NJ.js","_app/immutable/chunks/DbVLL1rh.js","_app/immutable/chunks/DXsGKffy.js","_app/immutable/chunks/B975nKYy.js","_app/immutable/chunks/DIWkVe--.js","_app/immutable/chunks/D5o_JJlW.js","_app/immutable/chunks/nqcIIULR.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
